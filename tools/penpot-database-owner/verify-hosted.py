#!/usr/bin/env python3
"""Hosted-only PG15 owner-neutral restore and representative native DDL."""
import hashlib, json, os, pathlib, stat, subprocess, tempfile, time, uuid
from generate import generate
if os.environ.get('GITHUB_ACTIONS') != 'true':
    raise SystemExit('Hosted Actions execution only')
IMAGE = 'postgres@sha256:c961aa287d8698297cb26cdfadfbe9fd2cbaf77e53cfffe9636e8d8a1e4d842c'
TOOLS = pathlib.Path(__file__).resolve().parent
REDACT = []

def run(args, data=None, check=True, timeout=30):
    result = subprocess.run(args, input=data, capture_output=True, timeout=timeout)
    if check and result.returncode:
        detail = result.stderr.decode(errors='replace')
        for secret in REDACT:
            detail = detail.replace(secret, '[REDACTED]')
        print('Disposable database operation diagnostic: '+detail[-1500:], flush=True)
        raise RuntimeError('Hosted database-owner operation rejected')
    return result

with tempfile.TemporaryDirectory(prefix='database-owner-ci-') as temp:
    root = pathlib.Path(temp)
    private = generate(root / 'application')
    assert stat.S_IMODE(private.stat().st_mode) == 0o700
    before = {}
    for path in private.iterdir():
        assert stat.S_IMODE(path.stat().st_mode) == 0o600
        before[path.name] = hashlib.sha256(path.read_bytes()).hexdigest()
    try:
        generate(private)
    except FileExistsError:
        pass
    else:
        raise AssertionError('Existing credential directory replaced')
    env = dict(line.split('=', 1) for line in (private / 'application.env').read_text().splitlines())
    password = env['PENPOT_DATABASE_PASSWORD']
    REDACT.extend([password+'-operator', password])
    assert password not in (private / 'create-owner.sql').read_text()
    assert 'PASSWORD' not in (private / 'create-owner.sql').read_text()
    # This operator credential belongs only to the ephemeral hosted fixture.
    operator_env = root / 'operator.env'
    operator_env.write_text('POSTGRES_USER=recovery_operator\nPOSTGRES_DB=penpot\n'
                            'POSTGRES_PASSWORD='+password+'-operator\nPOSTGRES_HOST_AUTH_METHOD=scram-sha-256\n')
    operator_env.chmod(0o600)
    name = 'database-owner-ci-'+uuid.uuid4().hex
    def sql(database, statement, user='recovery_operator', check=True):
        return run(['docker', 'exec', name, 'psql', '-X', '-v', 'ON_ERROR_STOP=1',
                    '-A', '-t', '-U', user, '-d', database, '-c', statement], check=check)
    def app(statement, check=True):
        # Secret is stdin-fed into an environment variable, never an argv value.
        return run(['docker', 'exec', '-i', name, 'sh', '-ec',
                    'IFS= read -r PGPASSWORD; export PGPASSWORD; exec psql -X -v ON_ERROR_STOP=1 -A -t -h 127.0.0.1 -U penpot_app -d penpot_app -c "$1"',
                    'sh', statement], data=(password+'\n').encode(), check=check)
    try:
        run(['docker', 'pull', '--platform', 'linux/amd64', IMAGE], timeout=180)
        run(['docker', 'run', '-d', '--name', name, '--platform', 'linux/amd64',
             '--network', 'none', '--memory', '384m', '--memory-swap', '384m',
             '--cpus', '.5', '--pids-limit', '128', '--env-file', str(operator_env), IMAGE])
        for _ in range(100):
            # Official initialization temporarily accepts Unix socket connections.
            # Require an authenticated target-DB query on the final TCP listener.
            ready = run(['docker', 'exec', '-i', name, 'sh', '-ec',
                'IFS= read -r PGPASSWORD; export PGPASSWORD; exec psql -X -v ON_ERROR_STOP=1 -A -t -h 127.0.0.1 -U recovery_operator -d penpot -c \"SELECT 1\"'],
                data=(password+'-operator\n').encode(), check=False, timeout=5)
            if ready.returncode == 0 and ready.stdout.strip() == b'1':
                break
            time.sleep(.2)
        else:
            detail = ready.stderr.decode(errors='replace')
            for secret in REDACT:
                detail = detail.replace(secret, '[REDACTED]')
            print('Disposable database readiness diagnostic: '+detail[-1500:], flush=True)
            raise AssertionError('Hosted PostgreSQL never became ready')
        assert sql('penpot', 'SHOW server_version_num').stdout.strip().startswith(b'15')
        sql('penpot', "CREATE EXTENSION \"uuid-ossp\"; CREATE TABLE migrations(module text,step text,created_at timestamp DEFAULT current_timestamp,UNIQUE(module,step)); INSERT INTO migrations(module,step) VALUES ('main','fixture'); CREATE TABLE retained_doc(id serial PRIMARY KEY,title text); INSERT INTO retained_doc(title) VALUES ('retained source document');")
        lineage = sql('penpot', 'SELECT row_to_json(t) FROM retained_doc t ORDER BY id').stdout
        dump = run(['docker', 'exec', name, 'pg_dump', '-U', 'recovery_operator', '-d', 'penpot', '--format=custom', '--no-owner', '--no-acl']).stdout
        dump_path = root / 'retained.dump'; dump_path.write_bytes(dump); dump_path.chmod(0o600)
        run(['docker', 'exec', '-i', name, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'recovery_operator', '-d', 'postgres'], data=(private/'create-owner.sql').read_bytes())
        # Native psql hashes the password client-side; server receives no plaintext literal.
        run(['docker', 'exec', '-i', name, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'recovery_operator', '-d', 'postgres', '-c', '\\password penpot_app'], data=(password+'\n'+password+'\n').encode())
        run(['docker', 'exec', '-i', name, 'pg_restore', '-U', 'recovery_operator', '--dbname=penpot_app', '--role=penpot_app', '--no-owner', '--no-acl', '--exit-on-error'], data=dump)
        assert app('SELECT row_to_json(t) FROM retained_doc t ORDER BY id').stdout == lineage
        assert sql('penpot', 'SELECT row_to_json(t) FROM retained_doc t ORDER BY id').stdout == lineage
        assert app("SELECT rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls FROM pg_roles WHERE rolname=current_user").stdout.strip() == b'f'
        assert app("SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname=current_database()").stdout.strip() == b'penpot_app'
        assert app("SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p','S','v','m') AND c.relowner<>(SELECT oid FROM pg_roles WHERE rolname='penpot_app')").stdout.strip() == b'0'
        assert app("SELECT count(*) FROM pg_auth_members WHERE member=(SELECT oid FROM pg_roles WHERE rolname='penpot_app')").stdout.strip() == b'0'
        assert app('CREATE DATABASE forbidden_database', check=False).returncode != 0
        assert app('CREATE ROLE forbidden_role', check=False).returncode != 0
        assert app('SET ROLE recovery_operator', check=False).returncode != 0
        assert app("SELECT rolsuper FROM pg_roles WHERE rolname='recovery_operator'").stdout.strip() == b't'
        startup = (TOOLS / 'startup-ddl.sql').read_text()
        app(startup)
        assert app('SELECT title FROM owner_probe').stdout.strip() == b'saved by application owner'
        assert app("SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname='penpot'").stdout.strip() == b'recovery_operator'
        for path in private.iterdir():
            assert stat.S_IMODE(path.stat().st_mode) == 0o600
            assert hashlib.sha256(path.read_bytes()).hexdigest() == before[path.name]
        print(json.dumps({'ownerNeutralRestore': True, 'sourceRowsRetained': True,
            'applicationOwnsRestoredRelations': True, 'applicationClusterPrivilegesAbsent': True,
            'operatorOwnershipUnchanged': True, 'authenticatedApplicationSave': True,
            'representativeStartupDdl': True, 'fullNativeStartupProven': False,
            'customerRuntimeChanged': False}))
    finally:
        run(['docker', 'rm', '-f', '-v', name], check=False)

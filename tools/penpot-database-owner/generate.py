#!/usr/bin/env python3
"""Prepare a new private app-owner credential set; no database connection."""
import argparse, hashlib, json, os, pathlib, secrets
USER = 'penpot_app'
DATABASE = 'penpot_app'

def generate(output):
    output = pathlib.Path(output).absolute()
    parent = output.parent.resolve(strict=True)
    if not parent.is_dir() or output.name in ('', '.', '..'):
        raise ValueError('New output directory required')
    output = parent / output.name
    output.mkdir(mode=0o700)
    os.chmod(output, 0o700)
    password = secrets.token_urlsafe(32)
    files = {
        'application.env': (
            f'PENPOT_DATABASE_URI=postgresql://penpot-postgres/{DATABASE}\n'
            f'PENPOT_DATABASE_USERNAME={USER}\n'
            f'PENPOT_DATABASE_PASSWORD={password}\n').encode(),
        'create-owner.sql': (
            '\\set ON_ERROR_STOP on\n'
            f"CREATE ROLE {USER} LOGIN PASSWORD '{password}' NOSUPERUSER NOCREATEDB "
            'NOCREATEROLE NOREPLICATION NOBYPASSRLS;\n'
            f'CREATE DATABASE {DATABASE} OWNER {USER} TEMPLATE template0;\n').encode(),
    }
    records = []
    def write(name, data):
        fd = os.open(output / name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
        with os.fdopen(fd, 'wb') as stream:
            os.fchmod(stream.fileno(), 0o600)
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
    for name, data in files.items():
        write(name, data)
        records.append({'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
    write('manifest.json', (json.dumps({'version': 1, 'applicationUser': USER,
        'applicationDatabase': DATABASE, 'databaseOwnerNotDmlOnly': True, 'files': records}, indent=2)+'\n').encode())
    fd = os.open(output, os.O_RDONLY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)
    return output

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    try:
        generate(args.output)
    except (OSError, ValueError):
        parser.exit(1, 'Preparation refused. Preserve existing or partial files; no rotation performed.\n')
    print('Prepared private application-owner files. No database or runtime changed.')

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const directory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'investigations');
const gate = path.join(directory, 'check-local-capacity.mjs');

test('unavailable capacity and malformed thresholds fail closed', () => {
  for (const threshold of ['1000000000', '0', '-1', 'Infinity', 'not-a-number']) {
    const result = spawnSync(process.execPath, [gate, os.tmpdir(), threshold], { encoding: 'utf8' });
    assert.equal(result.status, 1);
  }
  const absent = spawnSync(process.execPath, [gate, '/capacity-fixture-does-not-exist', '12']);
  assert.equal(absent.status, 1);
});

test('pull and startup never contact Docker after a failed host capacity gate', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'capacity-boundary-'));
  const marker = path.join(temporary, 'docker-called');
  fs.writeFileSync(path.join(temporary, 'docker'), `#!/bin/sh\ntouch '${marker}'\n`, { mode: 0o755 });
  try {
    for (const action of ['pull', 'up']) {
      const result = spawnSync('bash', [path.join(directory, 'penpot-local.sh'), action], {
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: `${temporary}:${path.dirname(process.execPath)}:${process.env.PATH}`,
          PENPOT_REQUIRED_FREE_GIB: '1000000000',
          PENPOT_QA_ENV_FILE: '/private/unused-fixture.env',
        },
      });
      assert.equal(result.status, 1);
      assert.equal(JSON.parse(result.stdout).status, 'blocked');
      assert.equal(fs.existsSync(marker), false);
    }
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

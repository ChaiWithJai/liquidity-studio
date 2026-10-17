import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
const fixture = new URL('./fixtures/lifecycle-child.js', import.meta.url);
function child(t, env = {}) {
  const proc = spawn(process.execPath, [fixture.pathname], { env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  proc.stdout.on('data', chunk => { output += chunk; });
  proc.stderr.on('data', chunk => { output += chunk; });
  const exited = once(proc, 'exit');
  t.after(() => { if (proc.exitCode === null) proc.kill('SIGKILL'); });
  return { proc, exited, output: () => output };
}
async function waitFor(child, pattern) {
  const deadline = Date.now() + 3000;
  while (!pattern.test(child.output())) {
    if (Date.now() > deadline || child.proc.exitCode !== null) throw new Error(`Missing ${pattern}: ${child.output()}`);
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

test('occupied configured port exits nonzero without selecting another port', async t => {
  const listener = http.createServer();
  await new Promise(resolve => listener.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => listener.close(resolve)));
  const running = child(t, { TEST_PORT: String(listener.address().port) });
  const [code] = await running.exited;
  assert.equal(code, 1);
  assert.match(running.output(), /EADDRINUSE/);
  assert.doesNotMatch(running.output(), /"event":"listening"/);
});
for (const signal of ['SIGTERM', 'SIGINT']) {
  test(`${signal} drains the active HTTP request`, async t => {
    const running = child(t);
    await waitFor(running, /"port":\d+/);
    const port = JSON.parse(running.output().trim()).port;
    const response = fetch(`http://127.0.0.1:${port}/slow`).then(res => res.text());
    await waitFor(running, /request_started/);
    running.proc.kill(signal);
    assert.equal(await response, 'completed');
    assert.equal((await running.exited)[0], 0);
    assert.match(running.output(), /shutdown_complete/);
  });
}
test('stalled request is terminated at the drain deadline', async t => {
  const running = child(t);
  await waitFor(running, /"port":\d+/);
  const port = JSON.parse(running.output().trim()).port;
  const request = fetch(`http://127.0.0.1:${port}/stalled`).catch(() => null);
  await waitFor(running, /request_started/);
  running.proc.kill('SIGTERM');
  assert.equal((await running.exited)[0], 1);
  await request;
  assert.match(running.output(), /shutdown_timeout/);
});

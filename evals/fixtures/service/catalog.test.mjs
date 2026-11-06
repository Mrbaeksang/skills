import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
test('unknown ID uses the public error contract', () => {
  const result = spawnSync(process.execPath, ['cli.mjs', 'get', 'missing'], { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.equal(JSON.parse(result.stderr).error.code, 'NOT_FOUND');
});

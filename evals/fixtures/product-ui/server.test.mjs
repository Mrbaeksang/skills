import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createFixture } from './server.mjs';

test('synthetic authority preserves per-profile state and reconciles a committed write after a lost reply', async t => {
  const server = createFixture(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const post = (path, body) => fetch(origin + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const get = async id => (await fetch(origin + '/api/tasks?profileId=' + id)).json();
  await post('/fixture/control', { delayMs: 10, loseReply: true });
  assert.equal((await post('/api/tasks', { profileId: 'p1', taskId: 'walk', done: true })).status, 503);
  assert.deepEqual((await get('p1')).done, ['walk']);
  assert.deepEqual((await get('p2')).done, []);
  await post('/api/tasks', { profileId: 'p1', taskId: 'walk', done: true });
  assert.deepEqual((await get('p1')).done, ['walk']);
  assert.equal((await post('/api/tasks', { profileId: 'p1', taskId: 'missing', done: true })).status, 400);
  assert.equal((await post('/fixture/control', { delayMs: -1, loseReply: false })).status, 400);
  assert.equal((await fetch(origin + '/server.mjs')).status, 404);
});

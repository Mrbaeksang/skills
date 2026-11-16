import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const profiles = [{ id: 'p1', name: '김하늘', birthDate: '1988-04-12' }, { id: 'p2', name: '김하늘', birthDate: '1996-09-03' }];
const taskIds = new Set(['walk', 'call', 'tidy']);
const staticFiles = new Map(['tasks.html', 'topics.html', 'operator.html', 'styles.css', 'topic.svg'].map(name => ['/' + name, name]));

export function createFixture() {
  const tasks = new Map(profiles.map(profile => [profile.id, new Set()]));
  let delayMs = 0, loseReply = false;
  const json = (res, status, data) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(data)); };
  const snapshot = profileId => ({ profileId, done: [...tasks.get(profileId)] });
  async function body(req) {
    const chunks = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 4096) throw Error('Body too large'); chunks.push(chunk); }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  }
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (req.method === 'GET' && url.pathname === '/api/profiles') return json(res, 200, { profiles });
      if (req.method === 'GET' && url.pathname === '/api/tasks') {
        const id = url.searchParams.get('profileId');
        return tasks.has(id) ? json(res, 200, snapshot(id)) : json(res, 404, { error: 'Unknown profile' });
      }
      if (req.method === 'POST' && url.pathname === '/api/tasks') {
        const { profileId, taskId, done } = await body(req);
        if (!tasks.has(profileId) || !taskIds.has(taskId) || typeof done !== 'boolean') return json(res, 400, { error: 'Invalid task assignment' });
        const wait = delayMs, lost = loseReply;
        await new Promise(resolve => setTimeout(resolve, wait));
        const state = tasks.get(profileId); done ? state.add(taskId) : state.delete(taskId);
        return lost ? json(res, 503, { error: 'Reply unavailable' }) : json(res, 200, snapshot(profileId));
      }
      if (req.method === 'POST' && url.pathname === '/fixture/control') {
        const input = await body(req);
        if (!Number.isInteger(input.delayMs) || input.delayMs < 0 || input.delayMs > 2000 || typeof input.loseReply !== 'boolean') return json(res, 400, { error: 'Invalid fixture control' });
        delayMs = input.delayMs; loseReply = input.loseReply; return json(res, 200, { delayMs, loseReply });
      }
      if (req.method === 'GET' && url.pathname === '/api/operations') return json(res, 200, { provider: 'Synthetic Queue', jobId: 'job-001', status: 'FAILED', retryAllowed: true });
      const file = staticFiles.get(url.pathname === '/' ? '/tasks.html' : url.pathname);
      if (req.method !== 'GET' || !file) return json(res, 404, { error: 'Not found' });
      const type = file.endsWith('.css') ? 'text/css' : file.endsWith('.svg') ? 'image/svg+xml' : 'text/html';
      res.writeHead(200, { 'content-type': type + '; charset=utf-8', 'cache-control': 'no-store' });
      res.end(await readFile(path.join(root, file)));
    } catch { if (!res.headersSent) json(res, 400, { error: 'Invalid request' }); else res.end(); }
  });
  server.requestTimeout = 5000; server.headersTimeout = 5000;
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createFixture();
  server.listen(Number(process.env.PORT ?? 0), '127.0.0.1', () => console.log(`http://127.0.0.1:${server.address().port}`));
}

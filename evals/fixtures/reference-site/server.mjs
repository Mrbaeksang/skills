// Local stand-in for an operating service: serves the reference page and its streaming answer API.
// The product page (app.html) is ours; the reference (ref.html, this server's /ref/* routes) must not be edited.
import http from 'node:http';
import fs from 'node:fs';
const port = Number(process.env.PORT || 4317);
const words = '반납일이 오늘인 책은 한 권이에요. 연장하면 12월 4일까지 빌릴 수 있어요.'.split(' ');
http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/ref') return file(res, 'ref.html');
  if (req.url === '/app') return file(res, 'app.html');
  if (req.url === '/ref/stream') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store' });
    res.write(': ping\n\n');
    let i = 0;
    const timer = setInterval(() => {
      if (i < words.length) { res.write(`event: delta\ndata: ${JSON.stringify({ i, t: (i ? ' ' : '') + words[i] })}\n\n`); i++; }
      else { res.write(`event: done\ndata: ${JSON.stringify({ tokens: words.length })}\n\n`); clearInterval(timer); res.end(); }
    }, 90);
    req.on('close', () => clearInterval(timer));
    return;
  }
  if (req.url === '/app/answer.json') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(JSON.stringify({ text: words.join(' ') })); }
  res.writeHead(404); res.end();
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}`));
function file(res, name) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(fs.readFileSync(new URL(name, import.meta.url))); }

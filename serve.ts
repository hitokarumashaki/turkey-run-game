// Turkey Trot: a tiny static server for local play-testing (Node 22, stdlib only).
// Serves this repository's game/ folder at http://localhost:8080 so the
// game can be played in a desktop browser exactly as the grader serves it.
//
//   node serve.ts

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const gameDir = join(fileURLToPath(new URL('.', import.meta.url)), 'game');
const port = Number(process.env.PORT || '8080');

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const server = createServer(async (req, res) => {
  const rawPath = req.url.split('?')[0];
  const path = rawPath === '/' ? '/index.html' : rawPath;
  try {
    const data = await readFile(join(gameDir, path));
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  }
});

server.listen(port, () => {
  console.log(`Turkey Trot serves at http://localhost:${port}`);
});

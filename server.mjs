import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import chat from './api/chat.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/api/chat') return await chat(req, res);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      return res.end();
    }

    const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
    const file = resolve(root, relativePath);
    const publicPath = relativePath === 'index.html' || relativePath === 'support.js'
      || /^(css|js|assets|uploads)\//.test(relativePath);
    const contentType = contentTypes[extname(file)];
    // Serve only browser assets. Environment files and server prompts stay private.
    if (!publicPath || !contentType || !file.startsWith(root) || relativePath.split(/[\\/]/).some(part => part.startsWith('.'))) {
      res.writeHead(404);
      return res.end();
    }
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 400);
    res.end();
  }
}).listen(Number(process.env.PORT || 3000), '127.0.0.1', () => {
  console.log(`Stellar Scripts is running at http://localhost:${process.env.PORT || 3000}`);
});

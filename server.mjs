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
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
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
    const publicPath = relativePath === 'index.html' || relativePath === 'credits.html' || relativePath === 'support.js'
      || /^(css|js|assets|uploads)\//.test(relativePath);
    const contentType = contentTypes[extname(file)];
    // Serve only browser assets. Environment files and server prompts stay private.
    if (!publicPath || !contentType || !file.startsWith(root) || relativePath.split(/[\\/]/).some(part => part.startsWith('.'))) {
      res.writeHead(404);
      return res.end();
    }
    const content = await readFile(file);
    // Byte ranges let browsers seek inside narration audio and video.
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range && (range[1] || range[2])) {
      const size = content.length;
      const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
      const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      if (start >= size || start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${size}` });
        return res.end();
      }
      res.writeHead(206, { 'Content-Type': contentType, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
      return res.end(req.method === 'HEAD' ? undefined : content.subarray(start, end + 1));
    }
    res.writeHead(200, { 'Content-Type': contentType, 'Accept-Ranges': 'bytes', 'Content-Length': content.length });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 400);
    res.end();
  }
}).listen(Number(process.env.PORT || 3000), '127.0.0.1', () => {
  console.log(`Stellar Scripts is running at http://localhost:${process.env.PORT || 3000}`);
});

import { cp, mkdir, rm } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
const publicPaths = ['index.html', 'credits.html', 'support.js', 'css', 'js', 'assets', 'uploads'];

await rm(output, { recursive: true, force: true });
await mkdir(output);

for (const path of publicPaths) {
  await cp(new URL(path, root), new URL(path, output), { recursive: true });
}

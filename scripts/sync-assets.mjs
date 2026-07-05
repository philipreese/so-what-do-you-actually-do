import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(projectRoot, 'content', 'assets');
const destDir = path.join(projectRoot, 'public', 'assets');

if (!fs.existsSync(srcDir)) {
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });

let count = 0;
for (const file of fs.readdirSync(srcDir)) {
  const ext = file.toLowerCase();
  if (!ext.endsWith('.jpg') && !ext.endsWith('.png')) continue;
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  count++;
}

console.log(`Synced ${count} image(s) from assets/ into public/assets/`);

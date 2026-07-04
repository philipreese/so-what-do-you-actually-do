import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(siteDir, '..');
const srcDir = path.join(repoRoot, 'assets');
const destDir = path.join(siteDir, 'public', 'assets');

if (!fs.existsSync(srcDir)) {
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });

let count = 0;
for (const file of fs.readdirSync(srcDir)) {
  if (!file.toLowerCase().endsWith('.jpg')) continue;
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  count++;
}

console.log(`Synced ${count} image(s) from assets/ into public/assets/`);

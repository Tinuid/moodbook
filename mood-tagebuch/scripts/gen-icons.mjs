// Rasterize public/favicon.svg into the PWA PNG icons.
// Run: node scripts/gen-icons.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(join(root, 'public', 'favicon.svg'));

for (const size of [192, 512]) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(join(root, 'public', `icon-${size}.png`));
  console.log(`wrote public/icon-${size}.png`);
}

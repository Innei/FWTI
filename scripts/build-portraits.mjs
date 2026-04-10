import { readdir, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = process.env.PORTRAIT_SRC || '/Users/innei/Downloads/fwti';
const OUT = join(__dirname, '..', 'src', 'assets', 'portraits');
const SIZE = 800;
const QUALITY = 80;

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f));
let ok = 0;
for (const f of files) {
  const m = f.match(/^([A-Z]{4})_/);
  if (!m) {
    console.warn(`skip (no code prefix): ${f}`);
    continue;
  }
  const code = m[1];
  const outPath = join(OUT, `${code}.webp`);
  await sharp(join(SRC, f))
    .resize(SIZE, SIZE, { fit: 'cover' })
    .webp({ quality: QUALITY })
    .toFile(outPath);
  ok++;
  console.log(`${f} -> ${code}.webp`);
}
console.log(`done: ${ok}/${files.length}`);

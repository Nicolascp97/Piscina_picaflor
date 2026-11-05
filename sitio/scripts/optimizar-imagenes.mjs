// Uso: node scripts/optimizar-imagenes.mjs <entrada> <salida.webp> [anchoMax=1600] [maxKB=280]
// Acepta HEIC/HEIF, JPG y PNG. Corrige la rotacion, achica y baja la calidad hasta pesar <= maxKB.
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, extname } from 'node:path';
import sharp from 'sharp';
import convert from 'heic-convert';

const [entrada, salida, anchoArg, kbArg] = process.argv.slice(2);
if (!entrada || !salida) {
  console.error('Uso: node scripts/optimizar-imagenes.mjs <entrada> <salida.webp> [anchoMax] [maxKB]');
  process.exit(1);
}
const ancho = Number(anchoArg || 1600);
const maxBytes = Number(kbArg || 280) * 1024;

let buf = readFileSync(entrada);
const ext = extname(entrada).toLowerCase();
if (ext === '.heic' || ext === '.heif') {
  buf = Buffer.from(await convert({ buffer: buf, format: 'JPEG', quality: 0.92 }));
}

const base = sharp(buf).rotate().resize({ width: ancho, withoutEnlargement: true });
let q = 82;
let out = await base.clone().webp({ quality: q }).toBuffer();
while (out.length > maxBytes && q > 30) {
  q -= 6;
  out = await base.clone().webp({ quality: q }).toBuffer();
}
mkdirSync(dirname(salida), { recursive: true });
writeFileSync(salida, out);
const meta = await sharp(out).metadata();
console.log(entrada + ' -> ' + salida + ' | ' + meta.width + 'x' + meta.height + ' | ' + Math.round(out.length / 1024) + ' KB | calidad ' + q);

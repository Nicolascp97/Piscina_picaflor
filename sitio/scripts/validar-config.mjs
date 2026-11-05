// Valida negocio.json. En PRODUCCION (Vercel production o MODO=prod) falla si queda
// algun [POR CONFIRMAR], si faltan datos obligatorios o si falta el endpoint del Pase.
// En preview/desarrollo solo avisa.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const aqui = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(aqui, '..', 'src', 'config', 'negocio.json'), 'utf8'));
const prod = process.env.VERCEL_ENV === 'production' || process.env.MODO === 'prod';
const avance = process.env.PUBLIC_MODO_AVANCE === '1';

const pendientes = [];
function recorrer(v, ruta) {
  if (typeof v === 'string') {
    if (v.includes('[POR CONFIRMAR]')) pendientes.push(ruta);
  } else if (Array.isArray(v)) {
    v.forEach((x, i) => recorrer(x, ruta + '[' + i + ']'));
  } else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      if (k.startsWith('_')) continue;
      recorrer(x, ruta ? ruta + '.' + k : k);
    }
  }
}
recorrer(cfg, '');

const errores = [];
if (prod && avance) {
  console.log("AVISO: MODO AVANCE activo. Se publica una pagina previa (formulario cerrado, sin datos pendientes). NO es el lanzamiento: para lanzar, quitar PUBLIC_MODO_AVANCE.");
} else if (prod) {
  for (const p of pendientes) errores.push('Dato pendiente: ' + p);
  const wsp = String(cfg.negocio.whatsapp_e164).replace(/\s/g, '');
  if (!/^\+?569\d{8}$/.test(wsp)) errores.push('negocio.whatsapp_e164 debe ser +569XXXXXXXX');
  if (!Array.isArray(cfg.faq) || cfg.faq.length < 3) errores.push('faq: hacen falta al menos 3 preguntas reales');
  if (!Number.isInteger(Number(cfg.pase.cupos_totales))) errores.push('pase.cupos_totales debe ser un numero entero');
  for (const f of ['emision_hasta', 'vigencia_hasta']) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(cfg.pase[f]))) errores.push('pase.' + f + ' debe ser AAAA-MM-DD');
  }
  const ep = process.env.PUBLIC_PASE_ENDPOINT || '';
  if (!ep) errores.push('Falta la variable PUBLIC_PASE_ENDPOINT (URL del Apps Script de PRODUCCION)');
  if (!process.env.PUBLIC_META_PIXEL_ID) errores.push('Falta la variable PUBLIC_META_PIXEL_ID (ID del Pixel de Meta)');
  if (/prueba|test/i.test(ep)) errores.push('PUBLIC_PASE_ENDPOINT parece de pruebas');
}

console.log('[validar-config] modo: ' + (prod ? 'PRODUCCION' : 'preview/desarrollo') + ' | pendientes: ' + pendientes.length);
if (!prod && pendientes.length) {
  console.log('  (en preview se ven marcados; en produccion bloquean el build)');
  console.log('  - ' + pendientes.join('\n  - '));
}
if (errores.length) {
  console.error('\nX NO SE PUEDE PUBLICAR. Falta completar:\n  - ' + errores.join('\n  - '));
  process.exit(1);
}
console.log('OK configuracion valida para este modo');

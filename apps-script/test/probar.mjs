// Prueba la logica de Codigo.gs con una hoja simulada (sin tocar Google). Uso: node test/probar.mjs
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const codigoGs = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'Codigo.gs'), 'utf8');
const filas = [];                       // sin encabezado
const props = { ENTORNO: 'test', CONFIG_URL: 'https://ejemplo.test/pase-config.json' };
const correos = [];
let reglasSitio = { activo: true, cupos_totales: 3, vigencia_hasta: '2027-01-31', emision_hasta: '2027-01-01', dias_validos: 'lunes a jueves' };

const hojaFalsa = {
  getLastRow: () => filas.length + 1,
  getRange: (r, c, nr, nc) => ({
    getValues: () => filas.slice(r - 2, r - 2 + nr).map((f) => f.slice(c - 1, c - 1 + nc)),
    setValues: (v) => { if (r === 1) return { setFontWeight() {} }; const dest = filas[r - 2] || (filas[r - 2] = []); v[0].forEach((x, i) => { dest[c - 1 + i] = x; }); },
    setNumberFormat() {}, setDataValidation() {}, setFontWeight() {}, setValue(v) { filas[r - 2][c - 1] = v; },
  }),
  setFrozenRows() {},
};
const ctx = {
  console, Date, Math, JSON, Object, String, Number, isFinite, Error,
  SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => hojaFalsa, insertSheet: () => hojaFalsa }), flush() {}, newDataValidation: () => ({ requireValueInList() { return this; }, build() { return {}; } }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props[k] || null, setProperty: (k, v) => { props[k] = v; } }) },
  CacheService: { getScriptCache: () => ({ get: () => null, put() {} }) },
  UrlFetchApp: { fetch: () => ({ getResponseCode: () => 200, getContentText: () => JSON.stringify({ pase: reglasSitio }) }) },
  Utilities: { formatDate: (d, z, f) => { const p = (n) => String(n).padStart(2, '0'); const s = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); return f.includes('HH') ? s + 'T' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) : s; } },
  MailApp: { sendEmail: (m) => correos.push(m) },
  ContentService: { createTextOutput: (t) => { const o = { t, setMimeType() { return o; } }; return o; }, MimeType: { JSON: 1 } },
};
vm.createContext(ctx);
vm.runInContext(codigoGs, ctx);

const base = { accion: 'emitir', nombre: 'Ana Pérez', whatsapp: '9 1234 5678', email: '', consentimiento_ofertas: false, hp: '', t_ms: 5000, utm_content: 'A-zona', request_id: 'r1' };
const emitir = (o) => ctx.emitir_({ ...base, ...o });
let fallos = 0;
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FALLA') + ' ' + m); if (!c) fallos++; };

let r = emitir({});
ok(r.estado === 'nuevo' && /^PICA-[A-Z0-9]{4}$/.test(r.pase.codigo), 'primer envio crea un Pase ' + r.pase?.codigo);
const cod1 = r.pase.codigo;
r = emitir({ whatsapp: '+56 9 1234 5678', request_id: 'r2' });
ok(r.estado === 'existente' && r.pase.codigo === cod1 && filas.length === 1, 'mismo WhatsApp en otro formato devuelve el mismo Pase, 1 sola fila');
r = emitir({ whatsapp: '0912345678', request_id: 'r3', consentimiento_ofertas: true, consentimiento_version: 'v1' });
ok(r.estado === 'existente' && filas[0][ctx.COL.consentimiento_ofertas] === 'SI' && filas[0][ctx.COL.consentimiento_fecha], 'consentimiento posterior se registra con fecha en el mismo Pase');
for (let i = 0; i < 20; i++) emitir({ whatsapp: '9 1234 5678', request_id: 'x' + i });
ok(filas.length === 1, '20 envios seguidos del mismo numero siguen siendo 1 fila');
r = emitir({ whatsapp: '9 8765 4321', request_id: 'r4', correo: 'x', email: 'ana@ejemplo.cl' });
ok(r.estado === 'nuevo' && r.correo === true && correos.length === 1 && filas.length === 2, 'segundo numero crea Pase y manda la copia por correo');
emitir({ whatsapp: '9 1111 1111', request_id: 'r5' });
r = emitir({ whatsapp: '9 2222 2222', request_id: 'r6' });
ok(r.estado === 'agotado' && filas.length === 3, 'con cupos_totales=3 el cuarto numero queda agotado');
filas[2][ctx.COL.estado] = 'anulado';
r = emitir({ whatsapp: '9 2222 2222', request_id: 'r7' });
ok(r.estado === 'nuevo', 'una fila anulada libera el cupo (QA)');
ok(emitir({ nombre: 'A' }).campo === 'nombre', 'nombre muy corto es invalido');
ok(emitir({ whatsapp: '12345678' }).campo === 'whatsapp', 'WhatsApp de 8 digitos es invalido');
ok(emitir({ email: 'sin-arroba' }).campo === 'correo', 'correo malo es invalido');
ok(emitir({ hp: 'bot' }).estado === 'invalido' && emitir({ t_ms: 800 }).estado === 'invalido', 'campo trampa y envio muy rapido se descartan');
reglasSitio = { ...reglasSitio, activo: false };
ctx.CacheService.getScriptCache = () => ({ get: () => null, put() {} });
ok(emitir({ whatsapp: '9 3333 3333', request_id: 'r8' }).estado === 'cerrado', 'activo:false cierra la emision');
reglasSitio = { ...reglasSitio, activo: true, emision_hasta: '2020-01-01' };
ok(emitir({ whatsapp: '9 3333 3333', request_id: 'r9' }).estado === 'cerrado', 'pasada la fecha emision_hasta se cierra');
const g = JSON.parse(ctx.doGet({ parameter: { accion: 'consultar', codigo: cod1 } }).t);
ok(g.estado === 'emitido' && g.nombre_pila === 'Ana' && !('whatsapp_e164' in g) && !('email' in g) && !JSON.stringify(g).includes('1234'), 'consultar devuelve estado y nombre de pila, sin telefono ni correo');
ok(JSON.parse(ctx.doGet({ parameter: { accion: 'consultar', codigo: 'PICA-ZZZZ' } }).t).estado === 'no_existe', 'codigo inexistente -> no_existe');
filas[0][ctx.COL.vigencia_hasta] = '2020-01-01';
ok(JSON.parse(ctx.doGet({ parameter: { accion: 'consultar', codigo: cod1 } }).t).estado === 'vencido', 'Pase pasado de vigencia se ve VENCIDO');
console.log(fallos ? '\n' + fallos + ' FALLA(S)' : '\nTodo OK');
process.exit(fallos ? 1 : 0);

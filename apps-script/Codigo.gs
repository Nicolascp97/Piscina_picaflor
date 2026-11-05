/**
 * Backend del Pase de Apertura - Piscina Picaflor (Google Apps Script, vinculado a la planilla).
 * Sin secretos en el codigo: todo vive en Propiedades del script (ver README.md).
 *   CONFIG_URL      https://piscinapicaflor.cl/pase-config.json  (reglas del Pase: misma fuente que el sitio)
 *   ENTORNO         "prod" o "test"   (test escribe en la hoja "Pases-PRUEBAS")
 *   CORREO_DUENO    correo que recibe el resumen semanal
 *   CUPOS_OVERRIDE, VIGENCIA_OVERRIDE   solo en el script de PRUEBAS, para forzar agotado / vencido
 */
var ZONA = 'America/Santiago';
var ENCABEZADOS = ['codigo', 'fecha_emision', 'nombre', 'whatsapp_e164', 'email', 'celebracion',
  'consentimiento_ofertas', 'consentimiento_fecha', 'consentimiento_version', 'estado', 'vigencia_hasta',
  'fecha_canje', 'fecha_reserva', 'valor_reserva', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
  'utm_term', 'conjunto', 'fbclid', 'referrer', 'navegador', 'request_id', 'entorno', 'notas'];
var COL = {};
ENCABEZADOS.forEach(function (n, i) { COL[n] = i; });

function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function esTest_() { return prop_('ENTORNO') === 'test'; }
function nombreHoja_() { return esTest_() ? 'Pases-PRUEBAS' : 'Pases'; }
function ahora_() { return Utilities.formatDate(new Date(), ZONA, "yyyy-MM-dd'T'HH:mm:ss"); }
function hoy_() { return Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd'); }

function hoja_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var h = ss.getSheetByName(nombreHoja_());
  if (!h) { h = ss.insertSheet(nombreHoja_()); }
  if (h.getLastRow() === 0) {
    h.getRange(1, 1, 1, ENCABEZADOS.length).setValues([ENCABEZADOS]).setFontWeight('bold');
    h.setFrozenRows(1);
    var regla = SpreadsheetApp.newDataValidation().requireValueInList(['emitido', 'canjeado', 'vencido', 'anulado'], true).build();
    h.getRange(2, COL.estado + 1, 2000, 1).setDataValidation(regla);
    h.getRange(2, COL.whatsapp_e164 + 1, 2000, 1).setNumberFormat('@');
  }
  return h;
}

/** Ejecutar UNA vez a mano despues de pegar el codigo: crea la hoja con encabezados y los triggers. */
function instalar() {
  hoja_();
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('marcarVencidos').timeBased().everyDays(1).atHour(3).create();
  ScriptApp.newTrigger('resumenSemanal').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(9).create();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Reglas del Pase: del sitio (cache 10 min), con respaldo guardado si el sitio no responde. */
function reglas_() {
  var cache = CacheService.getScriptCache();
  var c = cache.get('reglas');
  if (c) return JSON.parse(c);
  var datos = null;
  try {
    var r = UrlFetchApp.fetch(prop_('CONFIG_URL'), { muteHttpExceptions: true });
    if (r.getResponseCode() === 200) {
      datos = JSON.parse(r.getContentText()).pase;
      PropertiesService.getScriptProperties().setProperty('REGLAS_RESPALDO', JSON.stringify(datos));
    }
  } catch (err) { /* usamos el respaldo */ }
  if (!datos) { var b = prop_('REGLAS_RESPALDO'); datos = b ? JSON.parse(b) : null; }
  if (datos) cache.put('reglas', JSON.stringify(datos), 600);
  return datos;
}

function normalizarWsp_(v) {
  var n = String(v || '').replace(/\D/g, '');
  if (n.indexOf('56') === 0) n = n.slice(2); else if (n.indexOf('0') === 0) n = n.slice(1);
  return /^9\d{8}$/.test(n) ? '+56' + n : null;
}

function conjunto_(utmContent) {
  var c = String(utmContent || '').charAt(0).toUpperCase();
  return (c === 'A' || c === 'B' || c === 'R') ? c : '';
}

function codigoNuevo_(existentes) {
  var L = 'ABCDEFGHJKLMNPQRSTUVWXYZ', A = L + '23456789';
  for (var i = 0; i < 200; i++) {
    var s = '';
    for (var k = 0; k < 4; k++) s += A.charAt(Math.floor(Math.random() * A.length));
    if (!/[A-Z]/.test(s)) continue;          // siempre al menos una letra: no choca con PICA-0001 de fidelidad
    var cod = 'PICA-' + s;
    if (!existentes[cod]) return cod;
  }
  throw new Error('no se pudo generar codigo');
}

/* ------------------------- Emitir un Pase ------------------------- */
function doPost(e) {
  var p;
  try { p = JSON.parse(e.postData.contents); } catch (err) { return json_({ estado: 'invalido' }); }
  if (!p || p.accion !== 'emitir') return json_({ estado: 'invalido' });
  return json_(emitir_(p));
}

function emitir_(p) {
  if (p.hp) return { estado: 'invalido' };                  // campo trampa: bot
  if (Number(p.t_ms) < 3000) return { estado: 'invalido' };  // demasiado rapido: bot
  var nombre = String(p.nombre || '').replace(/\s+/g, ' ').trim();
  if (nombre.length < 2 || nombre.length > 60) return { estado: 'invalido', campo: 'nombre' };
  var wsp = normalizarWsp_(p.whatsapp);
  if (!wsp) return { estado: 'invalido', campo: 'whatsapp' };
  var email = String(p.email || '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { estado: 'invalido', campo: 'correo' };

  var reglas = reglas_();
  if (!reglas) { if (!esTest_()) return { estado: 'cerrado' }; reglas = { activo: true }; }
  if (reglas.activo === false) return { estado: 'cerrado' };
  var fechaRe = /^\d{4}-\d{2}-\d{2}$/;
  if (fechaRe.test(String(reglas.emision_hasta)) && hoy_() > reglas.emision_hasta) return { estado: 'cerrado' };

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  var res;
  try { res = escribir_(p, nombre, wsp, email, reglas); } finally { lock.releaseLock(); }
  if (res.estado === 'nuevo' && email) res.correo = enviarCopia_(email, res.pase);
  return res;
}

function escribir_(p, nombre, wsp, email, reglas) {
  var h = hoja_();
  var ultima = h.getLastRow();
  var datos = ultima > 1 ? h.getRange(2, 1, ultima - 1, ENCABEZADOS.length).getValues() : [];
  var codigos = {}, activos = 0, previo = -1;
  for (var i = 0; i < datos.length; i++) {
    var f = datos[i];
    codigos[f[COL.codigo]] = true;
    if (f[COL.estado] === 'anulado') continue;      // las filas de prueba anuladas no cuentan ni bloquean
    activos++;
    if (previo < 0 && (String(f[COL.whatsapp_e164]) === wsp || (p.request_id && f[COL.request_id] === p.request_id))) previo = i;
  }
  var consiente = p.consentimiento_ofertas === true;
  if (previo >= 0) {                                   // idempotencia: mismo WhatsApp o mismo envio reintentado
    var fila = datos[previo];
    if (consiente && fila[COL.consentimiento_ofertas] !== 'SI') {
      var r = h.getRange(previo + 2, COL.consentimiento_ofertas + 1, 1, 3);
      r.setValues([['SI', ahora_(), String(p.consentimiento_version || '')]]);
    }
    return { estado: 'existente', pase: { codigo: fila[COL.codigo], nombre: fila[COL.nombre], vigencia_hasta: String(fila[COL.vigencia_hasta]) } };
  }
  var cupos = Number(esTest_() && prop_('CUPOS_OVERRIDE') ? prop_('CUPOS_OVERRIDE') : reglas.cupos_totales);
  if (isFinite(cupos) && cupos > 0 && activos >= cupos) return { estado: 'agotado' };

  var vig = String(reglas.vigencia_hasta);
  if (esTest_() && prop_('VIGENCIA_OVERRIDE')) vig = prop_('VIGENCIA_OVERRIDE');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(vig)) {
    if (!esTest_()) return { estado: 'cerrado' };
    vig = Utilities.formatDate(new Date(Date.now() + 30 * 86400000), ZONA, 'yyyy-MM-dd');
  }
  var codigo = codigoNuevo_(codigos);
  var ahora = ahora_();
  var cut = function (v) { return String(v || '').slice(0, 120); };
  var nueva = [];
  ENCABEZADOS.forEach(function () { nueva.push(''); });
  nueva[COL.codigo] = codigo; nueva[COL.fecha_emision] = ahora; nueva[COL.nombre] = nombre;
  nueva[COL.whatsapp_e164] = wsp; nueva[COL.email] = email; nueva[COL.celebracion] = String(p.celebracion || '').slice(0, 80);
  nueva[COL.consentimiento_ofertas] = consiente ? 'SI' : 'NO';
  nueva[COL.consentimiento_fecha] = consiente ? ahora : '';
  nueva[COL.consentimiento_version] = String(p.consentimiento_version || '');
  nueva[COL.estado] = 'emitido'; nueva[COL.vigencia_hasta] = vig;
  nueva[COL.utm_source] = cut(p.utm_source); nueva[COL.utm_medium] = cut(p.utm_medium);
  nueva[COL.utm_campaign] = cut(p.utm_campaign); nueva[COL.utm_content] = cut(p.utm_content); nueva[COL.utm_term] = cut(p.utm_term);
  nueva[COL.conjunto] = conjunto_(p.utm_content) || (p.utm_source ? 'otro' : (p.referrer ? 'organico' : 'directo'));
  nueva[COL.fbclid] = cut(p.fbclid); nueva[COL.referrer] = cut(p.referrer); nueva[COL.navegador] = cut(p.navegador);
  nueva[COL.request_id] = cut(p.request_id); nueva[COL.entorno] = esTest_() ? 'test' : 'prod';
  var fila2 = ultima + 1;
  var rango = h.getRange(fila2, 1, 1, ENCABEZADOS.length);
  rango.setNumberFormat('@');
  rango.setValues([nueva]);
  SpreadsheetApp.flush();
  return { estado: 'nuevo', pase: { codigo: codigo, nombre: nombre, vigencia_hasta: vig } };
}

function enviarCopia_(email, pase) {
  try {
    var link = 'https://piscinapicaflor.cl/pase/#' + pase.codigo;
    var cuerpo = 'Hola ' + pase.nombre + ',\n\nEste es tu Pase de Apertura de Piscina Picaflor.\n\nCódigo: ' + pase.codigo +
      '\nVálido hasta: ' + pase.vigencia_hasta + '\n\nPara reservar, escríbenos por WhatsApp y mándanos tu código. ' +
      'El Pase se valida al reservar, no en la puerta.\n' + link + '\n\nPiscina Picaflor · Litueche';
    MailApp.sendEmail({ to: email, subject: 'Tu Pase de Apertura ' + pase.codigo, body: cuerpo, name: 'Piscina Picaflor' });
    return true;
  } catch (err) { return false; }
}

/* ------------------------- Consultar (el dueno valida) ------------------------- */
function doGet(e) {
  var q = (e && e.parameter) || {};
  if (q.accion !== 'consultar') return json_({ estado: 'invalido' });
  var cod = String(q.codigo || '').toUpperCase().trim();
  if (!/^PICA-[A-Z0-9]{4}$/.test(cod)) return json_({ estado: 'no_existe' });
  var h = hoja_();
  var ultima = h.getLastRow();
  if (ultima < 2) return json_({ estado: 'no_existe' });
  var datos = h.getRange(2, 1, ultima - 1, ENCABEZADOS.length).getValues();
  for (var i = 0; i < datos.length; i++) {
    var f = datos[i];
    if (f[COL.codigo] !== cod) continue;
    var estado = String(f[COL.estado]);
    var vig = String(f[COL.vigencia_hasta]);
    if (estado === 'emitido' && /^\d{4}-\d{2}-\d{2}$/.test(vig) && hoy_() > vig) estado = 'vencido';
    var reglas = reglas_() || {};
    // Solo datos minimos: nunca telefono ni correo.
    return json_({ estado: estado, nombre_pila: String(f[COL.nombre]).split(' ')[0], vigencia_hasta: vig, dias_validos: reglas.dias_validos || '' });
  }
  return json_({ estado: 'no_existe' });
}

/* ------------------------- Triggers ------------------------- */
function marcarVencidos() {
  var h = hoja_();
  var ultima = h.getLastRow();
  if (ultima < 2) return;
  var datos = h.getRange(2, 1, ultima - 1, ENCABEZADOS.length).getValues();
  var hoy = hoy_();
  for (var i = 0; i < datos.length; i++) {
    var vig = String(datos[i][COL.vigencia_hasta]);
    if (datos[i][COL.estado] === 'emitido' && /^\d{4}-\d{2}-\d{2}$/.test(vig) && hoy > vig) {
      h.getRange(i + 2, COL.estado + 1).setValue('vencido');
    }
  }
}

/** Lunes 9:00: resumen de la semana por correo al dueno. */
function resumenSemanal() {
  var para = prop_('CORREO_DUENO');
  if (!para) return;
  var h = hoja_();
  var ultima = h.getLastRow();
  var datos = ultima > 1 ? h.getRange(2, 1, ultima - 1, ENCABEZADOS.length).getValues() : [];
  var desde = Utilities.formatDate(new Date(Date.now() - 7 * 86400000), ZONA, "yyyy-MM-dd'T'HH:mm:ss");
  var n = 0, consiente = 0, canjeados = 0, porConj = {};
  datos.forEach(function (f) {
    if (f[COL.estado] === 'anulado') return;
    if (f[COL.estado] === 'canjeado') canjeados++;
    if (String(f[COL.fecha_emision]) >= desde) {
      n++;
      if (f[COL.consentimiento_ofertas] === 'SI') consiente++;
      var c = String(f[COL.conjunto] || 'directo');
      porConj[c] = (porConj[c] || 0) + 1;
    }
  });
  var detalle = Object.keys(porConj).map(function (k) { return '  ' + k + ': ' + porConj[k]; }).join('\n') || '  (sin Pases nuevos)';
  var cuerpo = 'Resumen de la semana - Piscina Picaflor\n\nPases nuevos: ' + n + '\nCon permiso para ofertas: ' + consiente +
    '\nReservas con Pase (canjeados en total): ' + canjeados + '\n\nPor origen:\n' + detalle +
    '\n\nAnota el gasto de la semana en la pestana "Gasto" para ver el costo por Pase y por reserva.';
  MailApp.sendEmail({ to: para, subject: 'Resumen semanal de Pases', body: cuerpo, name: 'Piscina Picaflor' });
}

import { datos, waUrl, navegador, esIOS, guardar, leer, borrar } from './datos';
import { atribucion } from './utm';
import { evento, identificar } from './pixel';
import { dibujarQR, pngPase, fechaLarga } from './ticket';

const d = datos();
const T = d.textos;
const F = T.formulario;
const P = T.pase;
const CLAVE_PASE = 'pica_pase_v1';
const t0 = performance.now();
const $ = (id: string): any => document.getElementById(id);
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

function normalizarWsp(v: string): string | null {
  let n = String(v).replace(/\D/g, '');
  if (n.startsWith('56')) n = n.slice(2);
  else if (n.startsWith('0')) n = n.slice(1);
  return /^9\d{8}$/.test(n) ? '+56' + n : null;
}
const correoOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function uuid(): string {
  try { return crypto.randomUUID(); } catch { return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
}
function requestId(): string {
  try {
    let v = sessionStorage.getItem('pica_req');
    if (!v) { v = uuid(); sessionStorage.setItem('pica_req', v); }
    return v;
  } catch { return uuid(); }
}
function limpiarRequestId() { try { sessionStorage.removeItem('pica_req'); } catch { /* nada */ } }

function error(campo: string, msg: string) {
  const el = $('err-' + campo);
  if (el) { el.textContent = msg; el.hidden = !msg; }
  const inp = $(campo);
  if (inp) inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
}
function mensaje(msg: string, tipo: 'error' | 'info' = 'error') {
  const el = $('form-msg');
  if (!el) return;
  el.textContent = msg;
  el.hidden = !msg;
  el.className = 'mt-4 rounded-xl px-4 py-3 text-base ' + (tipo === 'error' ? 'bg-red-50 text-red-800' : 'bg-espuma-100 text-oceano-900');
}

/* ---------- Respuesta del servidor (o simulada solo en desarrollo) ---------- */
function demo(p: any) {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let cod = 'DEMO-';
  for (let i = 0; i < 4; i++) cod += A[Math.floor(Math.random() * A.length)];
  return { estado: 'nuevo', demo: true, pase: { codigo: cod, nombre: p.nombre, vigencia_hasta: d.pase.vigencia_hasta } };
}
async function llamar(payload: any): Promise<any> {
  if (!d.endpoint) {
    if (d.dev) return demo(payload);
    throw new Error('sin endpoint');
  }
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), 15000);
  try {
    const verbo = ['PO', 'ST'].join('');
    const r = await fetch(d.endpoint, { method: verbo, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), signal: ctl.signal });
    if (!r.ok) throw new Error('http ' + r.status);
    return await r.json();
  } finally { clearTimeout(to); }
}
async function conReintento(payload: any) {
  try { return await llamar(payload); } catch { await espera(1200); return await llamar(payload); }
}

/* ---------- Ticket ---------- */
let paseActual: any = null;

function infoPase(p: any, demoFlag: boolean) {
  const vig = p.vigencia_hasta || d.pase.vigencia_hasta;
  return {
    nombreNegocio: d.nombre,
    titulo: P.titulo,
    titular: P.titular_de,
    nombre: p.nombre,
    codigo: p.codigo,
    descuento: String(d.pase.descuento_texto || ''),
    vigencia: vig ? P.vigencia + ' ' + fechaLarga(vig) : '',
    dias: d.pase.dias_validos ? P.dias + ': ' + d.pase.dias_validos : '',
    excluidas: d.pase.fechas_excluidas_alta_demanda ? P.excluidas + ': ' + d.pase.fechas_excluidas_alta_demanda : '',
    cupos: d.pase.cupos_totales ? P.cupos + ': ' + d.pase.cupos_totales : '',
    condiciones: d.pase.condiciones,
    url: location.origin + '/pase/#' + p.codigo,
    pie: 'Se valida al reservar por WhatsApp',
    demo: demoFlag ? P.demo : '',
  };
}

function mostrarTicket(p: any, op: { existente?: boolean; correo?: boolean; demo?: boolean } = {}) {
  paseActual = { ...p, demo: !!op.demo };
  $('pase-form-wrap').hidden = true;
  const box = $('pase-ticket');
  box.hidden = false;
  const vig = p.vigencia_hasta || d.pase.vigencia_hasta;
  $('t-nombre').textContent = p.nombre;
  $('t-codigo').textContent = p.codigo;
  $('t-vigencia').textContent = vig ? P.vigencia + ' ' + fechaLarga(vig) : '';
  dibujarQR($('t-qr'), location.origin + '/pase/#' + p.codigo, 300);
  const aviso = op.existente ? F.existente : (op.correo ? P.correo_enviado : '');
  $('t-aviso').textContent = aviso;
  $('t-aviso').hidden = !aviso;
  $('t-demo').hidden = !op.demo;
  const link = location.origin + '/pase/#' + p.codigo;
  const msg = d.mensajes.con_pase.replace('{codigo}', p.codigo).replace('{nombre}', p.nombre).replace('{link}', link);
  $('t-wsp').href = waUrl(msg);
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  guardar(CLAVE_PASE, { codigo: p.codigo, nombre: p.nombre, vigencia_hasta: vig, demo: !!op.demo });
}

async function guardarImagen() {
  if (!paseActual) return;
  try {
    const blob = await pngPase(infoPase(paseActual, paseActual.demo));
    const archivo = new File([blob], 'pase-picaflor-' + paseActual.codigo + '.png', { type: 'image/png' });
    const nav: any = navigator;
    if (nav.canShare && nav.canShare({ files: [archivo] })) {
      try { await nav.share({ files: [archivo], title: P.titulo }); evento('PaseGuardado', { via: 'compartir' }); return; }
      catch (e: any) { if (e && e.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const enApp = navegador() !== 'otro';
    if (!enApp && !esIOS()) {
      const a = document.createElement('a');
      a.href = url; a.download = archivo.name;
      document.body.appendChild(a); a.click(); a.remove();
      evento('PaseGuardado', { via: 'descarga' });
    } else {
      const img = $('t-imagen'); img.src = url;
      $('t-imagen-wrap').hidden = false;
      $('t-imagen-ayuda').textContent = P.mantener;
      img.scrollIntoView({ behavior: 'smooth', block: 'center' });
      evento('PaseGuardado', { via: 'mantener' });
    }
  } catch { mensaje(F.errores.red); }
}

async function copiarCodigo() {
  if (!paseActual) return;
  const btn = $('t-copiar');
  try { await navigator.clipboard.writeText(paseActual.codigo); }
  catch {
    const ta = document.createElement('textarea');
    ta.value = paseActual.codigo; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch { /* nada */ }
    ta.remove();
  }
  const antes = btn.textContent;
  btn.textContent = P.copiado;
  setTimeout(() => { btn.textContent = antes; }, 1800);
}

/* ---------- Formulario ---------- */
async function enviar(ev: Event) {
  ev.preventDefault();
  const form = ev.target as HTMLFormElement;
  const nombre = form.nombre.value.trim().replace(/\s+/g, ' ');
  const wspN = normalizarWsp(form.whatsapp.value);
  const email = form.correo.value.trim();
  let ok = true;
  error('nombre', ''); error('whatsapp', ''); error('correo', ''); mensaje('');
  if (nombre.length < 2 || nombre.length > 60) { error('nombre', F.errores.nombre); ok = false; }
  if (!wspN) { error('whatsapp', F.errores.whatsapp); ok = false; }
  if (email && !correoOk(email)) { error('correo', F.errores.correo); ok = false; }
  if (!ok) { (form.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(); return; }
  if (form.sitio_web.value) return;

  const btn = $('btn-enviar');
  const etiqueta = btn.textContent;
  btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.textContent = F.enviando;
  const falta = 3000 - (performance.now() - t0);
  if (falta > 0) await espera(falta);

  const a = atribucion();
  const consentimiento = !!form.consentimiento.checked;
  const payload = {
    accion: 'emitir',
    request_id: requestId(),
    nombre, whatsapp: wspN, email,
    celebracion: (form.celebracion.value || '').slice(0, 80),
    consentimiento_ofertas: consentimiento,
    consentimiento_version: d.consentimiento.version,
    hp: form.sitio_web.value,
    t_ms: Math.round(performance.now() - t0),
    utm_source: a.utm_source || '', utm_medium: a.utm_medium || '', utm_campaign: a.utm_campaign || '',
    utm_content: a.utm_content || '', utm_term: a.utm_term || '', fbclid: a.fbclid || '',
    referrer: a.referrer || '', navegador: navegador(),
  };

  try {
    const r = await conReintento(payload);
    switch (r.estado) {
      case 'nuevo':
        limpiarRequestId();
        mostrarTicket(r.pase, { correo: !!email && r.correo !== false, demo: !!r.demo });
        if (!r.demo) { evento('Lead', {}, r.pase.codigo); if (consentimiento && wspN) identificar(wspN); }
        break;
      case 'existente':
        limpiarRequestId();
        mostrarTicket(r.pase, { existente: true });
        evento('PaseRepetido');
        break;
      case 'agotado': mensaje(F.errores.agotado); evento('PaseAgotado'); break;
      case 'cerrado': mensaje(F.errores.cerrado); break;
      case 'invalido':
        if (r.campo && $('err-' + r.campo)) error(r.campo, F.errores[r.campo] || F.errores.red); else mensaje(F.errores.red);
        break;
      default: mensaje(F.errores.red);
    }
  } catch { mensaje(F.errores.red); }
  finally { btn.disabled = false; btn.removeAttribute('aria-busy'); btn.textContent = etiqueta; }
}

function iniciar() {
  const form = $('pase-form');
  if (!form) return;
  form.addEventListener('submit', enviar);
  form.addEventListener('focusin', () => evento('FormInicio'), { once: true });
  document.querySelectorAll('[data-chip]').forEach((el) => el.addEventListener('click', () => {
    const v = (el as HTMLElement).dataset.chip || '';
    const inp = form.celebracion;
    inp.value = inp.value === v ? '' : v;
    document.querySelectorAll('[data-chip]').forEach((o) => o.setAttribute('aria-pressed', String((o as HTMLElement).dataset.chip === inp.value)));
  }));
  $('t-guardar').addEventListener('click', guardarImagen);
  $('t-copiar').addEventListener('click', copiarCodigo);
  $('t-wsp').addEventListener('click', () => evento('Contact', { ubicacion: 'ticket' }));
  $('t-cambiar').addEventListener('click', () => {
    borrar(CLAVE_PASE);
    paseActual = null;
    $('pase-ticket').hidden = true;
    $('pase-form-wrap').hidden = false;
  });
  const previo = leer<any>(CLAVE_PASE);
  if (previo && previo.codigo) mostrarTicket(previo, { demo: !!previo.demo });
}
iniciar();

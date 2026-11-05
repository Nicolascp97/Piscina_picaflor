import { datos } from './datos';
import { fechaLarga } from './ticket';

const d = datos();
const $ = (id: string): any => document.getElementById(id);

const VEREDICTOS: Record<string, { titulo: string; clase: string }> = {
  valido: { titulo: 'VALIDO', clase: 'bg-emerald-600' },
  emitido: { titulo: 'VALIDO', clase: 'bg-emerald-600' },
  canjeado: { titulo: 'YA USADO', clase: 'bg-amber-600' },
  vencido: { titulo: 'VENCIDO', clase: 'bg-red-700' },
  anulado: { titulo: 'ANULADO', clase: 'bg-red-700' },
  no_existe: { titulo: 'NO EXISTE', clase: 'bg-red-700' },
};

function pintar(clave: string, extra: { nombre?: string; vigencia?: string; dias?: string; nota?: string } = {}) {
  const v = VEREDICTOS[clave] || { titulo: 'SIN RESPUESTA', clase: 'bg-slate-600' };
  const caja = $('veredicto');
  caja.className = 'rounded-3xl px-6 py-10 text-center text-white ' + v.clase;
  $('v-titulo').textContent = v.titulo;
  $('v-nombre').textContent = extra.nombre || '';
  $('v-detalle').textContent = [extra.vigencia, extra.dias].filter(Boolean).join(' · ');
  $('v-nota').textContent = extra.nota || '';
}

async function consultar() {
  const codigo = decodeURIComponent(location.hash.replace(/^#/, '')).trim().toUpperCase();
  $('v-codigo').textContent = codigo || 'Sin código';
  if (!/^PICA-[A-Z0-9]{4}$/.test(codigo)) { pintar('no_existe', { nota: 'Falta el código del Pase en el enlace.' }); return; }
  if (!d.endpoint) { pintar('sin', { nota: 'Sin conexión al registro (modo desarrollo).' }); return; }
  try {
    const url = d.endpoint + (d.endpoint.includes('?') ? '&' : '?') + 'accion=consultar&codigo=' + encodeURIComponent(codigo);
    const r = await fetch(url);
    const j = await r.json();
    pintar(j.estado, {
      nombre: j.nombre_pila,
      vigencia: j.vigencia_hasta ? 'Vigente hasta ' + fechaLarga(j.vigencia_hasta) : '',
      dias: j.dias_validos ? 'Días: ' + j.dias_validos : '',
      nota: j.estado === 'emitido' || j.estado === 'valido' ? 'Para canjearlo, cambia el estado a "canjeado" en la planilla.' : '',
    });
  } catch { pintar('sin', { nota: 'No se pudo consultar. Revisa tu internet.' }); }
}
consultar();
window.addEventListener('hashchange', consultar);

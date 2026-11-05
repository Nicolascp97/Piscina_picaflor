import { guardar, leer } from './datos';

const CLAVE = 'pica_attr_v1';
const CAMPOS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];

/** Guarda el primer contacto (o el primero con utm_source) y lo devuelve. */
export function atribucion(): Record<string, string> {
  try {
    const p = new URLSearchParams(location.search);
    const nuevo: Record<string, string> = {};
    for (const k of CAMPOS) { const v = p.get(k); if (v) nuevo[k] = v.slice(0, 120); }
    const previo = leer<Record<string, string>>(CLAVE);
    const hayNuevo = Object.keys(nuevo).length > 0;
    if (!previo || (hayNuevo && !previo.utm_source)) {
      const reg = { ...nuevo, referrer: (document.referrer || '').slice(0, 200) };
      if (hayNuevo || reg.referrer || !previo) guardar(CLAVE, reg);
      return reg;
    }
    return previo;
  } catch { return {}; }
}

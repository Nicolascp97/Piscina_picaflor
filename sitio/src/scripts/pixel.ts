import { datos } from './datos';

let activo = false;
let cargado = false;
const cola: any[][] = [];

function ejecutar(args: any[]) {
  const f = (window as any).fbq;
  if (f) f(...args);
}

export function iniciarPixel() {
  const d = datos();
  const id = String(d.pixelId || '');
  if (!/^\d{8,20}$/.test(id)) return;          // sin Pixel valido (preview/dev): no se carga nada
  activo = true;
  const cargar = () => {
    /* Snippet estandar de Meta, cargado despues del evento load */
    (function (f: any, b: any, e: any, v: any) {
      if (f.fbq) return;
      const n: any = (f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); });
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      const t = b.createElement(e); t.async = true; t.src = v;
      const s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    ejecutar(['init', id]);
    ejecutar(['track', 'PageView']);
    cargado = true;
    cola.splice(0).forEach(ejecutar);
  };
  if (document.readyState === 'complete') setTimeout(cargar, 0);
  else window.addEventListener('load', () => setTimeout(cargar, 0), { once: true });
}

const ESTANDAR = ['Lead', 'Contact', 'PageView'];

/** Evento de Meta. 'Lead' y 'Contact' son estandar; el resto, personalizados. eventID deduplica con la API de conversiones. */
export function evento(nombre: string, params: Record<string, unknown> = {}, eventID?: string) {
  if (datos().dev) console.debug('[evento]', nombre, params, eventID || '');
  if (!activo) return;
  const args: any[] = [ESTANDAR.includes(nombre) ? 'track' : 'trackCustom', nombre, params];
  if (eventID) args.push({ eventID });
  if (cargado) ejecutar(args); else cola.push(args);
}

/** Coincidencia avanzada: SOLO si la persona dio consentimiento. Telefono con hash SHA-256. */
export async function identificar(wspE164: string) {
  if (!activo) return;
  try {
    const digitos = wspE164.replace(/\D/g, '');
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(digitos));
    const ph = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    const reinit = () => ejecutar(['init', String(datos().pixelId), { ph }]);
    if (cargado) reinit(); else cola.push(['init', String(datos().pixelId), { ph }]);
  } catch { /* sin crypto: no pasa nada */ }
}

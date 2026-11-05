import cfg from '../config/negocio.json';

export const config = cfg;
export const PENDIENTE = '[POR CONFIRMAR]';
export const esPendiente = (v: unknown): boolean => typeof v === 'string' && v.includes(PENDIENTE);

/** Solo digitos 569XXXXXXXX, o '' si el WhatsApp aun no esta confirmado. */
export function wspDigitos(): string {
  const d = String(cfg.negocio.whatsapp_e164 || '').replace(/\D/g, '');
  return /^569\d{8}$/.test(d) ? d : '';
}

export function waLink(mensaje?: string): string {
  const n = wspDigitos();
  if (!n) return '#sin-whatsapp';
  return 'https://wa.me/' + n + (mensaje ? '?text=' + encodeURIComponent(mensaje) : '');
}

/** Datos que viajan al navegador (nada secreto). */
export function datosCliente() {
  return {
    dev: import.meta.env.DEV,
    endpoint: import.meta.env.PUBLIC_PASE_ENDPOINT || '',
    pixelId: import.meta.env.PUBLIC_META_PIXEL_ID || '',
    wsp: wspDigitos(),
    nombre: cfg.negocio.nombre,
    textos: cfg.textos,
    pase: cfg.pase,
    arriendo: { mostrar_precio: cfg.arriendo.mostrar_precio },
    consentimiento: cfg.consentimiento,
    mensajes: cfg.whatsapp_mensajes,
  };
}

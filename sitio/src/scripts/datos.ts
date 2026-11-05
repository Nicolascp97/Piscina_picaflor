let cache: any = null;

export function datos(): any {
  if (!cache) {
    const el = document.getElementById('pase-datos');
    try { cache = el ? JSON.parse(el.textContent || '{}') : {}; } catch { cache = {}; }
  }
  return cache;
}

export function waUrl(mensaje?: string): string {
  const n = datos().wsp;
  if (!n) return '#sin-whatsapp';
  return 'https://wa.me/' + n + (mensaje ? '?text=' + encodeURIComponent(mensaje) : '');
}

export function navegador(): string {
  const ua = navigator.userAgent || '';
  if (/Instagram/i.test(ua)) return 'instagram';
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'facebook';
  return 'otro';
}

export function esIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
}

export function guardar(clave: string, valor: unknown) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin almacenamiento: seguimos igual */ }
}
export function leer<T = any>(clave: string): T | null {
  try { const v = localStorage.getItem(clave); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
}
export function borrar(clave: string) {
  try { localStorage.removeItem(clave); } catch { /* nada */ }
}

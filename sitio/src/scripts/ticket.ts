import qrcode from 'qrcode-generator';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function fechaLarga(iso?: string | null): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  if (!m) return String(iso || '');
  return Number(m[3]) + ' de ' + MESES[Number(m[2]) - 1] + ' de ' + m[1];
}

export function dibujarQR(canvas: HTMLCanvasElement, texto: string, px: number) {
  const qr = qrcode(0, 'M');
  qr.addData(texto);
  qr.make();
  const n = qr.getModuleCount();
  const margen = 2;
  const celda = Math.max(2, Math.floor(px / (n + margen * 2)));
  const lado = celda * (n + margen * 2);
  canvas.width = lado;
  canvas.height = lado;
  const c = canvas.getContext('2d')!;
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, lado, lado);
  c.fillStyle = '#062a36';
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (qr.isDark(r, k)) c.fillRect((k + margen) * celda, (r + margen) * celda, celda, celda);
}

function lineas(c: CanvasRenderingContext2D, texto: string, ancho: number): string[] {
  const out: string[] = [];
  let l = '';
  for (const p of String(texto).split(' ')) {
    const t = l ? l + ' ' + p : p;
    if (c.measureText(t).width > ancho && l) { out.push(l); l = p; } else l = t;
  }
  if (l) out.push(l);
  return out;
}

export interface InfoPase {
  nombreNegocio: string;
  titulo: string;
  titular: string;
  nombre: string;
  codigo: string;
  descuento: string;
  vigencia: string;
  dias: string;
  excluidas: string;
  cupos: string;
  condiciones: string[];
  url: string;
  pie: string;
  demo?: string;
}

/** Dibuja el Pase en un canvas (sin librerias) y lo devuelve como PNG. */
export function pngPase(i: InfoPase): Promise<Blob> {
  const W = 1080, H = 1620;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d')!;
  const fam = 'ui-rounded, "Avenir Next", "Segoe UI", system-ui, -apple-system, Roboto, sans-serif';

  const g = c.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#0a3a4a'); g.addColorStop(1, '#12b5c6');
  c.fillStyle = g; c.fillRect(0, 0, W, H);

  c.fillStyle = '#ffffff';
  c.beginPath(); c.roundRect(50, 50, W - 100, H - 100, 48); c.fill();

  c.textAlign = 'center';
  let y = 150;
  c.fillStyle = '#0e6b80'; c.font = '700 34px ' + fam;
  c.fillText(i.nombreNegocio.toUpperCase(), W / 2, y);
  y += 90;
  c.fillStyle = '#062a36'; c.font = '800 78px ' + fam;
  c.fillText(i.titulo.toUpperCase(), W / 2, y);
  if (i.descuento) {
    y += 100;
    c.fillStyle = '#0e6b80'; c.font = '800 84px ' + fam;
    for (const l of lineas(c, i.descuento, W - 220)) { c.fillText(l, W / 2, y); y += 92; }
    y -= 92;
  }

  y += 50;
  c.strokeStyle = '#7fdde6'; c.lineWidth = 4; c.setLineDash([16, 14]);
  c.beginPath(); c.moveTo(110, y); c.lineTo(W - 110, y); c.stroke(); c.setLineDash([]);

  y += 70;
  c.fillStyle = '#4b6b75'; c.font = '600 30px ' + fam;
  c.fillText(i.titular.toUpperCase(), W / 2, y);
  y += 66;
  c.fillStyle = '#062a36'; c.font = '800 58px ' + fam;
  for (const l of lineas(c, i.nombre, W - 220).slice(0, 2)) { c.fillText(l, W / 2, y); y += 64; }

  y += 10;
  const qrc = document.createElement('canvas');
  dibujarQR(qrc, i.url, 360);
  c.drawImage(qrc, (W - 360) / 2, y, 360, 360);
  y += 360 + 80;

  c.fillStyle = '#062a36'; c.font = '800 112px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
  c.fillText(i.codigo, W / 2, y);
  y += 70;

  c.font = '600 34px ' + fam; c.fillStyle = '#0e6b80';
  if (i.vigencia) { c.fillText(i.vigencia, W / 2, y); y += 52; }
  c.fillStyle = '#062a36'; c.font = '500 30px ' + fam;
  for (const t of [i.dias, i.excluidas, i.cupos]) {
    if (!t) continue;
    for (const l of lineas(c, t, W - 220)) { c.fillText(l, W / 2, y); y += 40; }
  }

  y += 14;
  c.fillStyle = '#4b6b75'; c.font = '500 26px ' + fam;
  for (const cond of i.condiciones) for (const l of lineas(c, cond, W - 240)) { c.fillText(l, W / 2, y); y += 34; }

  c.fillStyle = '#0e6b80'; c.font = '600 28px ' + fam;
  c.fillText(i.pie, W / 2, H - 100);

  if (i.demo) {
    c.save(); c.translate(W / 2, H / 2); c.rotate(-0.5);
    c.fillStyle = 'rgba(220,38,38,0.28)'; c.font = '900 84px ' + fam;
    c.fillText(i.demo.toUpperCase(), 0, 0);
    c.restore();
  }

  return new Promise((ok, fail) => cv.toBlob((b) => (b ? ok(b) : fail(new Error('png'))), 'image/png'));
}

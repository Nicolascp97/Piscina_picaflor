import { config } from '../lib/config';

// Apps Script lee esta URL para conocer las reglas vigentes del Pase (cupos, vigencia, activo).
// Es la misma fuente que usa el sitio: negocio.json.
export function GET() {
  const cuerpo = {
    pase: config.pase,
    apertura: config.apertura,
    consentimiento: { version: config.consentimiento.version },
  };
  return new Response(JSON.stringify(cuerpo), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
}

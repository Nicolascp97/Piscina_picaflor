import { datos } from './datos';
import { atribucion } from './utm';
import { iniciarPixel, evento } from './pixel';

atribucion();
iniciarPixel();

// Contact: cada clic a WhatsApp, con el lugar donde estaba el boton.
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement | null)?.closest?.('a[data-wsp]') as HTMLElement | null;
  if (a) evento('Contact', { ubicacion: a.getAttribute('data-wsp') || 'otro' });
});

// Enlaces viejos del programa anterior (#/u/..., #/dashboard/..., #/r/...): aviso amable, sin errores.
if (/^#\/(u|dashboard|r)\//.test(location.hash)) {
  document.getElementById('aviso-fidelidad')?.removeAttribute('hidden');
}
void datos;

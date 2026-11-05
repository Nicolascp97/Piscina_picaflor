// Fotos reales optimizadas (generadas por `npm run imagenes`). hero.* es la foto principal.
const todas = import.meta.glob('../assets/fotos/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' }) as Record<string, any>;

export function foto(nombre: string): any | null {
  for (const [ruta, img] of Object.entries(todas)) {
    const base = ruta.split('/').pop()!.replace(/\.[a-z]+$/i, '');
    if (base === nombre) return img;
  }
  return null;
}
export function galeria(): { img: any; nombre: string }[] {
  return Object.entries(todas)
    .map(([ruta, img]) => ({ img, nombre: ruta.split('/').pop()!.replace(/\.[a-z]+$/i, '') }))
    .filter((f) => f.nombre.startsWith('galeria-'))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

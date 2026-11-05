# Inventario de imagenes y videos (revisado el 2026-11-05)

Regla: solo fotos reales, sin editar con IA, con permiso de quienes aparecen. **Prohibido generar con IA imagenes de la piscina o del lugar** (publicidad enganosa).

| Archivo (en legacy/fidelidad-v1/app/public) | Estado | Motivo |
|---|---|---|
| `images/Piscina1.heic` | EXCLUIDA | Trae la etiqueta "Generado por IA" abajo a la izquierda (la agrega el celular al editar con IA). |
| `images/piscina2.heic` | CANDIDATA, por confirmar | No tiene marca. Foto vertical de la piscina con cubierta azul y la tinaja. Falta que el dueno confirme que es real y sin editar. No se incluyo en `src/assets/fotos/` todavia. |
| `images/celebra-matrimonio.png`, `celebra-bautizo.png`, `celebra-graduacion 1.png`, `carrusel-eventos.png`, `matrimonio1.png` | EXCLUIDAS | Traen marca de agua de Gemini (estrella abajo a la derecha) y texto encima; dos son la misma escena con distinta luz. |
| `images/matrimonio_dron.mp4`, `videos/matrimonio-dron.mp4` (duplicados, 10 MB) | POR CONFIRMAR | Confirmar que es un evento real y los permisos de las personas. |
| `videos/piscinavideo.mp4` (49 MB) | POR CONFIRMAR | Comprimir a <= 4 MB (720p, <= 20 s) y confirmar permisos. No usar en el hero. |
| `logopica.png` (675 KB) | USADO | Optimizado a `public/logo.png` (256 px). Falta el logo vectorial. |

Faltan (ruta critica, los trae Nico): foto del hero con gente, 4-6 fotos de galeria con gente, fotogramas del reel 1.

## Como agregar una foto
1. `npm run imagenes -- <entrada.jpg|heic> src/assets/fotos/hero.webp 1600 280` (el hero se llama `hero`; la galeria `galeria-01`, `galeria-02`...).
2. Cada foto debe pesar <= 300 KB. Astro genera AVIF/WebP y los tamanos al hacer el build.

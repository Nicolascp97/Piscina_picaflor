import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://piscinapicaflor.cl',
  output: 'static',
  vite: { plugins: [tailwindcss()] },
});

# AGENTS.md — Piscina Picaflor (landing del Pase de Apertura)

> Esta es la fuente de las reglas del proyecto. `CLAUDE.md` solo la importa con `@AGENTS.md`.
> Plan completo y vigente: [PLAN-LANDING-2026-11.md](PLAN-LANDING-2026-11.md).

## Qué es
Piscina Picaflor arrienda la piscina completa por día (eventos y verano) en el sector Picaflor, Litueche (O'Higgins). Es el negocio del papá de Nico: **proyecto familiar, no cliente de Nexo**. No aplican precios, planes ni identidad de Nexo. Identidad propia: agua, turquesa, "premium" y familiar.

Abre el **20-nov-2026**. La landing (`piscinapicaflor.cl`) es el destino de los anuncios de Meta (arrancan ~14-nov). Debe estar publicada, probada y medible a más tardar el **13-nov**.

## Alcance (solo esto)
Estrategia del Pase: **anuncio → landing → Pase de Apertura → WhatsApp → reserva**.
- Trabajo principal: que el visitante deje nombre + WhatsApp (+ consentimiento opcional) y obtenga su Pase, y después escriba al WhatsApp del dueño.
- Trabajo secundario: informar (qué incluye, cómo se reserva, dónde queda, preguntas frecuentes).
- **Fuera de alcance:** el sistema de fidelidad (puntos, referidos, portal). Está congelado en `legacy/fidelidad-v1/` y en el tag/rama `fidelidad-v1`. No se rediseña, no se muestra y no se menciona en el copy.

## Estructura
```
sitio/                 Astro estático (Root Directory en Vercel)
  src/config/negocio.json   ÚNICA fuente de contenido y reglas del Pase
apps-script/           Backend del Pase (Google Apps Script), sin secretos
legacy/fidelidad-v1/   CONGELADO. No editar
PLAN-LANDING-2026-11.md  Contrato de trabajo
```

## Reglas duras
1. **Español de Chile, tuteo. Cero voseo.** Texto visible para familias y dueños de negocio: nada de jerga (bot, webhook, API, backend).
2. **No inventar** cifras, precios, capacidad, reseñas, testimonios ni resultados. Sin dato = `[POR CONFIRMAR]`.
3. **Todos los valores del Pase y del negocio viven en `sitio/src/config/negocio.json`**, nunca escritos a mano en componentes. El build de producción falla si queda un `[POR CONFIRMAR]`.
4. **Prohibido generar con IA imágenes de la piscina o del lugar** (publicidad engañosa). Solo fotos reales. Hay imágenes con marca de Gemini en `legacy/`: no se usan. Personas: permiso por escrito; menores, permiso de los padres.
5. **Construir ≠ publicar.** `main` = producción (Vercel despliega solo al hacer push). No se hace merge a `main`, no se hace push, no se toca Vercel y no se activan campañas sin que Nico escriba **PUBLICAR**. Meta Ads solo en borrador; **ACTIVAR** lo escribe Nico.
6. **Nunca mandar datos falsos a producción.** Las pruebas van contra el Apps Script de PRUEBAS y la hoja "Pases-PRUEBAS". Vercel Preview y `npm run dev` apuntan solo a PRUEBAS.
7. **No copiar credenciales** a documentos, al repo ni a la bóveda: "vive en .env" o en las Propiedades del script.
8. **No tocar** `PROYECTOS/EL-MENU` ni otros proyectos.
9. No dejar procesos corriendo: bajar cualquier servidor de desarrollo por su PID.
10. Python en Windows: escribir archivos con `newline='\n'` (CRLF rompe despliegues).
11. Si dos fuentes se contradicen, gana la bóveda (`Cerebro-nicoagenteia`) y se marca la contradicción; no se borra en silencio.
12. El Pase no da puntos, no usa referidos y no comparte hoja ni base con fidelidad.

## Pase de Apertura (resumen)
Página HTML con código único `PICA-XXXX`, QR, nombre del titular, descuento, días válidos, cupos, vigencia y condiciones: un solo uso, nominal, no acumulable, se valida **al reservar por WhatsApp** (no en la puerta) y no vale en días de alta demanda. Idempotente: el mismo WhatsApp no genera dos Pases. Estados en la hoja: emitido / canjeado / vencido / anulado.

## Comandos
En `sitio/`: `npm run dev` (desarrollo, modo demo sin backend) · `npm run build:preview` (build sin exigir datos) · `npm run build` (produccion: falla si queda un `[POR CONFIRMAR]` o falta `PUBLIC_PASE_ENDPOINT` / `PUBLIC_META_PIXEL_ID`) · `npm run validar` · `npm run imagenes`. Backend: `node apps-script/test/probar.mjs`.

## Despliegue
Vercel (proyecto `piscina-picaflor`, dominio `piscinapicaflor.cl`). Root Directory `sitio`. Reversa: Instant Rollback en Vercel + `git revert`. Quién autoriza: Nico.

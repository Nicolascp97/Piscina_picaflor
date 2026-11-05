# PLAN-LANDING-2026-11 — Piscina Picaflor: landing del Pase de Apertura

> Plan de implementación (no es código). Lo ejecuta el subagente `builder` cuando Nico lo apruebe.
> Fecha: jue 5-nov-2026 · Meta: publicada, probada y medible el **vie 13-nov** · Anuncios ~14-nov · Apertura **vie 20-nov**.
> Decisiones de Nico en esta sesión: el backend del Pase es **Google Apps Script** (no n8n) y la **casilla de ofertas es opcional**.

---

## 0. Contexto y hallazgos que cambian el encargo

La landing actual vende un "programa de puntos" y no sirve como destino del anuncio. Este plan la convierte en la página del **Pase de Apertura** (anuncio → landing → Pase → WhatsApp → reserva). El sistema de fidelidad queda congelado, sin borrar nada.

Verificado hoy (5-nov), solo lectura:

| # | Hallazgo | Impacto |
|---|----------|---------|
| H-1 | 🔴 **La instancia de n8n `ppicaflor.app.n8n.cloud` no existe**: responde *"404 – No instance here"*. El formulario que está en vivo falla y no hay dónde crear el workflow nuevo. | Nico decidió usar **Apps Script + hoja nueva**. Los JSON de `piscina-picaflor/workflows/` son ahora **la única copia** de esos flujos. |
| H-2 | 🔴 **4 de las 5 imágenes del carrusel (`celebra-*.png`, `carrusel-eventos.png`) traen la marca de agua de Gemini** (✦ abajo a la derecha), y dos son la misma escena con distinta luz. Lo más probable es que estén generadas o editadas con IA. | **Quedan excluidas** de la landing: serían publicidad engañosa. Solo se usan fotos reales. |
| H-3 | El sitio en vivo responde 200 (Vercel reactivado). El proyecto está conectado a GitHub `Nicolascp97/Piscina_picaflor`: **cada push a `main` publica en producción**. Preset mal puesto (`preact`). La protección SSO cubre las preview. | Todo se trabaja en una rama. Publicar = merge a `main`, y eso solo lo autoriza Nico. |
| H-4 | El video del carrusel (Cloudinary, `w_1280,q_auto`) pesa **41 MB**. Las fotos de imgbb no cargan. La línea 304 de `App.js` sigue con una URL de relleno. | Se reemplaza entero. |
| H-5 | `api/` **sí se usa, pero solo en fidelidad**: `/api/usuario` (banner de referido y PortalUsuario). Hoy responde 500 porque apunta a `webhook-test` de una instancia que ya no existe. La landing nueva no lo usa. | Se va a la carpeta congelada. En la landing es código muerto. |
| H-6 | **El `node_modules/` de la raíz está versionado** (5.185 de los 5.242 archivos del repo). | Se saca del índice en H0. |
| H-7 | Contradicción: `google_sheets_structure.md` dice Google Sheets, pero el workflow del dashboard lee de **Airtable** (base "Picaflor"). | Se anota en el README de lo congelado y no se toca. |
| H-8 | La app usa `HashRouter`: los enlaces reales de fidelidad son `/#/u/…`, `/#/dashboard/…` y `/#/r/…`, y están en correos ya enviados. | La landing nueva los detecta y muestra un aviso, sin romper ni borrar nada. |
| H-9 | Ley 21.719: vigente el **1-dic-2026** (se publicó el 13-dic-2024). Hay un proyecto en el Senado para postergarla a 2027, todavía sin aprobar. La campaña corre después de esa fecha. | Se diseña para la 21.719 desde ya (§4.3). |
| H-10 | Vercel Hobby es solo para uso **no comercial** según sus términos, y n8n Cloud no tiene plan gratis (Starter ≈ €20–24 al mes). | Ver la decisión abierta D3. |

Contradicciones con la bóveda que hay que marcar al ingerir (no se borran):
- La ficha decía "web caída 503 DEPLOYMENT_PAUSED": ya está reactivada.
- El prompt asume que hay n8n de producción: la instancia no existe.
- El prompt ubica `workflows/` en la raíz: está en `piscina-picaflor/workflows/`.

---

## 1. Diagnóstico técnico (una página)

| Pieza actual | Decisión | Dónde queda | Riesgo |
|--------------|----------|-------------|--------|
| `piscina-picaflor/` entero (CRA, App.js, componentes de fidelidad, docs, workflows, plantilla de correo) | **Se congela, no se borra** | Tag `fidelidad-v1` en `974a1f6` + rama `fidelidad-v1` + `git mv` a `legacy/fidelidad-v1/app/` | Bajo. `git log --follow` mantiene la historia |
| `api/registro.js`, `api/usuario.js` | Se congela (solo los usa fidelidad y están rotos) | `legacy/fidelidad-v1/api/` | Bajo. Vercel deja de servir `/api/*`, y eso solo afecta a fidelidad, que ya está rota |
| `vercel.json`, `package.json` y `package-lock.json` de la raíz | Se congelan y se reemplazan | `legacy/fidelidad-v1/` | Medio. Hay que ajustar Root Directory en Vercel (T4.1) |
| `node_modules/` de la raíz versionado | Se saca del índice (`git rm -r --cached`) y se agrega a `.gitignore` | — | Bajo |
| Copy, hero y secciones de puntos | **Se reescribe** | `sitio/` nuevo | — |
| Carrusel con imgbb + Cloudinary de 41 MB | Se elimina | — | — |
| `celebra-*.png`, `carrusel-eventos.png`, `matrimonio1.png` | **Excluidas** (marca Gemini) hasta que el dueño confirme que son fotos sin editar. Aun así, sin el texto encima | Se quedan en legacy | Alto si se usan: publicidad engañosa |
| `Piscina1.heic`, `piscina2.heic`, `piscinavideo.mp4` (49 MB), `matrimonio_dron.mp4` (10 MB, duplicado) | Se reutilizan como **fuente** de fotos y póster, optimizados | `sitio/src/assets/` (optimizados) | Bajo. Confirmar que son reales |
| `logopica.png` (675 KB) | Se reutiliza optimizado (≤ 30 KB) | `sitio/src/assets/` | Bajo. El vectorial queda [POR CONFIRMAR] |
| `scripts/prepare-images.js` (sharp) | Se reemplaza por un script nuevo (sharp no trae HEIC: se usa `heic-convert`) | `sitio/scripts/` | Bajo |
| Número `wa.me/56975003757` | Se reutiliza **solo si el dueño confirma** que es el WhatsApp del negocio | config | Medio |
| Base de fidelidad (Airtable "Picaflor" / hojas Usuarios-Historial) | **No se toca, no se lee y no se mezcla** con la lista del Pase | — | Bajo |

**Fidelidad congelada:**
- `legacy/fidelidad-v1/README.md` explica qué hay ahí, que n8n ya no existe, que los JSON son la única copia, la contradicción Airtable/Sheets, y cómo retomarlo en la fase futura: desde el tag, no desde `main`.
- En la landing, los enlaces `#/u/…`, `#/dashboard/…` y `#/r/…` muestran: "Estamos renovando el programa. Tus datos están guardados; escríbenos por WhatsApp".

---

## 2. Arquitectura: **Astro (sitio estático) + Apps Script + Google Sheets**

**Recomendación: Astro 5 en `sitio/`, con salida 100 % estática, Tailwind 4 (plugin de Vite) y scripts mínimos en TypeScript sin framework para el formulario y el Pase.** Las versiones exactas se fijan al crear el proyecto, con al menos 2 semanas de publicadas.

Por qué:
- **Instagram por dentro con 4G:** el HTML del hero llega ya armado, así que se ve aunque el JS no haya cargado. Solo bajan unos pocos KB de JS (el formulario y el QR). Las imágenes se optimizan solas a AVIF/WebP con `srcset`. Es el que mejor pinta el hero rápido (LCP).
- **Llegar al 13-nov:** es una página con 1 formulario y no necesita servidor. Astro se escribe como HTML con JSX, que es lo que Nico ya conoce.
- **Mantención por Nico:** todo el contenido sale de **un archivo** (`sitio/src/config/negocio.json`). Cambiar precio, descuento o FAQ es editar ese archivo y publicar.
- **Costo:** sitio estático en Vercel ($0 en Hobby, ver D3) + Apps Script ($0) + Sheets ($0). Cuotas de Apps Script (cuenta personal): 100 correos al día y 20.000 llamadas al día, sobra para esta campaña. Si se pasan los 100 correos diarios, la copia por correo se salta y el Pase igual sale en pantalla.

Descartadas:
- **Seguir con CRA:** está deprecado, no soporta Tailwind 4 y muestra la página en blanco hasta que carga ~260 KB de JS. Es lo peor para 4G.
- **Vite + React SPA:** tiene el mismo problema de pantalla en blanco y no trae optimización de imágenes.
- **Next.js:** sobra para una página. Trae más JS de base y funciones de servidor que no se necesitan.
- **HTML plano:** es lo más liviano, pero no tiene componentes ni optimización de imágenes, y el contenido se terminaría duplicando. Queda como **plan B técnico** si Astro se traba el día 1.

Estructura objetivo:
```
/AGENTS.md  /CLAUDE.md (@AGENTS.md)  /PLAN-LANDING-2026-11.md
/sitio/                    ← Root Directory en Vercel
  src/config/negocio.json  ← ÚNICA fuente de contenido y reglas del Pase
  src/pages/index.astro · pase.astro · privacidad.astro · pase-config.json.ts (publica la parte "pase" del config)
  src/components/ (Hero, PaseForm, PaseTicket, Incluye, ComoFunciona, Galeria, Ubicacion, Faq, Footer, BarraMovil)
  src/scripts/ (form.ts, ticket.ts, utm.ts, pixel.ts)
  scripts/optimizar-imagenes.mjs · scripts/validar-config.mjs
/apps-script/              ← código del backend del Pase (sin secretos), se pega o se sube con clasp
  Codigo.gs · README.md (cómo implementar, propiedades del script)
/legacy/fidelidad-v1/      ← congelado
```

**Un solo archivo de configuración.** `negocio.json` lo usa el sitio al construirse y además se publica en `/pase-config.json`. Apps Script lo lee de esa URL (con caché de 10 min y respaldo en PropertiesService), así que las reglas del Pase (cupos, vigencia, días, `activo`) viven en un solo lugar. Esquema base:
```json
{ "negocio": { "nombre": "Piscina Picaflor", "sector": "Picaflor", "comuna": "Litueche",
               "whatsapp_e164": "[POR CONFIRMAR]", "instagram": "piscinapicaflor", "maps_url": "[POR CONFIRMAR]" },
  "apertura": { "fecha": "2026-11-20", "titular": "Abrimos el 20" },
  "arriendo": { "precio_dia": "[POR CONFIRMAR]", "mostrar_precio": "[POR CONFIRMAR]", "incluye": [], "capacidad": "[POR CONFIRMAR]", "horario": "[POR CONFIRMAR]" },
  "pase": { "activo": true, "descuento_tipo": "porcentaje|monto", "descuento_valor": "[POR CONFIRMAR]",
            "dias_validos": "[POR CONFIRMAR]", "fechas_excluidas_alta_demanda": "[POR CONFIRMAR]",
            "cupos_totales": "[POR CONFIRMAR]", "emision_hasta": "[POR CONFIRMAR]", "vigencia_hasta": "[POR CONFIRMAR]",
            "condiciones": ["Un solo uso", "Nominal", "No acumulable", "Se valida al reservar por WhatsApp, no en la puerta", "No válido en días de alta demanda"],
            "version_condiciones": "v1" },
  "consentimiento": { "texto": "…", "version": "v1-2026-11" },
  "faq": [], "whatsapp_mensajes": { "general": "…", "con_pase": "Hola, tengo el Pase de Apertura {codigo} a nombre de {nombre}. Quiero reservar para {fecha}: {link}" } }
```
`validar-config.mjs`: en preview, los `[POR CONFIRMAR]` se ven marcados en pantalla. **En producción, el build falla si queda alguno.** Así es imposible publicar un dato inventado o vacío.

---

## 3. Arquitectura de la información (móvil primero)

Hay **un CTA único** ("Quiero mi Pase de Apertura") y **uno secundario** (WhatsApp con mensaje prellenado). Barra fija abajo en móvil: Pase (principal) + ícono de WhatsApp.

| # | Sección | Objetivo | Intención del copy (no es el copy final) |
|---|---------|----------|------------------------------------------|
| 1 | **Hero** (sobre el pliegue) | Message match con el reel: que la persona confirme que llegó al lugar correcto | Retoma la talla del clima de forma liviana; titular con **"Abrimos el 20"**; nombra el **"Pase de Apertura"** con su beneficio (descuento [POR CONFIRMAR]); "Piscina Picaflor · Litueche"; foto real de la piscina con gente; botón del Pase; microcopy "gratis · 30 segundos · lo usas al reservar por WhatsApp" |
| 2 | **Formulario del Pase** (justo debajo, sin modal) | Conversión | Pide lo mínimo y explica para qué sirve cada dato. Va justo después del hero porque en Instagram la gente no hace mucho scroll |
| 3 | **Qué incluye tu día** | Resolver la duda antes del WhatsApp | Piscina completa por el día, lo que incluye, capacidad, horario y, si el dueño acepta, "desde $X". Todo [POR CONFIRMAR] |
| 4 | **Cómo funciona** (3 pasos) | Quitar la fricción de la reserva | Sacas tu Pase → nos escribes por WhatsApp con tu código → reservas tu día con descuento. Las condiciones van a la vista: días, vigencia, no válido en alta demanda |
| 5 | **Galería real** (4–6 fotos, carga diferida) | Deseo y confianza | Solo fotos reales con gente y con permiso. Nada generado con IA |
| 6 | **Prueba social** | Confianza | **Solo si existe y es verificable**: mensajes reales de clientes con permiso, o fotos de eventos reales. Si no hay, la sección **no se muestra**. No se inventa nada |
| 7 | **Dónde queda** | Público B (de paso por la Ruta 78) | Sector Picaflor, Litueche; referencia de distancia desde el camino a Pichilemu [POR CONFIRMAR]; botón "Abrir en Google Maps" (sin iframe pesado) |
| 8 | **Preguntas frecuentes** (`<details>`, sin JS) | No necesitar otra pieza de contenido | **Las reales del WhatsApp del dueño** [POR CONFIRMAR]. Hipótesis a confirmar con él: precio, cuántas personas, horario, comida o parrilla, niños y seguridad, mascotas, abono y pago, qué pasa si llueve, estacionamiento, baños |
| 9 | **Cierre** | Segunda oportunidad | Repite el Pase + WhatsApp |
| 10 | **Pie** | Legal y contacto | Nombre, comuna, Instagram, enlace a **Privacidad**, © 2026 |

Tono: liviano, chileno y "premium sin ser chabacano". Identidad propia de la piscina: agua y turquesa, con tokens de color en `negocio.json`/CSS. **Nada de Nexo** (ni cobre ni sus tipografías). En el texto visible no va jerga técnica (bot, webhook, API, backend). El copy lo escribe `builder` y lo aprueba Nico.

---

## 4. Flujo del Pase (independiente de fidelidad: sin puntos ni referidos)

### 4.1 Formulario
| Campo | Regla | Por qué |
|-------|-------|---------|
| Nombre | Obligatorio, 2–60 caracteres | Va impreso en el Pase (es nominal) |
| WhatsApp | Obligatorio. Se normaliza a `+569XXXXXXXX` (acepta `9…`, `09…`, `+56 9…`, `56 9…`, con espacios) | Es la llave de idempotencia y el canal de reserva |
| Correo | **Opcional**, con la etiqueta "para mandarte una copia" | En el navegador de Instagram cada campo extra baja la conversión, y el canal del negocio es WhatsApp. El Pase sale en pantalla igual. Si lo deja, sirve para la copia y para el match de Meta (si dio consentimiento) |
| ¿Qué quieres celebrar o qué fecha? | Opcional, ≤ 80 caracteres o chips (cumpleaños · familia · empresa · bautizo/matrimonio · solo disfrutar) | Le da contexto al dueño cuando le escriben |
| Casilla de ofertas | **Opcional, sin marcar** (decisión de Nico) | Consentimiento libre y específico (21.719) |
| Campo trampa oculto + tiempo mínimo de 3 s | Si viene lleno o llega antes de tiempo, se descarta sin avisar | Antibots sin captcha |

Envío: `fetch` POST con cuerpo `text/plain` (JSON) a la URL del web app. Así no hay preflight de CORS. Se usa un `request_id` (uuid guardado en sessionStorage), un timeout de 15 s con AbortController y **1 reintento con el mismo `request_id`**. El botón se bloquea mientras envía. Si falla: mensaje amable + "Escríbenos por WhatsApp y te damos tu Pase igual".

### 4.2 Respuestas de Apps Script (`doPost`, acción `emitir`)
Bajo `LockService.getScriptLock()`, que serializa los envíos y elimina la carrera del doble envío:
1. Valida y normaliza. Si hay error: `{estado:"invalido", campo}`.
2. Lee la config (caché). Si `activo=false` o la fecha pasó `emision_hasta`: `{estado:"cerrado"}`.
3. Busca el WhatsApp en la hoja (TextFinder). Si existe: `{estado:"existente", pase}` con **el mismo Pase**, sin crear fila. Si ahora marcó la casilla y antes no, se actualiza el consentimiento con su fecha.
4. Si los Pases no anulados ya llegaron a `cupos_totales`: `{estado:"agotado"}`.
5. Genera un código **PICA-XXXX aleatorio** (alfabeto sin 0/O/1/I, al menos 1 letra para no chocar con los `PICA-0001` numéricos de fidelidad, y único en la hoja). Agrega la fila y suelta el candado.
6. Si dejó correo: manda la copia con MailApp (fuera del candado). Responde `{estado:"nuevo", pase}`.

`doGet?accion=consultar&codigo=` responde solo `{estado, nombre_pila, vigencia_hasta, dias_validos}`. Nunca devuelve teléfono ni correo.
Triggers: **diario** (marca `vencido` lo que pasó la vigencia) y **semanal** (lunes 9:00, resumen por correo al dueño, ver §5).
Propiedades del script (como un `.env`, nunca en el repo ni en documentos): `CONFIG_URL`, `ENTORNO` (prod/test), `CORREO_DUENO`, y para la API de conversiones más adelante `META_PIXEL_ID` y `META_CAPI_TOKEN`. Solo en el script de pruebas: `CUPOS_OVERRIDE` y `VIGENCIA_OVERRIDE`.

### 4.3 Consentimiento (19.628 hoy, 21.719 desde 1-dic)
- Bajo el botón va una línea **informativa**, sin casilla: "Usamos tu nombre y WhatsApp para emitir tu Pase y coordinar tu reserva. [Privacidad]". Base: lo pide el propio titular.
- Casilla **opcional**: "Quiero recibir ofertas de Piscina Picaflor por WhatsApp o correo, y que usen mi número para mostrarme sus anuncios en Instagram y Facebook. Puedo darme de baja cuando quiera escribiendo BAJA." El texto final lo revisa Nico. Se guarda `SI/NO`, la **fecha y hora** y la **versión del texto**.
- Página `/privacidad`: quién es el responsable (nombre o RUT del dueño [POR CONFIRMAR]), qué datos se piden, para qué, cuánto tiempo se guardan (propuesta: 12 meses desde la emisión), con quién se comparten (Google como almacenamiento, Meta solo con consentimiento), y los derechos de acceso, rectificación, supresión, oposición y portabilidad por WhatsApp o correo.
- **Solo las filas con `SI`** se exportan a la lista de Meta. El remarketing por interacción (gente que vio el video, visitó la página o interactuó en IG/FB) no necesita la lista.

### 4.4 El Pase en pantalla (respuesta inmediata, sin cambiar de página)
Reemplaza al formulario y lleva al usuario hasta él. Contiene: logo, "Pase de Apertura", **titular**, **código PICA-XXXX grande**, **QR** (→ `piscinapicaflor.cl/pase/#PICA-XXXX`), descuento, días válidos, fechas excluidas, "cupos limitados: N", vigencia y condiciones.
Acciones:
1. **"Reservar por WhatsApp con mi Pase"** (principal). Abre `wa.me/<negocio>` con el mensaje que trae código, nombre y link. El código queda en el chat del dueño, así que sirve de copia para los dos.
2. **"Guardar en galería"**. Dibuja el Pase en un canvas (sin html2canvas) y genera un PNG. Usa `navigator.share({files})` donde se pueda. Si no, descarga, y si tampoco, muestra la imagen con "mantén presionado para guardarla" (el caso típico del navegador de Instagram en iOS).
3. **"Copiar código"**.
4. Aviso de la copia por correo, si dejó correo.

El Pase se guarda en localStorage (con try/catch) para que, si vuelve a entrar, lo vea de nuevo.

### 4.5 Cómo valida el dueño en 10 segundos
1. Le llega el WhatsApp con "Pase de Apertura PICA-7K3Q a nombre de…" y el link.
2. Toca el link: `/pase/#PICA-7K3Q` muestra un veredicto grande: **VÁLIDO** (verde) / **YA USADO** / **VENCIDO** / **NO EXISTE**, con el nombre de pila, la vigencia y los días válidos.
3. Si reserva: abre la hoja en la app de Google Sheets, busca el código y cambia `estado` a **canjeado** (lista desplegable). Llena `fecha_reserva` y, si quiere, `valor_reserva`.

Se entrega una guía de 1 página para el dueño (T4.5).

### 4.6 Modelo de datos — hoja nueva **"Pases"** (y su gemela **"Pases-PRUEBAS"**)
`codigo · fecha_emision · nombre · whatsapp_e164 · email · celebracion · consentimiento_ofertas (SI/NO) · consentimiento_fecha · consentimiento_version · estado (emitido/canjeado/vencido/anulado) · vigencia_hasta · fecha_canje · fecha_reserva · valor_reserva · utm_source · utm_medium · utm_campaign · utm_content · utm_term · conjunto (A/B/R/organico/directo) · fbclid · referrer · navegador (instagram/facebook/otro) · request_id · entorno · notas`
Pestañas extra: **Resumen** (fórmulas, §5) y **Gasto** (Nico anota el gasto semanal por conjunto).
**No se modifica** ninguna hoja, base ni workflow de fidelidad.

---

## 5. Medición

- **Meta Pixel** (dataset en el portafolio del negocio, ID [POR CONFIRMAR]; Nico lo crea y verifica el dominio `piscinapicaflor.cl`). Se carga **después del evento `load`** para no frenar el hero.
  - `PageView` al cargar.
  - `Lead` solo cuando la respuesta es `nuevo`, con `eventID = codigo` (deduplica con la API de conversiones).
  - `Contact` en cada clic a WhatsApp, con el parámetro `ubicacion` (hero, barra, ticket, cierre).
  - Eventos propios: `PaseRepetido` (existente), `PaseGuardado`, `FormInicio` (primer foco), `PaseAgotado`.
  - Coincidencia avanzada (teléfono hasheado) **solo si dio consentimiento**.
  - El Pixel va solo en Production; en Preview, solo con `?pixel_debug=1` para probar en "Probar eventos".
- **UTM y conjuntos:** URL de los anuncios (borrador): `?utm_source=meta&utm_medium=paid&utm_campaign=apertura-nov26&utm_content={{adset.name}}&utm_term={{ad.name}}`, con conjuntos nombrados `A-zona`, `B-paso` y `R-remarketing`. El conjunto se deduce del primer carácter de `utm_content`. Link de la bio: `?utm_source=instagram&utm_medium=bio`. Se guarda el primer contacto (localStorage) y viaja con el formulario.
- **Embudo:** visitas (Meta) → `FormInicio` → `Lead` (hoja: Pases nuevos) → `Contact` (clic a WhatsApp) → canjeado (hoja: reservas).
- **API de conversiones:** **no entra en el lanzamiento.** En la semana 2, si los `Lead` de Meta quedan > 30 % bajo los Pases de la hoja, se activa desde Apps Script: `Lead` con `event_id = codigo`, solo para filas con consentimiento, con el token en las Propiedades del script.
- **Lo que ve el dueño:** la pestaña **Resumen** muestra, por semana y conjunto: Pases, % con consentimiento, canjeados, gasto (que anota Nico), **costo por Pase** y **costo por reserva**, y un semáforo contra la utilidad por día arrendado [POR CONFIRMAR]: una reserva no debe costar más que eso. Los **lunes a las 9:00** le llega un correo de 5 líneas. El costo por contacto (`Contact`) se lee en el Administrador de anuncios.
- Presupuesto ($150K / $270K recomendado / $450K al mes, lo elige el dueño) y la regla de no tocar nada los primeros 10 días se anotan en la pestaña Gasto para leer el resumen con ese contexto.

---

## 6. Rendimiento y activos

**Presupuesto de peso** (se mide con Lighthouse móvil, Slow 4G):
- LCP < 2,5 s · CLS < 0,1.
- JS propio ≤ 40 KB gzip (el Pixel se carga diferido).
- Carga inicial ≤ 500 KB.
- Hero ≤ 150 KB en AVIF con WebP de respaldo; **cada imagen ≤ 300 KB**; `srcset` 480/768/1080; `loading="lazy"` bajo el pliegue.
- Fuentes: 1 familia propia en woff2, con subset, o fuentes del sistema.
- **Sin video en el hero.** Si va video, va bajo el pliegue: póster + "tocar para ver", 720p H.264, ≤ 4 MB, ≤ 20 s, `preload="none"`, servido desde el propio sitio. Se elimina la dependencia de Cloudinary.

**Inventario de activos**
| Activo | Hoy | Quién lo provee | Estado |
|--------|-----|-----------------|--------|
| Foto hero: piscina real **con gente** | No existe | Nico (en la grabación del reel) | Ruta crítica |
| 4–6 fotos de galería con gente | No existen | Nico + papá | Ruta crítica |
| `Piscina1.heic`, `piscina2.heic` | En el repo | builder convierte (heic-convert → sharp) | Confirmar que son reales |
| `celebra-*.png`, `carrusel-eventos.png`, `matrimonio1.png` | Marca Gemini | — | **Excluidas** |
| `matrimonio_dron.mp4`, `piscinavideo.mp4` | 10 MB / 49 MB | builder recorta y comprime (póster + clip) | Confirmar evento real y permisos |
| Fotogramas del reel 1 (tarjeta del clima) para el hero | En producción | Nico | Para el message match |
| Logo | `logopica.png` 675 KB | Papá (vectorial [POR CONFIRMAR]); builder lo optimiza | — |
| Precio, qué incluye, capacidad, horario, descuento, días, cupos, vigencia, WhatsApp, FAQ, utilidad por día | — | Papá vía Nico ([artefacto de preguntas](https://claude.ai/artifact/XXYuBj5mwRetcRJWmSQjRC), solo lectura) | [POR CONFIRMAR] · **fecha límite dom 8-nov 20:00** |

**Permisos:** un "sí" por escrito (un WhatsApp sirve, se guarda) de cada adulto que aparece. **Menores: permiso de los padres**, y de preferencia sin caras reconocibles. **Prohibido generar con IA imágenes de la piscina o del lugar.**

---

## 7. Tareas por hito

Responsables: **N** = Nico · **B** = builder · **D** = dueño (papá). ⭐ = ruta crítica. Cada tarea toma ≤ 2 h.

### H0 · Saneamiento — jue 5 al vie 6-nov
| ID | Tarea | Dep. | Resp. | Aceptación verificable | Riesgo |
|----|-------|------|-------|------------------------|--------|
| T0.1 | Tag `fidelidad-v1` en `974a1f6` + rama `fidelidad-v1`; push con autorización de N | — | B/N | `git ls-remote origin` muestra el tag y la rama | Bajo |
| T0.2 | Rama de trabajo `landing-pase` (nunca se trabaja en `main`) | T0.1 | B | `git branch` | Bajo |
| T0.3 | `git mv` de `piscina-picaflor/`, `api/`, `vercel.json`, `package*.json` raíz → `legacy/fidelidad-v1/` + README (H-1, H-7, H-8, cómo retomarlo) | T0.2 | B | `git log --follow` conserva la historia; el README existe | Medio: los rewrites viejos dejan de existir (aceptado) |
| T0.4 | Sacar `node_modules/` del índice + `.gitignore` | T0.2 | B | `git ls-files \| grep -c ^node_modules/` = 0 | Bajo |
| T0.5 | `AGENTS.md` (propósito, alcance solo Pase, reglas duras, estructura, comandos, `main` = producción, pruebas sin ensuciar, fidelidad congelada) + `CLAUDE.md` = `@AGENTS.md` | T0.2 | B | Archivos presentes; CLAUDE.md de una línea | Bajo |
| T0.6 | `optimizar-imagenes.mjs` + conversión de los HEIC + tabla de inventario con la marca de exclusión | T0.3 | B | Ninguna salida > 300 KB; reporte en `sitio/assets-inventario.md` | Bajo |
| T0.7 ⭐ | Conseguir del papá las respuestas, fotos/videos con gente y permisos | — | N/D | Respuestas cargadas en `negocio.json` antes del **dom 8-nov 20:00** | **Alto** |
| T0.8 | Cuenta Google del negocio (D4): crear las hojas "Pases" y "Pases-PRUEBAS" con los encabezados que entrega B | — | N | Las 2 hojas existen y B tiene permiso de editor | Medio |
| T0.9 | (Si N lo aprueba, ver D6) **Página puente** estática: logo + "Abrimos el 20" + WhatsApp, para que la bio no lleve a un formulario roto | T0.3 | B → N publica | En vivo en ≤ 1 h; Lighthouse ≥ 95 | Bajo |

### H1 · Landing + Pase — sáb 7 al mar 10-nov
| ID | Tarea | Dep. | Resp. | Aceptación | Riesgo |
|----|-------|------|-------|------------|--------|
| T1.1 ⭐ | Crear Astro en `sitio/` + Tailwind 4 + tokens de color + `npm run build` | T0.2 | B | El build pasa; `dist/` estático | Medio (si se traba → plan B HTML) |
| T1.2 ⭐ | `negocio.json` + `validar-config.mjs` + endpoint `/pase-config.json` | T1.1 | B | Preview muestra los [POR CONFIRMAR]; el build de prod falla con ellos | Bajo |
| T1.3 ⭐ | Hero con message match + barra fija móvil | T1.2 | B | "Abrimos el 20" y "Pase de Apertura" visibles a 360×640 sin scroll | Bajo |
| T1.4 | Incluye · Cómo funciona · Dónde · FAQ · Cierre · Pie · `/privacidad` | T1.2 | B | Todo el texto sale de `negocio.json` (grep: nada escrito a mano en los componentes) | Bajo |
| T1.5 | Galería con `astro:assets`, carga diferida | T0.6 | B | Cada imagen ≤ 300 KB; CLS < 0,1 | Bajo |
| T1.6 ⭐ | Apps Script `emitir`/`consultar` + candado + validaciones + copia por correo; implementar **solo el de PRUEBAS** | T0.8 | B (N implementa el web app) | 20 envíos simultáneos con el mismo número generan **1** fila | Medio |
| T1.7 ⭐ | Formulario: validaciones, campo trampa, `request_id`, timeout y reintento, los 6 estados, captura de UTM | T1.3, T1.6 | B | Pasan los casos de §8 contra PRUEBAS | Medio |
| T1.8 ⭐ | Pase: render, QR, PNG con canvas, compartir/descargar/mantener presionado, WhatsApp con el Pase, copiar, restaurar desde localStorage | T1.7 | B | El PNG se guarda en Android Chrome e iOS Safari; en Instagram funciona al menos "mantener presionado" | **Alto** (navegadores internos) |
| T1.9 | `/pase/#codigo` con veredicto grande | T1.6 | B | Muestra los 4 estados con datos de PRUEBAS | Bajo |
| T1.10 | Aviso para los enlaces viejos `#/u`, `#/dashboard`, `#/r` | T1.3 | B | Los 3 enlaces muestran el aviso + WhatsApp | Bajo |
| T1.11 | Borrador de copy completo (tono, sin jerga) para que N lo apruebe | T1.4 | B → N | N escribe "copy OK" | Medio |
| T1.12 ⭐ | Cargar el contenido real del papá y las fotos finales | T0.7 | B | `validar-config` de prod pasa sin [POR CONFIRMAR] | **Alto** (depende de T0.7) |

### H2 · Medición — mar 10 al mié 11-nov
| ID | Tarea | Dep. | Resp. | Aceptación | Riesgo |
|----|-------|------|-------|------------|--------|
| T2.1 ⭐ | Crear el dataset/Pixel, verificar el dominio, pasar el ID → variable en Vercel `PUBLIC_META_PIXEL_ID` (Production) | — | N | El dominio aparece verificado en el Administrador comercial | Medio |
| T2.2 | `pixel.ts`: carga diferida + PageView/Lead/Contact/eventos propios | T1.8, T2.1 | B | "Probar eventos" muestra los 4 eventos, con Lead deduplicable | Bajo |
| T2.3 | Documento de convención UTM + URL para los anuncios (borrador, nada activado) | — | B | `sitio/MEDICION.md` | Bajo |
| T2.4 | Pestañas Resumen y Gasto + trigger semanal + trigger diario de vencidos | T1.6 | B (N implementa) | El correo de prueba llega con números de PRUEBAS | Bajo |
| T2.5 | (Semana 2, opcional) API de conversiones desde Apps Script | T2.4 | B | Lead del navegador y del servidor deduplicados en Events Manager | Bajo |

### H3 · QA — mié 11 al jue 12-nov
| ID | Tarea | Dep. | Resp. | Aceptación | Riesgo |
|----|-------|------|-------|------------|--------|
| T3.1 ⭐ | Matriz de casos §8 en la preview contra PRUEBAS | H1 | B | 100 % de los casos en verde, con evidencia (capturas) | Medio |
| T3.2 ⭐ | Dispositivos reales: Android/iOS × Chrome/Safari/Instagram/Facebook | T3.1 | N (con guía de B) | Checklist firmada por N | **Alto** |
| T3.3 | Lighthouse móvil Slow 4G + presupuesto de peso | H1 | B | LCP < 2,5 s, CLS < 0,1, JS ≤ 40 KB | Medio |
| T3.4 | Skill **`auditor-landing-pages`** sobre la preview; arreglar los P0 | T3.1 | B | 0 P0 abiertos | Medio |
| T3.5 | Accesibilidad básica: contraste AA, toques ≥ 44 px, labels | H1 | B | Lo confirma el informe del auditor | Bajo |

### H4 · Despliegue — jue 12 (noche) al vie 13-nov (colchón)
| ID | Tarea | Dep. | Resp. | Aceptación | Riesgo |
|----|-------|------|-------|------------|--------|
| T4.1 ⭐ | Vercel: Root Directory `sitio`, preset Astro, variables de Production (`PUBLIC_PASE_ENDPOINT` = script prod, Pixel) y Preview (= script de pruebas) | H3 | N (B guía) | Una preview de la rama compila con la configuración nueva | Medio |
| T4.2 ⭐ | Implementar el Apps Script de **producción** en la hoja "Pases" | T1.6 | N | Responde a `consultar` con un código inexistente → "no existe" | Bajo |
| T4.3 ⭐ | **N escribe "PUBLICAR"** → merge `landing-pase` → `main` → producción | T4.1, T4.2 | N | Deployment READY | Medio |
| T4.4 ⭐ | Verificación en vivo (§9) | T4.3 | N + B | Checklist completa | Medio |
| T4.5 | Guía de 1 página para el dueño ("cómo validar un Pase en 10 s") + ingesta en la bóveda | T4.4 | B | Entregada a N | Bajo |

**Ruta crítica:** T0.7 (datos y fotos del papá) → T1.12 → T3.2 → T4.3 · y en paralelo T1.1 → T1.6 → T1.7 → T1.8 → T3.1 → T4.3 · y T2.1 (Pixel) antes del mié 11.

**Plan B (si H1 no está listo el mar 10 a las 20:00):** se publica la **versión mínima**: hero + formulario + Pase (con QR, guardar y WhatsApp) + condiciones + 3 FAQ + privacidad. Se posterga la galería, `/pase/#codigo` (el dueño valida directo en la hoja), la copia por correo y la sección Dónde (queda solo el link a Maps). Si es Astro lo que se traba (T1.1), la misma versión mínima se arma en HTML plano leyendo el mismo `negocio.json`.

---

## 8. Pruebas sin ensuciar producción

- **Dos entornos que nunca se cruzan:** el Apps Script de **PRUEBAS** escribe en "Pases-PRUEBAS" (`ENTORNO=test`) y el de **producción** escribe en "Pases". Vercel Preview y `npm run dev` apuntan **solo** al de pruebas, porque `PUBLIC_PASE_ENDPOINT` cambia según el entorno. **Nunca se mandan datos falsos al de producción.**
- La única prueba en producción (T4.4) la hace **Nico con su número real**. Después marca la fila como `anulado` con la nota "QA", y no cuenta para los cupos.
- Para forzar "agotado" y "vencido" sin tocar la configuración real: `CUPOS_OVERRIDE=1` y `VIGENCIA_OVERRIDE=<ayer>`, que existen solo en el script de pruebas.
- `builder` baja cualquier servidor de desarrollo por su PID al terminar. Si usa Python en Windows, escribe con `newline='\n'`.

| Caso | Cómo | Esperado |
|------|------|----------|
| Mala conexión | DevTools en Slow 3G y offline en medio del envío | Reintenta con el mismo `request_id`; nunca 2 filas; mensaje amable + WhatsApp |
| Doble envío | Doble toque, 2 pestañas, 20 envíos simultáneos | 1 fila; el segundo envío responde "existente" con el mismo código |
| Mismo número en otro formato | `912345678`, `+56 9 1234 5678`, `0912345678` | Mismo Pase |
| Sin consentimiento | Casilla sin marcar | El Pase sale; `consentimiento_ofertas=NO`; queda fuera de la exportación |
| Consentimiento después | Primero NO, luego SI con el mismo número | Mismo Pase; se actualiza el consentimiento con su fecha |
| Cupo agotado | `CUPOS_OVERRIDE=1` | Mensaje de agotado + WhatsApp; evento `PaseAgotado` |
| Pase vencido | `VIGENCIA_OVERRIDE` + trigger diario | `/pase/#codigo` muestra VENCIDO |
| Emisión cerrada | `activo:false` en una preview | Mensaje de cerrado |
| Datos inválidos / bot | Nombre vacío, número de 8 dígitos, campo trampa lleno | Error en el campo; el bot se descarta sin fila |
| Android Chrome · iOS Safari · Instagram (Android e iOS) · Facebook | Dispositivos reales | El Pase se ve; se puede guardar (al menos manteniendo presionado); WhatsApp abre el número correcto con el mensaje |
| Enlaces viejos de fidelidad | `/#/u/PICA-0001`, `/#/dashboard/…`, `/#/r/…` | Aviso + WhatsApp, sin error |
| Sin JS | JS desactivado | Se ve el hero, la info y un botón de WhatsApp (`<noscript>`) |

---

## 9. Despliegue y reversa

- **Quién autoriza:** solo Nico, escribiendo **"PUBLICAR"**. `builder` nunca hace merge a `main` ni toca Vercel o Meta sin esa palabra. **Meta Ads solo en borrador; ACTIVAR lo escribe Nico.**
- **Cómo se publica:** se hace merge de `landing-pase` a `main` y Vercel despliega solo (está conectado a GitHub).
- **Cómo se vuelve atrás (< 2 min):** en Vercel → Deployments → el anterior → **Instant Rollback**, y después `git revert` del merge para que `main` quede igual a lo publicado. Ojo: el deployment anterior hoy es el sitio de fidelidad roto. Por eso la página puente (T0.9) también es el mejor punto de retorno. Si el problema es solo el formulario, se cambia `pase.activo=false` y se publica: la página queda informativa + WhatsApp.
- **Verificación en vivo (T4.4):**
  1. `piscinapicaflor.cl` y `www` responden con HTTPS.
  2. **Message match** con el reel: "Abrimos el 20" + "Pase de Apertura" visibles sin scroll en el celular de Nico, abriendo desde un anuncio de vista previa de Instagram.
  3. Un Pase real de Nico: fila en "Pases", correo y WhatsApp con el código.
  4. `/pase/#codigo` muestra VÁLIDO; después N lo marca `anulado`.
  5. Events Manager registra PageView, Lead y Contact.
  6. Los enlaces viejos muestran el aviso.
  7. La skill **`auditor-landing-pages`** corre sobre producción.
  8. Lighthouse móvil sobre producción.

---

## 10. Riesgos y decisiones abiertas (con recomendación)

| # | Riesgo o decisión | Recomendación |
|---|-------------------|---------------|
| D1 | **Los datos y fotos del papá llegan tarde** (ruta crítica) | Fecha límite dom 8-nov 20:00. El build de producción bloquea los [POR CONFIRMAR]. Si no llegan, plan B con el texto mínimo que sí esté confirmado |
| D2 | **Imágenes con marca de Gemini** | No se usan. Fotografiar con gente real el mismo día de la grabación del reel. Si el dueño jura que son reales y sin editar, igual se usan sin el texto encima y después de revisar el original |
| D3 | **Vercel Hobby es "no comercial"** (el plan exacto de la cuenta está [POR CONFIRMAR]) | Lanzar en Vercel el 13 (no hay tiempo para mover el dominio). Después del 20, mover el sitio estático a **Cloudflare Pages** (gratis, permite uso comercial) o pagar Vercel Pro (US$20 al mes). Decide Nico |
| D4 | **De quién es la cuenta Google** dueña de la hoja y del script | Una cuenta del **negocio** (que el papá pueda abrir), con Nico como editor. No usar la cuenta de Nexo |
| D5 | **Mostrar el precio** en la landing | Mostrar "desde $X" si el papá acepta: filtra consultas de solo precio y baja el costo por reserva |
| D6 | **Hoy la bio de IG lleva a un formulario roto** (n8n no existe) | Publicar la **página puente** (T0.9) ya, con autorización de Nico. También deja un buen punto de retorno |
| D7 | **Ley 21.719** (posible postergación a 2027) | Diseñar ya para la 21.719: casilla opcional, texto con versión, `/privacidad`, baja por WhatsApp. No depende de la postergación |
| D8 | **Base de fidelidad con personas reales** (y la duda Airtable vs Sheets) | No se mezcla con la lista del Pase ni se usa para anuncios sin un consentimiento nuevo. Se revisa en la fase de fidelidad |

---

## 11. Al aprobar este plan (lo que hago yo en esta sesión, antes de despachar a `builder`)
1. Copiar este plan a `Piscina_picaflor/PLAN-LANDING-2026-11.md` (documento, no código de producción).
2. Ingesta en la bóveda: `Clientes/piscina-picaflor.md` (estado, H-1, H-2, decisiones Apps Script y casilla opcional, contradicciones marcadas), una fila en `index.md` y una entrada en `log.md`.
3. Despachar a `builder` empezando por H0 (T0.1–T0.6; T0.9 solo si Nico aprueba D6), con este archivo como contrato.

## Verificación de que el plan se cumplió
- Preview: la matriz de §8 en verde contra PRUEBAS, Lighthouse dentro del presupuesto y el auditor sin P0.
- Producción: checklist de §9 completa, una fila QA anulada en "Pases", eventos en Events Manager y nada de fidelidad borrado (`git show fidelidad-v1` y `legacy/` presentes).

# Sistema de fidelidad v1 — CONGELADO (5-nov-2026)

Este es el programa de puntos y referidos original de Piscina Picaflor. Se congeló por decisión de Nico el 5-nov-2026 para dar paso a la landing del **Pase de Apertura**. **No se borró nada**: ni código, ni workflows, ni plantillas de correo.

- Tag y rama de respaldo: `fidelidad-v1` (apuntan al commit `974a1f6`, el último estado de `main` antes del reordenamiento).
- Para retomarlo en la fase futura: parte desde ese tag o esa rama, **no desde `main`**.

## Qué hay aquí
| Ruta | Contenido |
|------|-----------|
| `app/` | App React (Create React App): landing de puntos, `PortalUsuario` (`/u/:codigo`), `UserDashboard` (`/dashboard/:code`), `BannerReferido` y `PopupExito` |
| `app/workflows/` | Los 3 workflows exportados de n8n (registro, consulta y dashboard). **Hoy son la única copia que existe** |
| `app/EMAIL_TEMPLATE_BIENVENIDA.html` | Plantilla del correo de bienvenida |
| `api/` | Dos funciones proxy de Vercel (`registro`, `usuario`). Apuntaban a `webhook-test` de n8n |
| `vercel.json`, `package.json`, `package-lock.json` | Configuración de la raíz de antes del reordenamiento |

## Estado verificado el 5-nov-2026
- 🔴 **La instancia de n8n `ppicaflor.app.n8n.cloud` ya no existe** (responde "404 – No instance here"). Ningún webhook de este sistema funciona.
- `/api/usuario` respondía error 500 en el sitio en vivo por la misma razón.
- Los datos reales de usuarios, si existen, están en Google Sheets o en Airtable (ver la contradicción de abajo). **No se leyeron ni se tocaron.**

## Contradicciones abiertas (no se resolvieron, solo se marcan)
- `app/google_sheets_structure.md` dice que los datos viven en Google Sheets (hojas Usuarios e Historial), pero `app/workflows/Workflow_dasboard_cliente.json` lee de **Airtable** (base "Picaflor"). Hay que confirmar cuál es la fuente real.
- Los enlaces de fidelidad usan `HashRouter` (`/#/u/…`, `/#/dashboard/…`, `/#/r/…`) y están en correos ya enviados. La landing nueva muestra un aviso en esas rutas.
- `app/README.md` dice que "ser referido" da +50; el commit final dice que invitar amigos da +50. Los puntos no se rediseñaron.

## Reglas mientras esté congelado
- No se muestra ni se menciona en la landing nueva.
- El Pase no otorga puntos ni depende de este sistema, y no comparte hoja ni base con él.
- No se usan estos datos para anuncios sin un consentimiento nuevo.

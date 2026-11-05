# Medicion (borrador, nada activado)

## Eventos de Meta (Pixel `PUBLIC_META_PIXEL_ID`, solo en Production)
| Evento | Cuando | Notas |
|---|---|---|
| `PageView` | Al cargar (despues del evento `load`) | |
| `FormInicio` (personalizado) | Primer foco en el formulario | |
| `Lead` | Solo si el Pase es **nuevo** | `eventID` = codigo del Pase (deduplica con la API de conversiones) |
| `PaseRepetido` / `PaseAgotado` / `PaseGuardado` | Pase existente / sin cupos / guardado como imagen | |
| `Contact` | Cada clic a WhatsApp | `ubicacion`: hero, barra, ticket, cierre, aviso |

Coincidencia avanzada (telefono con hash): solo si la persona marco la casilla de ofertas.
En Preview y desarrollo el Pixel no se carga (no hay variable). Para probar en "Probar eventos", crear la variable en Preview con un Pixel de pruebas.

## UTM para los anuncios (usar `{{...}}` de Meta)
`?utm_source=meta&utm_medium=paid&utm_campaign=apertura-nov26&utm_content={{adset.name}}&utm_term={{ad.name}}`

Nombrar los conjuntos empezando por la letra del publico: `A-zona`, `B-paso`, `R-remarketing`. El backend deduce la columna `conjunto` de la primera letra de `utm_content`.
Link de la bio de Instagram: `?utm_source=instagram&utm_medium=bio`.

## Embudo
visitas (Meta) > `FormInicio` > `Lead` (Pases nuevos en la hoja) > `Contact` (clics a WhatsApp) > `canjeado` (reservas en la hoja).

## Lista de remarketing
Exportar de la hoja solo las filas con `consentimiento_ofertas = SI`. El remarketing por interaccion (video, visitas, IG/FB) no necesita la lista.

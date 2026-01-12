# Estructura de Google Sheets

Para que el sistema funcione correctamente, tu Google Sheet debe tener las siguientes hojas y columnas exactas.

## Hoja 1: "Usuarios"

**Columnas (Orden exacto):**
A. **Codigo** (Ej: PICA-0001)
B. **Nombre** (Nombre completo)
C. **Email** (Correo electrónico)
D. **Telefono** (Número de celular)
E. **Puntos** (Número entero)
F. **Referido Por** (Código del usuario que recomendó, puede estar vacío)
G. **Fecha Registro** (Fecha ISO o formato texto)

---

## Hoja 2: "Historial"

**Columnas (Orden exacto):**
A. **Fecha** (Fecha del evento)
B. **Usuario Codigo** (Código del usuario afectado)
C. **Tipo** (Tipos: `Registro`, `Referido`, `Visita`, `Canje`)
D. **Puntos** (Cantidad de puntos, positivos o negativos)
E. **Relacionado Con** (Información extra, ej: código del nuevo usuario referido)
F. **Descripcion** (Texto descriptivo para mostrar en el portal)

---

## 💡 Notas Importantes

1. **ID de la Hoja**: Debes copiar el ID de tu Google Sheet (parte de la URL entre `/d/` y `/edit`) y ponerlo en los nodos de Google Sheet en N8N.
2. **Permisos**: Asegúrate de compartir la hoja con el correo de servicio de Google Cloud que usa N8N (client_email en tus credenciales de N8N).
3. **Puntos**: La columna Puntos en la hoja "Usuarios" es el saldo actual. El historial es solo un log.

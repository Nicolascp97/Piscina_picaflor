# 📧 Instrucciones para Actualizar el Template de Email en n8n

## ⚠️ Problema Identificado

El correo de bienvenida tiene dos problemas principales:
1. **Defectos visuales** en la visualización móvil y de escritorio
2. **Link incorrecto** del botón "IR A MI DASHBOARD" que no apunta al dashboard correcto

---

## ✅ Solución Implementada

He creado un template HTML optimizado en el archivo: `EMAIL_TEMPLATE_BIENVENIDA.html`

### 🎨 Mejoras Visuales:

- ✅ **Responsive Design**: Se adapta perfectamente a móviles y PC
- ✅ **Compatibilidad con Gmail**: Usa tablas en lugar de divs
- ✅ **Estilos inline**: Para máxima compatibilidad con clientes de correo
- ✅ **Gradientes Teal**: Mantiene la identidad de marca (#00d1b2 a #00b89c)
- ✅ **Diseño profesional**: Con sombras, bordes redondeados y espaciado correcto
- ✅ **QR visible**: Tarjeta destacada con fondo degradado y borde punteado
- ✅ **Código legible**: Tipografía monospace grande y clara

### 🔗 Link Corregido del Dashboard:

**ANTES (incorrecto):**
```
https://piscinapicaflor.cl/#/u/{{codigo}}
```

**AHORA (correcto):**
```
https://piscinapicaflor.cl/#/dashboard/{{codigo}}
```

---

## 📝 Cómo Implementar en n8n

### Paso 1: Abrir tu Workflow de Registro en n8n

1. Ve a https://ppicaflor.app.n8n.cloud
2. Abre el workflow que maneja el webhook `/webhook/registro`
3. Busca el nodo de **Gmail** o **Send Email**

### Paso 2: Reemplazar el HTML del Email

1. En el nodo de Gmail, busca el campo **"HTML"** o **"Body"**
2. Elimina el HTML actual
3. Copia **TODO** el contenido del archivo `EMAIL_TEMPLATE_BIENVENIDA.html`
4. Pégalo en el campo HTML del nodo

### Paso 3: Configurar las Variables Dinámicas

El template usa las siguientes variables que debes mapear en n8n:

```html
{{nombre}}           → Nombre del usuario
{{codigo}}           → Código PICA-XXXX del usuario
{{qr_code_url}}      → URL del QR code generado
```

**En n8n, reemplaza:**

- `{{nombre}}` por `{{ $json.nombre }}` o la variable correspondiente
- `{{codigo}}` por `{{ $json.codigo }}`
- `{{qr_code_url}}` por la URL del QR generado en tu workflow

### Paso 4: Verificar el QR Code

Asegúrate de que el QR Code apunte a:
```
https://piscinapicaflor.cl/#/dashboard/{{codigo}}
```

**NO** a:
```
https://piscinapicaflor.cl/#/u/{{codigo}}  ❌
```

### Paso 5: Pruebas

1. Guarda el workflow
2. Haz un registro de prueba
3. Verifica el correo en:
   - Gmail en PC
   - Gmail en móvil
   - Outlook (opcional)
4. Confirma que el botón redirija correctamente al dashboard

---

## 🔧 Personalización Opcional

Si quieres ajustar colores o textos:

### Colores principales:
```css
/* Teal principal */
#00d1b2

/* Teal oscuro */
#00b89c

/* Fondos claros */
#f0fdfa, #ccfbf1
```

### Textos clave:
- Línea 298: Título del header
- Línea 307: Saludo personalizado
- Línea 312: Descripción
- Línea 377: Texto del botón CTA

---

## 📱 Preview del Email

El email tendrá:

```
┌─────────────────────────────┐
│   [Gradiente Teal]          │
│   🏊 Icono de gota          │
│   ¡Ya eres VIP!             │
│   Bienvenido a Piscina...   │
└─────────────────────────────┘
│                             │
│   ¡Hola {Nombre}! 👋        │
│   Tu registro fue exitoso   │
│                             │
│ ┌─────────────────────────┐ │
│ │  [QR Code Grande]       │ │
│ │                         │ │
│ │  Tu código:             │ │
│ │  PICA-XXXX              │ │
│ └─────────────────────────┘ │
│                             │
│ 🚀 ¿Cómo sumar puntos?      │
│ • Visita: Gana puntos...    │
│ • Referidos: Gana 50 pts    │
│                             │
│ [IR A MI DASHBOARD →]       │
│                             │
│ © 2026 Piscina Picaflor     │
└─────────────────────────────┘
```

---

## ✅ Checklist de Implementación

- [ ] Abrir workflow en n8n
- [ ] Copiar HTML del archivo EMAIL_TEMPLATE_BIENVENIDA.html
- [ ] Pegar en nodo de Gmail
- [ ] Mapear variables: nombre, codigo, qr_code_url
- [ ] Verificar que QR apunte a /dashboard/{{codigo}}
- [ ] Verificar que botón apunte a /dashboard/{{codigo}}
- [ ] Guardar workflow
- [ ] Hacer registro de prueba
- [ ] Revisar email en móvil
- [ ] Revisar email en PC
- [ ] Confirmar que el botón funcione

---

## 🆘 Soporte

Si tienes problemas con la implementación:

1. Verifica que las variables en n8n coincidan con el template
2. Asegúrate de que el QR se esté generando correctamente
3. Revisa los logs del workflow en n8n
4. Confirma que el dominio sea `piscinapicaflor.cl`

---

**Creado el:** 14 de enero de 2026
**Última actualización:** 14 de enero de 2026

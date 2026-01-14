# Ejemplo de Respuesta del Webhook de Registro - ACTUALIZADO

## ✨ Nueva estructura simplificada (Códigos correlativos)

El componente PopupExito ahora espera una respuesta JSON directa con esta estructura:

```json
{
  "success": true,
  "data": {
    "codigo": "PICA-0002",
    "puntos": 20
  }
}
```

## Ejemplos de respuestas válidas

### Ejemplo 1: Usuario nuevo sin referido (20 puntos)
```json
{
  "success": true,
  "data": {
    "codigo": "PICA-0001",
    "puntos": 20
  }
}
```

### Ejemplo 2: Usuario con referido (70 puntos)
```json
{
  "success": true,
  "data": {
    "codigo": "PICA-0042",
    "puntos": 70
  }
}
```

### Ejemplo 3: Usuario referido con bono de 50 puntos adicionales
```json
{
  "success": true,
  "data": {
    "codigo": "PICA-0123",
    "puntos": 70
  }
}
```

## 🎯 Funcionalidades implementadas en el PopupExito

### 1. **QR Dinámico**
- Usa `qrcode.react` (QRCodeSVG)
- Genera automáticamente el QR con el valor del `codigo`
- El QR contiene solo el código (ej: "PICA-0042")

### 2. **Botón Copiar Código**
- Icono en la esquina superior derecha del cuadro de código
- Al hacer clic, copia el código al portapapeles
- Muestra feedback visual (check verde) durante 2 segundos

### 3. **WhatsApp Directo**
- Botón verde "Invitar amigos (+50 pts)"
- Abre `https://wa.me/?text=` con mensaje personalizado
- Mensaje incluye el código del socio para que otros lo usen como referido

**Mensaje enviado:**
```
¡Hola! Inscríbete en el Club Picaflor usando mi código de referido: PICA-0042 y suma puntos para tu próxima visita. Regístrate aquí: https://piscina-picaflor.vercel.app/r/PICA-0042
```

### 4. **IDs HTML actualizados**
- `#tu-codigo`: Muestra el código PICA-XXXX
- `#tus-puntos`: Muestra los puntos (20 o 70)

## 📦 Datos guardados en localStorage

Después de un registro exitoso, se guarda automáticamente:

```javascript
{
  "nombre": "Juan Pérez",
  "codigo": "PICA-0042",
  "puntos": 70,
  "fechaRegistro": "2026-01-14T15:30:00.000Z"
}
```

**Claves en localStorage:**
- `picaflor_user`: Objeto completo del usuario
- `picaflor_codigo`: Solo el código (para acceso rápido)
- `picaflor_temp_nombre`: Nombre temporal del formulario (se limpia después del registro)

## 🔗 Enlaces generados automáticamente

1. **Portal personal**: `https://piscina-picaflor.vercel.app/u/PICA-0042`
2. **Link de referidos**: `https://piscina-picaflor.vercel.app/r/PICA-0042`

## ⚠️ Importante para el Backend

El webhook de n8n debe responder con:
- `success: true` para indicar éxito
- `data.codigo`: String con formato "PICA-XXXX" (códigos correlativos)
- `data.puntos`: Número (20 para usuarios sin referido, 70 para usuarios referidos)

**Nota:** El nombre del usuario se toma del formulario y se guarda temporalmente en localStorage antes de enviar la petición.

## 🧪 Testing rápido

Para probar en la consola del navegador después de un registro:

```javascript
// Ver datos guardados
console.log(JSON.parse(localStorage.getItem('picaflor_user')));

// Simular respuesta del backend
const respuesta = { success: true, data: { codigo: "PICA-0099", puntos: 70 } };
console.log('Código:', respuesta.data.codigo);
console.log('Puntos:', respuesta.data.puntos);
```

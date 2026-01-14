# Ejemplo de Respuesta del Webhook de Registro

## Estructura esperada de la respuesta de n8n

El componente PopupExito está preparado para recibir una respuesta con esta estructura:

```json
{
  "success": true,
  "data": {
    "resultado": "¡Bienvenida María! Tu código de socio es PICA-0042 y has comenzado con 70 puntos. Comparte tu código para ganar más puntos."
  }
}
```

**Nota importante**: El nombre del usuario se pasa automáticamente desde el formulario, por lo que no es necesario que el webhook lo incluya en la respuesta. Sin embargo, si el nombre está en el texto de `resultado`, será extraído de ahí.

## Ejemplos de textos válidos en `data.resultado`

El sistema extrae automáticamente el código y los puntos del texto. Aquí hay ejemplos válidos:

### Ejemplo 1: Usuario con referido (70 puntos)
```json
{
  "success": true,
  "data": {
    "resultado": "¡Bienvenido Juan! Tu código es PICA-0001 y comienzas con 70 puntos por haber sido referido."
  }
}
```

### Ejemplo 2: Usuario sin referido (20 puntos)
```json
{
  "success": true,
  "data": {
    "resultado": "Hola, Ana. Tu código de socio PICA-0123 está listo. Tienes 20 pts iniciales."
  }
}
```

### Ejemplo 3: Formato alternativo
```json
{
  "success": true,
  "data": {
    "resultado": "Registro exitoso. Código: PICA-0999, Puntos: 20"
  }
}
```

## Qué extrae el sistema

El componente PopupExito usa expresiones regulares para extraer:

1. **Código de socio**: Busca el patrón `PICA-XXXX` (insensible a mayúsculas/minúsculas)
2. **Puntos**: Busca un número seguido de "puntos", "pts" o "puntos" (ej: "70 puntos", "20 pts")
3. **Nombre**: Intenta extraer el nombre después de "Bienvenido/a" o "Hola"

## Datos guardados en localStorage

Después de un registro exitoso, se guarda:

```javascript
{
  "nombre": "María",
  "codigo": "PICA-0042",
  "puntos": 70,
  "fechaRegistro": "2026-01-14T10:30:00.000Z"
}
```

Claves en localStorage:
- `picaflor_user`: Objeto completo del usuario
- `picaflor_codigo`: Solo el código (para acceso rápido)

## Enlaces generados automáticamente

1. **Portal personal**: `https://piscina-picaflor.vercel.app/u/PICA-0042`
2. **Link de referidos**: `https://piscina-picaflor.vercel.app/r/PICA-0042`

## Mensaje de WhatsApp

Cuando el usuario presiona "Invitar amigos", se genera este mensaje:

```
¡Hola! Inscríbete en el Club Picaflor usando mi código de referido: PICA-0042 y suma puntos para tu próxima visita. Regístrate aquí: https://piscina-picaflor.vercel.app/r/PICA-0042
```

## Fallback

Si no se puede extraer el código del texto, el componente:
1. Muestra un mensaje en la consola: "No se pudo extraer el código de la respuesta"
2. Intenta usar la estructura antigua (si `datos.codigo` y `datos.puntos` existen directamente)
3. Muestra un spinner de "Procesando tu registro..." si no hay datos válidos

# Configurar CORS en n8n - Webhook info-socio

## 🎯 Objetivo
Permitir que el dashboard móvil acceda al webhook sin errores de CORS.

## 📋 Pasos para configurar CORS en n8n

### Opción 1: Configuración en el nodo Webhook (Más simple)

1. **Abre tu workflow** en n8n (el que tiene `webhook-test/info-socio`)

2. **Haz clic en el nodo "Webhook"** (el primero del flujo)

3. **Busca la sección "Options"** o "Response"

4. **Activa/Habilita "Response Headers"**

5. **Agrega estos headers**:
   ```
   Name: Access-Control-Allow-Origin
   Value: *
   
   Name: Access-Control-Allow-Methods
   Value: POST, GET, OPTIONS
   
   Name: Access-Control-Allow-Headers
   Value: Content-Type, Authorization
   ```

6. **Guarda el workflow**

---

### Opción 2: Usar nodo "Set" antes de responder (Más control)

Si la Opción 1 no funciona, usa esta:

1. **Abre tu workflow** en n8n

2. **ANTES del nodo "Respond to Webhook"**, agrega un nodo **"Set"**

3. **En el nodo Set, configura**:
   - Keep Only Set: NO (desactivado)
   - Add Field → Name: `headers`
   - Type: `Object`

4. **En el objeto headers, agrega**:
   ```json
   {
     "Access-Control-Allow-Origin": "*",
     "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
     "Access-Control-Allow-Headers": "Content-Type, Authorization",
     "Access-Control-Allow-Credentials": "true"
   }
   ```

5. **Conecta el flujo**: 
   ```
   Webhook → [tu lógica] → Set (headers CORS) → Respond to Webhook
   ```

6. **En el nodo "Respond to Webhook"**:
   - Asegúrate de que use `{{ $json.headers }}` como headers

7. **Guarda el workflow**

---

### Opción 3: Configuración en el nodo "Respond to Webhook"

1. **Abre el nodo "Respond to Webhook"** al final de tu flujo

2. **Busca "Response Headers"** o "Options"

3. **Agrega manualmente los headers CORS**:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type
   ```

4. **Guarda el workflow**

---

## 🧪 Cómo probar que funciona

### Desde tu navegador móvil:

1. **Limpia el caché del navegador** en tu móvil

2. **Abre** `https://www.piscinapicaflor.cl/#/dashboard/PICA-0017`

3. **Si ves tus puntos correctamente**, ¡CORS está configurado! ✅

### Desde la consola (opcional):

```javascript
fetch('https://ppicaflor.app.n8n.cloud/webhook-test/info-socio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ codigo: 'PICA-0017' })
})
.then(r => r.json())
.then(d => console.log('✅ CORS OK:', d))
.catch(e => console.error('❌ CORS Error:', e))
```

---

## ⚠️ Notas importantes

- **Usa `*` temporalmente** para probar. Una vez que funcione, cámbialo a tu dominio específico:
  ```
  Access-Control-Allow-Origin: https://www.piscinapicaflor.cl
  ```

- **Asegúrate de guardar** el workflow después de hacer cambios

- **Puede tardar 1-2 minutos** en que los cambios se apliquen

- Si usas el **webhook de producción** (`webhook/info-socio`), también necesitas agregar CORS ahí

---

## 🔄 Webhooks que necesitan CORS

1. ✅ `webhook-test/info-socio` (Dashboard)
2. ✅ `webhook-test/registro` (Registro de usuarios)
3. ✅ `webhook/info-socio` (Producción - cuando cambies)
4. ✅ `webhook/registro` (Producción - cuando cambies)

---

## 📞 Si necesitas ayuda

Si después de esto sigue sin funcionar:

1. Toma captura del nodo Webhook configurado
2. Toma captura del nodo Respond to Webhook
3. Comparte el error exacto de la consola

---

**Tiempo estimado**: 2-5 minutos
**Dificultad**: ⭐⭐☆☆☆ (Fácil)

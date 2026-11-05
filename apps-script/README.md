# Backend del Pase (Google Apps Script)

Guarda los Pases en una planilla de Google y responde al sitio. Reemplaza a n8n (la instancia de n8n del proyecto ya no existe).
**No hay secretos en el codigo:** todo vive en *Propiedades del script*.

## Como implementarlo (lo hace Nico, con la cuenta Google del negocio)
Hazlo **dos veces**: primero el de PRUEBAS, despues el de PRODUCCION. Son dos planillas distintas.

1. Crea una planilla de Google nueva (`Piscina Picaflor - Pases PRUEBAS` / `... Pases`).
2. Menu **Extensiones > Apps Script**. Pega el contenido de `Codigo.gs`.
3. **Configuracion del proyecto > Propiedades del script**, agrega:
   | Propiedad | PRUEBAS | PRODUCCION |
   |---|---|---|
   | `ENTORNO` | `test` | `prod` |
   | `CONFIG_URL` | URL de la preview + `/pase-config.json` | `https://piscinapicaflor.cl/pase-config.json` |
   | `CORREO_DUENO` | tu correo | correo del dueno |
   | `CUPOS_OVERRIDE` / `VIGENCIA_OVERRIDE` | solo para forzar "agotado" / "vencido" | **no crear** |
4. Ejecuta la funcion `instalar` (te pide permisos: planilla, correo y conexion externa). Crea la hoja con encabezados y los dos triggers (vencidos a diario, resumen los lunes 9:00).
5. **Implementar > Nueva implementacion > Aplicacion web**. Ejecutar como: *Yo*. Quien tiene acceso: *Cualquier persona*. Copia la URL que termina en `/exec`.
6. Esa URL va en Vercel como variable `PUBLIC_PASE_ENDPOINT` (la de PRUEBAS en Preview, la de PRODUCCION en Production).

## Como funciona
- `emitir`: valida, aplica las reglas del sitio (`/pase-config.json`), y bajo un candado (`LockService`) busca el WhatsApp: si ya existe devuelve el mismo Pase; si no, revisa cupos y crea la fila con un codigo `PICA-XXXX` aleatorio (siempre con una letra, para no chocar con los `PICA-0001` de fidelidad).
- `consultar`: devuelve solo `estado`, nombre de pila, vigencia y dias validos. Nunca telefono ni correo.
- Estados de la columna `estado`: `emitido`, `canjeado`, `vencido`, `anulado`. Las filas `anulado` no cuentan para los cupos y no bloquean el numero (sirve para borrar pruebas).
- El dueno canjea un Pase cambiando `estado` a `canjeado` y anotando `fecha_reserva` / `valor_reserva`.

## Pendiente (H2)
- Pestanas **Resumen** y **Gasto** con costo por Pase y por reserva (hoy el resumen semanal llega por correo con conteos).
- API de conversiones de Meta (semana 2, solo si los Lead del navegador quedan > 30 % bajo los Pases de la hoja). El token iria en `META_CAPI_TOKEN`.

## Prueba local de la logica
`node test/probar.mjs` corre 16 casos contra una hoja simulada (idempotencia, cupos, vigencia, validaciones, privacidad de `consultar`). No reemplaza la prueba real con 20 envios simultaneos contra la implementacion de PRUEBAS (tarea T1.6).

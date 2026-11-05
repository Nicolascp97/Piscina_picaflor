# 🎱 Sistema de Referidos Piscina Picaflor

Este proyecto implementa un sistema de fidelización y referidos para Piscina Picaflor.

## ✅ Instalación

1.  **Instalar dependencias:**
    ```bash
    npm install react-router-dom qrcode.react lucide-react
    ```
    (El `package.json` ya fue actualizado, así que solo corre `npm install` si ya has copiado el archivo).

2.  **Iniciar desarrollo:**
    ```bash
    npm start
    ```

## 🚀 Despliegue en Vercel

1.  Sube los cambios a tu repositorio GitHub.
2.  Vercel detectará el commit y desplegará automáticamente.
3.  **Importante:** Asegúrate de que en Vercel, en "Build & Development Settings", el "Output Directory" sea `build`.
4.  Si usas `react-router-dom`, necesitas añadir un archivo `vercel.json` en la raíz para manejar las rutas si no existe:
    
    **vercel.json:**
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```

## ⚙️ Configuración N8N

1.  Importa los workflows ubicados en la carpeta `workflows/` a tu instancia de N8N.
2.  Configura las credenciales de Google Sheets en los nodos correspondientes.
3.  **Actualiza el ID del Google Sheet** en todos los nodos de Google Sheets (busca "1sO-XXXXXXXXXX-YOUR_SHEET_ID" y reemplázalo por el real).
4.  Activa los workflows.
5.  Actualiza las URLs de los webhooks en `src/App.js` y `src/components/PortalUsuario.jsx` por las URLs de producción de tu N8N.

## 📱 Funcionalidades

- **Registro**: Genera código `PICA-XXXX`.
- **Portal Usuario**: `/u/:codigo` muestra puntos y QR.
- **Referidos**: `/r/:codigo` muestra banner y registra referido.
- **Puntos**:
    - Registro: 20 pts
    - Referir: 50 pts
    - Ser referido: 50 pts extra (total 70 pts al inicio)

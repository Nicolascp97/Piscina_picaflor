export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { codigo } = req.query;

  if (!codigo) {
    return res.status(400).json({ error: 'Código de usuario requerido' });
  }

  try {
    const response = await fetch(
      `https://ppicaflor.app.n8n.cloud/webhook-test/194cdbd0-df8b-43e0-843a-50fdfc3f887d/usuario/${codigo}`
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en proxy de usuario:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

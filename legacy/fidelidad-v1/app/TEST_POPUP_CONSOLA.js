// TEST MANUAL - Copiar en consola del navegador después de un registro

// 1. Verificar datos guardados en localStorage
console.log('Usuario guardado:', JSON.parse(localStorage.getItem('picaflor_user')));
console.log('Código guardado:', localStorage.getItem('picaflor_codigo'));

// 2. Simular respuesta del webhook (para testing sin backend)
const respuestaSimulada = {
  success: true,
  data: {
    resultado: "¡Bienvenido Juan! Tu código es PICA-0001 y comienzas con 70 puntos."
  }
};

// 3. Función de extracción (copiar del componente)
function extraerDatosDeRespuesta(respuesta) {
  if (!respuesta) return null;

  const textoResultado = respuesta.resultado || respuesta;
  
  // Extraer código
  const regexCodigo = /PICA-\d+/i;
  const matchCodigo = textoResultado.match(regexCodigo);
  const codigo = matchCodigo ? matchCodigo[0].toUpperCase() : null;

  // Extraer puntos
  const regexPuntos = /(\d+)\s*(?:puntos|pts)/i;
  const matchPuntos = textoResultado.match(regexPuntos);
  const puntos = matchPuntos ? parseInt(matchPuntos[1]) : 20;

  // Extraer nombre
  const regexNombre = /(?:bienvenid[oa]|hola),?\s+([A-Za-zÁÉÍÓÚáéíóúñÑ\s]+?)(?:[.,!]|\s+tu|$)/i;
  const matchNombre = textoResultado.match(regexNombre);
  const nombre = matchNombre ? matchNombre[1].trim() : 'Usuario';

  return { codigo, puntos, nombre, textoResultado };
}

// 4. Probar extracción
console.log('Datos extraídos:', extraerDatosDeRespuesta(respuestaSimulada.data));

// 5. Probar con diferentes formatos
const ejemplos = [
  "¡Bienvenida María! Tu código de socio es PICA-0042 y has comenzado con 70 puntos.",
  "Hola Juan. Código: PICA-0123, Puntos: 20",
  "Registro exitoso PICA-0999 con 70 pts",
  "Tu código PICA-0001 está listo. 20 puntos iniciales."
];

ejemplos.forEach((texto, i) => {
  console.log(`Ejemplo ${i + 1}:`, extraerDatosDeRespuesta({ resultado: texto }));
});

// 6. Verificar links generados
const codigo = 'PICA-0042';
console.log('Link personal:', `https://piscina-picaflor.vercel.app/u/${codigo}`);
console.log('Link referidos:', `https://piscina-picaflor.vercel.app/r/${codigo}`);

// 7. Generar mensaje WhatsApp
const mensaje = `¡Hola! Inscríbete en el Club Picaflor usando mi código de referido: ${codigo} y suma puntos para tu próxima visita. Regístrate aquí: https://piscina-picaflor.vercel.app/r/${codigo}`;
console.log('Mensaje WhatsApp:', mensaje);
console.log('URL WhatsApp:', `https://wa.me/?text=${encodeURIComponent(mensaje)}`);

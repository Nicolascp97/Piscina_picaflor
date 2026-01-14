import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PopupExito = ({ datos, onClose }) => {
    const [copiado, setCopiado] = useState('');
    const [datosExtraidos, setDatosExtraidos] = useState(null);
    const navigate = useNavigate();

    // Función para extraer código PICA-XXXX y puntos del string resultado
    const extraerDatosDeRespuesta = (respuesta) => {
        if (!respuesta) return null;

        // Si la respuesta ya viene con la estructura correcta (resultado string)
        const textoResultado = respuesta.resultado || respuesta;
        
        // Extraer código (formato PICA-XXXX o PICA-XXX)
        const regexCodigo = /PICA-\d+/i;
        const matchCodigo = textoResultado.match(regexCodigo);
        const codigo = matchCodigo ? matchCodigo[0].toUpperCase() : null;

        // Extraer puntos (buscar número seguido de "puntos" o "pts")
        const regexPuntos = /(\d+)\s*(?:puntos|pts)/i;
        const matchPuntos = textoResultado.match(regexPuntos);
        const puntos = matchPuntos ? parseInt(matchPuntos[1]) : 20; // Default 20

        // Extraer nombre si está en el texto
        const regexNombre = /(?:bienvenid[oa]|hola),?\s+([A-Za-zÁÉÍÓÚáéíóúñÑ\s]+?)(?:[.,!]|\s+tu|$)/i;
        const matchNombre = textoResultado.match(regexNombre);
        let nombre = matchNombre ? matchNombre[1].trim() : null;
        
        // Si no se extrajo nombre del texto, buscar en propiedades del objeto
        if (!nombre && respuesta.nombre) {
            nombre = respuesta.nombre;
        }
        
        // Si aún no hay nombre, buscar en formData guardado
        if (!nombre) {
            const formDataGuardado = localStorage.getItem('picaflor_temp_nombre');
            nombre = formDataGuardado || 'Usuario';
        }

        return {
            codigo,
            puntos,
            nombre,
            textoCompleto: textoResultado
        };
    };

    useEffect(() => {
        if (!datos) return;

        console.log('Datos recibidos en PopupExito:', datos);
        const datosProcessados = extraerDatosDeRespuesta(datos);
        console.log('Datos extraídos:', datosProcessados);
        
        if (datosProcessados && datosProcessados.codigo) {
            // Guardar en localStorage para persistencia
            const datosUsuario = {
                nombre: datosProcessados.nombre,
                codigo: datosProcessados.codigo,
                puntos: datosProcessados.puntos,
                fechaRegistro: new Date().toISOString()
            };
            
            localStorage.setItem('picaflor_user', JSON.stringify(datosUsuario));
            localStorage.setItem('picaflor_codigo', datosProcessados.codigo);
            
            setDatosExtraidos(datosProcessados);
        } else {
            console.warn('No se pudo extraer el código de la respuesta');
            // Fallback: intentar usar datos directos si vienen en otra estructura
            if (datos.codigo && datos.puntos) {
                setDatosExtraidos(datos);
            }
        }
    }, [datos]);

    if (!datos) return null;
    
    // Mostrar loading mientras se procesan los datos
    if (!datosExtraidos) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Procesando tu registro...</p>
                </div>
            </div>
        );
    }

    const { codigo, puntos, nombre } = datosExtraidos;
    const link_referidos = `https://piscina-picaflor.vercel.app/r/${codigo}`;

    const handleCopiar = (texto, tipo) => {
        navigator.clipboard.writeText(texto);
        setCopiado(tipo);
        setTimeout(() => setCopiado(''), 2000);
    };

    const compartirWhatsApp = () => {
        const mensaje = `¡Hola! Inscríbete en el Club Picaflor usando mi código de referido: ${codigo} y suma puntos para tu próxima visita. Regístrate aquí: ${link_referidos}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
    };

    const irAlPortal = () => {
        navigate(`/u/${codigo}`);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-8 text-center text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 shadow-lg animate-bounce">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">¡Bienvenido/a {nombre}!</h2>
                    <p className="opacity-90">Tu registro fue exitoso</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Código y Puntos */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-cyan-50 rounded-2xl p-4 text-center border-2 border-cyan-100">
                            <p className="text-cyan-600 text-xs font-bold uppercase tracking-wider mb-1">Tu Código</p>
                            <p className="text-2xl font-black text-gray-800">{codigo}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-2xl p-4 text-center border-2 border-emerald-100">
                            <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">Tus Puntos</p>
                            <p className="text-2xl font-black text-gray-800">{puntos}</p>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200">
                        <QRCodeSVG
                            id="qr-code-registro"
                            value={codigo}
                            size={150}
                            level="H"
                            includeMargin={true}
                            className="mb-4 shadow-sm rounded-lg"
                        />
                        <p className="text-sm text-gray-500 text-center mb-4">
                            Muestra este código en la entrada<br />para sumar puntos
                        </p>
                        <button
                            onClick={irAlPortal}
                            className="text-cyan-600 font-semibold text-sm hover:underline"
                        >
                            Ir a mi portal personal →
                        </button>
                    </div>

                    {/* Links y Acciones */}
                    <div className="space-y-3">
                        <div className="relative">
                            <input
                                readOnly
                                value={link_referidos}
                                className="w-full bg-gray-100 text-gray-600 px-4 py-3 rounded-xl text-sm outline-none border border-transparent focus:border-cyan-500 transition-colors"
                            />
                            <button
                                onClick={() => handleCopiar(link_referidos, 'link')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white shadow-sm rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                                title="Copiar link"
                            >
                                {copiado === 'link' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        <button
                            onClick={compartirWhatsApp}
                            className="w-full bg-[#25D366] hover:bg-[#1fae56] text-white py-3.5 rounded-xl font-bold font-sans shadow-lg shadow-green-200 hover:shadow-green-300 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            <Share2 className="w-5 h-5" />
                            Invitar amigos (+50 pts)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopupExito;

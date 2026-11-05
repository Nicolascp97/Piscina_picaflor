import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PopupExito = ({ datos, onClose }) => {
    const [copiado, setCopiado] = useState('');
    const navigate = useNavigate();

    if (!datos) return null;

    // Extraer datos directamente de la respuesta del servidor
    const codigo = datos.codigo || null;
    const puntos = parseInt(datos.puntos) || 20;
    const nombre = datos.nombre || localStorage.getItem('picaflor_temp_nombre') || 'Usuario';

    // Guardar en localStorage para persistencia COMPLETA
    if (codigo) {
        const datosUsuario = {
            codigo,
            nombre,
            email: datos.email || '',
            puntos,
            nivel: 'Bronce',
            proximaRecompensa: 500,
            historial: [],
            premios: [],
            referidos: [],
            fechaRegistro: new Date().toISOString()
        };
        localStorage.setItem('picaflor_user', JSON.stringify(datosUsuario));
        localStorage.setItem('picaflor_codigo', codigo);
        localStorage.setItem('picaflor_current_user', codigo);
        console.log('✅ Datos COMPLETOS guardados en localStorage:', datosUsuario);
    }

    const link_referidos = `https://piscina-picaflor.vercel.app/r/${codigo}`;

    const handleCopiarCodigo = () => {
        navigator.clipboard.writeText(codigo);
        setCopiado('codigo');
        setTimeout(() => setCopiado(''), 2000);
    };

    const compartirWhatsApp = () => {
        const mensaje = `¡Hola! Inscríbete en el Club Picaflor usando mi código de referido: ${codigo} y suma puntos para tu próxima visita. Regístrate aquí: ${link_referidos}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] relative z-10 overflow-hidden animate-scale-in flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-5 text-center text-white relative flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500 shadow-lg animate-bounce">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">¡Ya eres VIP!</h2>
                    <p className="opacity-90 text-sm">Hemos enviado tu Tarjeta Digital a tu correo.<br />Mientras tanto, usa este código temporal:</p>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 overflow-y-auto flex-1">
                    {/* Código y Puntos */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-cyan-50 rounded-xl p-3 text-center border-2 border-cyan-100 relative">
                            <p className="text-cyan-600 text-xs font-bold uppercase tracking-wider mb-1">Tu Código</p>
                            <p id="tu-codigo" className="text-xl font-black text-gray-800">{codigo}</p>
                            <button
                                onClick={handleCopiarCodigo}
                                className="absolute top-2 right-2 p-1.5 bg-white hover:bg-cyan-50 rounded-lg transition-colors"
                                title="Copiar código"
                            >
                                {copiado === 'codigo' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-cyan-600" />}
                            </button>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-3 text-center border-2 border-emerald-100">
                            <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">Tus Puntos</p>
                            <p id="tus-puntos" className="text-xl font-black text-gray-800">{puntos}</p>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
                        <QRCodeSVG
                            id="qr-code-registro"
                            value={codigo}
                            size={140}
                            level="H"
                            includeMargin={true}
                            className="mb-3 shadow-sm rounded-lg"
                        />
                        <p className="text-sm text-gray-500 text-center">
                            Muestra este código en la entrada<br />para sumar puntos
                        </p>
                    </div>
                </div>

                {/* Footer con Botones de Acción */}
                <div className="p-5 pt-0 space-y-3 flex-shrink-0">
                    {/* Botón 1: Invitar a WhatsApp */}
                    <button
                        onClick={compartirWhatsApp}
                        className="w-full bg-[#25D366] hover:bg-[#1fae56] text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-green-200 hover:shadow-green-300 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        <Share2 className="w-5 h-5" />
                        Invitar a un amigo en WhatsApp (+50 pts)
                    </button>

                    {/* Botón 2: Ir al Dashboard */}
                    <button
                        onClick={() => {
                            // Guardar código en localStorage antes de navegar
                            localStorage.setItem('picaflor_current_user', codigo);
                            navigate(`/dashboard/${codigo}`);
                        }}
                        className="w-full bg-white border-2 border-cyan-500 hover:bg-cyan-50 text-cyan-600 py-4 rounded-xl font-bold text-base transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        Ir a mi Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PopupExito;

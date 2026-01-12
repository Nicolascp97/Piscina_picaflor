import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PopupExito = ({ datos, onClose }) => {
    const [copiado, setCopiado] = useState('');
    const navigate = useNavigate();

    if (!datos) return null;

    const { codigo, puntos, link_personal, link_referidos, nombre } = datos;

    const handleCopiar = (texto, tipo) => {
        navigator.clipboard.writeText(texto);
        setCopiado(tipo);
        setTimeout(() => setCopiado(''), 2000);
    };

    const compartirWhatsApp = () => {
        const texto = `¡Hola! Acabo de registrarme en Piscina Picaflor. Regístrate tú también con mi link y gana 50 puntos extra: ${link_referidos}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
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
                            value={link_personal}
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

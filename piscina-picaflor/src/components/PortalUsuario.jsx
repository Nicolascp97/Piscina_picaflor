import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, Award, History, Users, ChevronLeft, Calendar, LogOut } from 'lucide-react';

const PortalUsuario = () => {
    const { codigo } = useParams();
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiado, setCopiado] = useState(false);

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const response = await fetch(`/api/usuario?codigo=${codigo}`);
                if (!response.ok) throw new Error('No se pudo obtener la información');

                const data = await response.json();
                if (data.success) {
                    setUsuario(data.data);
                    // Actualizar localStorage como cache simple
                    localStorage.setItem('picaflor_user', JSON.stringify(data.data));
                } else {
                    setError('Usuario no encontrado');
                }
            } catch (err) {
                // Intentar recuperar de cache si falla la red
                const cached = localStorage.getItem('picaflor_user');
                if (cached) {
                    const cachedUser = JSON.parse(cached);
                    if (cachedUser.codigo === codigo) {
                        setUsuario(cachedUser);
                        return;
                    }
                }
                setError('Error de conexión. Intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        if (codigo) {
            fetchUsuario();
        }
    }, [codigo]);

    const copiarLink = () => {
        const link = `https://piscina-picaflor.vercel.app/r/${codigo}`;
        navigator.clipboard.writeText(link);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    const compartirWhatsApp = () => {
        const link = `https://piscina-picaflor.vercel.app/r/${codigo}`;
        const texto = `¡Hola! Te invito a Piscina Picaflor. Regístrate con mi link y gana puntos extra: ${link}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (error || !usuario) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <p className="text-red-500 mb-4">{error || 'Usuario no encontrado'}</p>
                <Link to="/" className="text-cyan-600 hover:underline">Volver al inicio</Link>
            </div>
        );
    }

    const proximaRecompensa = 200 - (usuario.puntos % 200);
    const porcentajeProgreso = (usuario.puntos % 200) / 200 * 100;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-emerald-600 p-6 pb-24 text-white rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Award className="w-64 h-64" />
                </div>

                <div className="max-w-md mx-auto relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <Link to="/" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-lg font-medium opacity-90">Mi Perfil</h1>
                        <div className="w-10"></div> {/* Spacer */}
                    </div>

                    <div className="text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-cyan-600 text-3xl font-bold shadow-lg">
                            {usuario.nombre.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-bold mb-1">{usuario.nombre}</h2>
                        <p className="opacity-80 font-mono tracking-wider">{usuario.codigo}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 -mt-20 relative z-20 space-y-6">
                {/* Card Puntos */}
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                    <div className="text-center mb-6">
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Tus Puntos Acumulados</p>
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">
                            {usuario.puntos}
                        </div>
                    </div>

                    <div className="bg-gray-100 rounded-2xl p-4 mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Próxima recompensa</span>
                            <span className="font-bold text-emerald-600">Faltan {proximaRecompensa} pts</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-1000"
                                style={{ width: `${porcentajeProgreso}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Card Referidos */}
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Users className="w-6 h-6 text-purple-500" />
                        Gana 50 puntos
                    </h3>

                    <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-100 mb-6 text-center">
                        <p className="text-purple-900 mb-4 font-medium">
                            Comparte tu link único y gana puntos por cada amigo que se registre
                        </p>

                        <div className="bg-white p-4 rounded-xl shadow-sm mb-4 inline-block">
                            <QRCodeSVG
                                value={`https://piscina-picaflor.vercel.app/r/${usuario.codigo}`}
                                size={120}
                                level="H"
                                includeMargin={true}
                            />
                        </div>

                        <div className="flex bg-white rounded-lg border border-purple-200 overflow-hidden mb-4">
                            <input
                                type="text"
                                readOnly
                                value={`piscina-picaflor.vercel.app/r/${usuario.codigo}`}
                                className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-50 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={copiarLink}
                                className="flex items-center justify-center gap-2 bg-white border-2 border-purple-100 hover:bg-purple-50 text-purple-700 py-3 rounded-xl font-semibold transition-colors"
                            >
                                <Copy className="w-5 h-5" />
                                {copiado ? '¡Copiado!' : 'Copiar'}
                            </button>
                            <button
                                onClick={compartirWhatsApp}
                                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                                WhatsApp
                            </button>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-700 mb-4">Tus Referidos ({usuario.referidos?.length || 0})</h4>
                        {usuario.referidos && usuario.referidos.length > 0 ? (
                            <div className="space-y-3">
                                {usuario.referidos.map((ref, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                {ref.nombre.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-700">{ref.nombre}</span>
                                        </div>
                                        <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">
                                            {new Date(ref.fecha).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-400 py-4 italic text-sm">
                                Aún no tienes referidos. ¡Empieza a compartir!
                            </p>
                        )}
                    </div>
                </div>

                {/* Historial */}
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <History className="w-6 h-6 text-cyan-500" />
                        Historial
                    </h3>

                    <div className="space-y-4">
                        {usuario.historial?.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-start border-l-2 border-gray-100 pl-4 relative">
                                <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${item.puntos > 0 ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-gray-700">{item.tipo}</h4>
                                        <span className={`font-bold ${item.puntos > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {item.puntos > 0 ? '+' : ''}{item.puntos}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">{item.descripcion}</p>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(item.fecha).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortalUsuario;

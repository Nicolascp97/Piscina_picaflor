import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
    LogOut, 
    Scan, 
    UserPlus, 
    Trophy, 
    TrendingUp,
    Gift,
    Calendar,
    ChevronRight,
    Sparkles
} from 'lucide-react';

const UserDashboard = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simular carga de datos del usuario
        const fetchUsuario = async () => {
            try {
                // En producción, esto sería una llamada a la API
                // const response = await fetch(`/api/usuario?codigo=${code}`);
                
                // Mock data para demostración
                const mockUser = {
                    codigo: code || 'PICA-1234',
                    nombre: 'María González',
                    email: 'maria@ejemplo.com',
                    puntos: 420,
                    nivel: 'VIP',
                    proximaRecompensa: 500,
                    historial: [
                        {
                            fecha: '2026-01-13',
                            actividad: 'Visita a piscina',
                            puntos: 50,
                            tipo: 'entrada'
                        },
                        {
                            fecha: '2026-01-10',
                            actividad: 'Amigo referido: Juan P.',
                            puntos: 100,
                            tipo: 'referido'
                        },
                        {
                            fecha: '2026-01-08',
                            actividad: 'Visita a piscina',
                            puntos: 50,
                            tipo: 'entrada'
                        },
                        {
                            fecha: '2026-01-05',
                            actividad: 'Bonus de bienvenida',
                            puntos: 150,
                            tipo: 'bonus'
                        },
                        {
                            fecha: '2026-01-03',
                            actividad: 'Registro completado',
                            puntos: 50,
                            tipo: 'registro'
                        }
                    ]
                };

                // Recuperar de localStorage si existe
                const cached = localStorage.getItem('picaflor_user');
                if (cached) {
                    const cachedUser = JSON.parse(cached);
                    if (cachedUser.codigo === code) {
                        setUsuario(cachedUser);
                    } else {
                        setUsuario(mockUser);
                    }
                } else {
                    setUsuario(mockUser);
                }
            } catch (error) {
                console.error('Error cargando usuario:', error);
            } finally {
                setLoading(false);
            }
        };

        if (code) {
            fetchUsuario();
        } else {
            setLoading(false);
        }
    }, [code]);

    const handleLogout = () => {
        localStorage.removeItem('picaflor_user');
        navigate('/');
    };

    const handleScanSimulation = () => {
        alert('🎉 ¡Escaneo simulado! En producción, esto activaría la cámara o validaría la entrada.');
    };

    const handleInviteFriends = () => {
        const link = `https://piscina-picaflor.vercel.app/r/${usuario.codigo}`;
        const texto = `¡Hola! 🏊‍♀️ Te invito a Piscina Picaflor. Regístrate con mi código y gana puntos extra: ${link}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-teal-600 font-medium">Cargando tu dashboard...</p>
                </div>
            </div>
        );
    }

    if (!usuario) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Usuario no encontrado</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="text-teal-600 hover:underline font-medium"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    const puntosParaRecompensa = usuario.proximaRecompensa - usuario.puntos;
    const progresoRecompensa = (usuario.puntos / usuario.proximaRecompensa) * 100;

    const getIconoActividad = (tipo) => {
        switch(tipo) {
            case 'entrada': return <Scan className="w-4 h-4" />;
            case 'referido': return <UserPlus className="w-4 h-4" />;
            case 'bonus': return <Gift className="w-4 h-4" />;
            case 'registro': return <Sparkles className="w-4 h-4" />;
            default: return <TrendingUp className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00d1b2] to-[#00b89c] px-6 py-6 shadow-lg">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-teal-50 text-sm font-medium">¡Hola!</p>
                        <h1 className="text-white text-2xl font-bold">{usuario.nombre}</h1>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 backdrop-blur-sm"
                        aria-label="Cerrar sesión"
                    >
                        <LogOut className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6 space-y-6">
                {/* Tarjeta Principal - Hero */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* QR Code Section */}
                    <div className="bg-gradient-to-br from-[#00d1b2] to-[#00b89c] p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                        
                        <div className="relative z-10">
                            <div className="bg-white p-6 rounded-2xl inline-block shadow-2xl mb-4">
                                <QRCodeSVG
                                    value={`https://piscina-picaflor.vercel.app/dashboard/${usuario.codigo}`}
                                    size={180}
                                    level="H"
                                    includeMargin={false}
                                    fgColor="#00b89c"
                                />
                            </div>
                            
                            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl inline-block">
                                <p className="text-teal-50 text-xs font-medium mb-1">Tu código</p>
                                <p className="text-white text-3xl font-black tracking-wider font-mono">
                                    {usuario.codigo}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Puntos Section */}
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">
                                Puntos Acumulados
                            </p>
                            <div className="flex items-center justify-center gap-2">
                                <Trophy className="w-8 h-8 text-amber-500" />
                                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00d1b2] to-[#00b89c]">
                                    {usuario.puntos}
                                </span>
                            </div>
                            <p className="text-gray-400 text-xs mt-2">Nivel {usuario.nivel}</p>
                        </div>

                        {/* Barra de Progreso */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Gift className="w-5 h-5 text-amber-600" />
                                    <span className="text-sm font-bold text-gray-700">Próxima Recompensa</span>
                                </div>
                                <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                                    Faltan {puntosParaRecompensa} pts
                                </span>
                            </div>
                            
                            <div className="relative h-4 bg-amber-100 rounded-full overflow-hidden">
                                <div 
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progresoRecompensa}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                </div>
                            </div>
                            
                            <p className="text-center text-xs text-amber-700 font-medium mt-2">
                                🎁 Entrada Gratis en {usuario.proximaRecompensa} puntos
                            </p>
                        </div>
                    </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="grid grid-cols-1 gap-4">
                    <button 
                        onClick={handleScanSimulation}
                        className="bg-gradient-to-r from-[#00d1b2] to-[#00b89c] text-white py-5 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-between group"
                    >
                        <span className="flex items-center gap-3">
                            <Scan className="w-7 h-7" />
                            Escanear en Entrada
                        </span>
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button 
                        onClick={handleInviteFriends}
                        className="bg-white border-2 border-[#00d1b2] text-[#00b89c] py-5 px-6 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg hover:bg-teal-50 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-between group"
                    >
                        <span className="flex items-center gap-3">
                            <UserPlus className="w-7 h-7" />
                            Invitar Amigos
                        </span>
                        <span className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-semibold">
                            +100 pts
                        </span>
                    </button>
                </div>

                {/* Historial */}
                <div className="bg-white rounded-3xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-[#00b89c]" />
                            Actividad Reciente
                        </h2>
                    </div>

                    <div className="space-y-1">
                        {usuario.historial.map((item, idx) => (
                            <div 
                                key={idx} 
                                className="flex items-center gap-4 p-4 hover:bg-teal-50 rounded-xl transition-colors group"
                            >
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#00d1b2] to-[#00b89c] rounded-xl flex items-center justify-center text-white shadow-md">
                                    {getIconoActividad(item.tipo)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 text-sm truncate">
                                        {item.actividad}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(item.fecha).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </div>
                                </div>

                                <div className="flex-shrink-0 text-right">
                                    <span className="font-black text-lg text-[#00b89c]">
                                        +{item.puntos}
                                    </span>
                                    <p className="text-xs text-gray-400">pts</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center py-4">
                    <p className="text-gray-400 text-xs">
                        Piscina Picaflor © 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;

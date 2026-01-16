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
    
    // Inicialización segura con valores por defecto
    const [usuario, setUsuario] = useState({
        codigo: code || 'PICA-0000',
        nombre: 'Usuario',
        email: '',
        puntos: 0,
        nivel: 'Bronce',
        proximaRecompensa: 500,
        historial: [],
        premios: [],
        referidos: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDatosUsuario = async () => {
            if (!code) {
                console.error('No hay código de usuario');
                setLoading(false);
                navigate('/');
                return;
            }

            console.log('=== INICIANDO CARGA DE DATOS ===');
            console.log('Código del usuario:', code);
            console.log('Dispositivo:', /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'Móvil' : 'PC');
            
            try {
                // PRIMERO intentar obtener datos reales de la API
                console.log('📡 Consultando datos REALES del usuario desde API...');
                const success = await fetchDatosDelAPI(code);
                
                if (success) {
                    console.log('✅ Datos cargados exitosamente desde API');
                    return;
                }
                
                // Si la API falla, usar caché como fallback
                console.log('🔍 API no disponible, intentando usar caché...');
                const cached = localStorage.getItem('picaflor_user');
                const cachedUser = cached ? JSON.parse(cached) : null;
                
                if (cachedUser && cachedUser.codigo === code) {
                    console.log('⚠️ Usando datos del caché (Sin conexión a servidor)');
                    setUsuario({
                        ...cachedUser,
                        historial: Array.isArray(cachedUser.historial) ? cachedUser.historial : [],
                        premios: Array.isArray(cachedUser.premios) ? cachedUser.premios : []
                    });
                } else {
                    console.error('❌ No hay datos disponibles (API + Caché)');
                }
                
            } catch (error) {
                console.error('❌ Error inesperado:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchDatosDelAPI = async (userCode) => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // Timeout de 8 segundos

                console.log('📨 Enviando request a API...');
                console.log('   URL:', 'https://ppicaflor.app.n8n.cloud/webhook-test/info-socio');
                console.log('   Body:', JSON.stringify({ codigo: userCode }));
                
                const fetchOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ codigo: userCode }),
                    mode: 'cors',
                    cache: 'no-cache',
                    signal: controller.signal
                };

                const response = await fetch('https://ppicaflor.app.n8n.cloud/webhook-test/info-socio', fetchOptions);
                clearTimeout(timeoutId);

                console.log('📥 Response recibida:');
                console.log('   Status:', response.status);
                console.log('   StatusText:', response.statusText);
                console.log('   Content-Type:', response.headers.get('content-type'));
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('📦 RESPUESTA COMPLETA DE API:');
                console.log(JSON.stringify(data, null, 2));
                console.log('   data.success:', data.success);
                console.log('   data.data:', data.data);
                
                if (data.data) {
                    console.log('   ├─ nombre:', data.data.nombre);
                    console.log('   ├─ puntos:', data.data.puntos);
                    console.log('   ├─ nivel:', data.data.nivel);
                    console.log('   ├─ email:', data.data.email);
                    console.log('   └─ historial:', Array.isArray(data.data.historial) ? `${data.data.historial.length} items` : 'No es array');
                }

                if (data.success && data.data) {
                    console.log('✅ Datos válidos de API, actualizando estado...');
                    
                    const userData = {
                        codigo: userCode,
                        nombre: data.data.nombre || 'Usuario',
                        email: data.data.email || '',
                        puntos: typeof data.data.puntos === 'number' ? data.data.puntos : 0,
                        nivel: data.data.nivel || 'Bronce',
                        proximaRecompensa: data.data.proximaRecompensa || 500,
                        historial: Array.isArray(data.data.historial) ? data.data.historial : [],
                        premios: Array.isArray(data.data.premios) ? data.data.premios : [],
                        referidos: Array.isArray(data.data.referidos) ? data.data.referidos : []
                    };

                    console.log('🎯 DATOS A GUARDAR:');
                    console.log(JSON.stringify(userData, null, 2));
                    
                    // Actualizar estado
                    setUsuario(userData);
                    
                    // Guardar en localStorage para caché
                    localStorage.setItem('picaflor_user', JSON.stringify(userData));
                    localStorage.setItem('picaflor_codigo', userCode);
                    
                    console.log('✅ Estado actualizado. Puntos guardados:', userData.puntos);
                    return true;
                } else {
                    console.error('❌ Respuesta de API inválida:');
                    console.error('   success:', data.success);
                    console.error('   data disponible:', !!data.data);
                    return false;
                }
            } catch (apiError) {
                if (apiError.name === 'AbortError') {
                    console.error('⏱️ TIMEOUT: La API tardó más de 8 segundos en responder');
                } else {
                    console.error('❌ ERROR EN FETCH:');
                    console.error('   Tipo de error:', apiError.name);
                    console.error('   Mensaje:', apiError.message);
                    console.error('   Stack:', apiError.stack);
                }
                return false;
            }
        };

        cargarDatosUsuario();
    }, [code, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('picaflor_user');
        navigate('/');
    };

    const handleScanSimulation = () => {
        alert('🎉 ¡Escaneo simulado! En producción, esto activaría la cámara o validaría la entrada.');
    };

    const handleInviteFriends = () => {
        const link = `https://piscina-picaflor.vercel.app/r/${usuario?.codigo || 'PICA-0000'}`;
        const texto = `¡Hola! 🏊‍♀️ Te invito a Piscina Picaflor. Regístrate con mi código y gana puntos extra: ${link}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-teal-600 font-medium text-lg">Cargando tu perfil...</p>
                    <p className="text-gray-400 text-sm mt-2">Un momento por favor</p>
                </div>
            </div>
        );
    }

    // Validación adicional de seguridad
    if (!usuario || !usuario.codigo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-red-500 mb-4 text-lg font-semibold">No se pudo cargar el perfil</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    const puntosParaRecompensa = Math.max(0, (usuario.proximaRecompensa || 500) - (usuario.puntos || 0));
    const progresoRecompensa = Math.min(100, ((usuario.puntos || 0) / (usuario.proximaRecompensa || 500)) * 100);

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
                        <h1 className="text-white text-2xl font-bold">{usuario?.nombre || 'Usuario'}</h1>
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
                                    value={`https://piscina-picaflor.vercel.app/dashboard/${usuario?.codigo || 'PICA-0000'}`}
                                    size={180}
                                    level="H"
                                    includeMargin={false}
                                    fgColor="#00b89c"
                                />
                            </div>
                            
                            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl inline-block">
                                <p className="text-teal-50 text-xs font-medium mb-1">Tu código</p>
                                <p className="text-white text-3xl font-black tracking-wider font-mono">
                                    {usuario?.codigo || 'PICA-0000'}
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
                                    {usuario?.puntos || 0}
                                </span>
                            </div>
                            <p className="text-gray-400 text-xs mt-2">Nivel {usuario?.nivel || 'Bronce'}</p>
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
                                🎁 Entrada Gratis en {usuario?.proximaRecompensa || 500} puntos
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
                        {(usuario?.historial && Array.isArray(usuario.historial) && usuario.historial.length > 0) ? (
                            usuario.historial.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex items-center gap-4 p-4 hover:bg-teal-50 rounded-xl transition-colors group"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#00d1b2] to-[#00b89c] rounded-xl flex items-center justify-center text-white shadow-md">
                                        {getIconoActividad(item?.tipo)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 text-sm truncate">
                                            {item?.actividad || 'Actividad'}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                            <Calendar className="w-3 h-3" />
                                            {item?.fecha ? new Date(item.fecha).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short'
                                            }) : 'Fecha desconocida'}
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 text-right">
                                        <span className="font-black text-lg text-[#00b89c]">
                                            +{item?.puntos || 0}
                                        </span>
                                        <p className="text-xs text-gray-400">pts</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-400 text-sm">
                                    Aún no tienes actividad registrada
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Premios/Canjes */}
                {usuario?.premios && usuario.premios.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Gift className="w-6 h-6 text-purple-500" />
                                Mis Canjes
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {usuario.premios.map((premio, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-md">
                                        <Gift className="w-6 h-6" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 text-sm">
                                            {premio?.nombre || premio?.descripcion || 'Premio'}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                            <Calendar className="w-3 h-3" />
                                            {premio?.fecha ? new Date(premio.fecha).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            }) : 'Fecha no disponible'}
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 text-right">
                                        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                                            {premio?.estado || 'Canjeado'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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

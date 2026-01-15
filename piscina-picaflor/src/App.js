import React, { useState, useEffect, useRef } from 'react';
import { Droplet, Gift, Heart, Sparkles, CheckCircle, QrCode, ChevronLeft, ChevronRight, Play, MessageCircle, X } from 'lucide-react';
import { HashRouter, Routes, Route, useParams } from 'react-router-dom';
import PortalUsuario from './components/PortalUsuario';
import UserDashboard from './components/UserDashboard';
import BannerReferido from './components/BannerReferido';
import PopupExito from './components/PopupExito';

// Componente de Carrusel Multimedia
const MediaCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  // Array de medios: videos e imágenes
  const mediaItems = [
    { type: 'video', src: 'https://res.cloudinary.com/dea2y9hvv/video/upload/f_auto,q_auto,w_1280,so_0/20251227_195609_1_duyx3l.mp4', alt: 'video piscina 1' },
    { type: 'image', src: 'https://i.ibb.co/vp0FyrP/piscina2.avif', alt: 'foto piscina' },
    { type: 'image', src: 'https://i.ibb.co/CppgVBrd/carrusel-eventos.png', alt: 'celbra eventos' },
    { type: 'image', src: 'https://i.ibb.co/7tPc6VqG/celebra-matrimonio.png', alt: 'celebra matrimonio' },
    { type: 'image', src: 'https://i.ibb.co/jvgSMGzQ/celebra-graduacion-1.png', alt: 'celebra graduacion' },
    { type: 'image', src: 'https://i.ibb.co/HDFnxVrz/celebra-bautizo.png', alt: 'celebra bautizo' }
  ];

  const scrollToIndex = (index) => {
    if (scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth;
      const itemWidth = scrollWidth / mediaItems.length;
      scrollRef.current.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const itemWidth = scrollRef.current.scrollWidth / mediaItems.length;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(newIndex);
    }
  };

  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % mediaItems.length;
    scrollToIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex = currentIndex === 0 ? mediaItems.length - 1 : currentIndex - 1;
    scrollToIndex(newIndex);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900">
      {/* Carrusel principal */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {mediaItems.map((item, index) => (
          <div
            key={index}
            className="min-w-full snap-center relative"
          >
            {item.type === 'video' ? (
              <div className="relative w-full h-[400px] md:h-[500px] bg-black">
                <video
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                >
                  <source src={item.src} type="video/mp4" />
                  Tu navegador no soporta videos HTML5.
                </video>
                <div className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  Video
                </div>
              </div>
            ) : (
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-[400px] md:h-[500px] object-cover"
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>

      {/* Controles de navegación - Desktop */}
      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 z-10"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 z-10"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {mediaItems.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`transition-all duration-300 rounded-full ${index === currentIndex
                ? 'bg-white w-8 h-2'
                : 'bg-white/50 w-2 h-2 hover:bg-white/75'
              }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>

      {/* Contador móvil */}
      <div className="absolute top-4 right-4 bg-gray-900/80 text-white px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur">
        {currentIndex + 1} / {mediaItems.length}
      </div>
    </div>
  );
};

// Landing Page Content
const LandingContent = () => {
  const [scrollY, setScrollY] = useState(0);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    celular: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook para capturar código de referido
  const { codigoReferido } = useParams();
  const [nombreReferidor, setNombreReferidor] = useState('');

  // Efecto para scroll
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efecto para verificar referido
  useEffect(() => {
    if (codigoReferido) {
      // Guardar en localStorage para persistencia si navega
      localStorage.setItem('referido_por', codigoReferido);

      // Consultar nombre del referidor (opcional, para el banner)
      fetch(`/api/usuario?codigo=${codigoReferido}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNombreReferidor(data.data.nombre);
          }
        })
        .catch(err => console.error("Error buscando referidor", err));
    }
  }, [codigoReferido]);

  const scrollToAction = () => {
    document.getElementById('cta-section').scrollIntoView({ behavior: 'smooth' });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.celular.trim()) {
      errors.celular = 'El celular es obligatorio';
    } else if (!/^\+?569\d{8}$|^\d{9}$/.test(formData.celular.replace(/\s/g, ''))) {
      errors.celular = 'Formato de celular inválido (+569xxxxxxxx o 9xxxxxxxx)';
    }

    if (!formData.email.trim()) {
      errors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Correo inválido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const webhookURL = 'https://ppicaflor.app.n8n.cloud/webhook-test/registro';

      const fechaRegistro = new Date().toISOString();
      const referidoPor = localStorage.getItem('referido_por') || null;

      // Guardar temporalmente el nombre para el PopupExito
      localStorage.setItem('picaflor_temp_nombre', formData.nombre);

      const datos = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.celular,
        origen: 'Piscina Picaflor Landing',
        fechaRegistro: fechaRegistro,
        referido_por: referidoPor
      };

      console.log('Enviando datos:', datos);

      const response = await fetch(webhookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (!response.ok) {
        throw new Error(`Error servidor: ${response.status}`);
      }

      const result = await response.json();
      console.log('Respuesta:', result);

      if (result.success) {
        // Agregar el nombre al objeto de respuesta si no viene incluido
        const datosConNombre = {
          ...result.data,
          nombre: formData.nombre
        };
        setSuccessData(datosConNombre);
        setShowCardModal(false);
        setShowSuccessPopup(true);
        setFormData({ nombre: '', celular: '', email: '' });
        
        // Limpiar el nombre temporal después de usarlo
        localStorage.removeItem('picaflor_temp_nombre');
      } else {
        throw new Error(result.message || 'Error desconocido');
      }

    } catch (error) {
      console.error('Error completo:', error);
      console.error('Stack:', error.stack);
      alert(`Error: ${error.message || 'Failed to fetch'}. Verifica que el webhook esté activo e intenta nuevamente.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardModalClose = () => {
    setFormData({ nombre: '', celular: '', email: '' });
    setFormErrors({});
    setShowCardModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-emerald-50">

      {/* Banner de Referido */}
      {nombreReferidor && <BannerReferido nombreReferidor={nombreReferidor} />}

      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://raw.githubusercontent.com/user-attachments/assets/your-image.jpg)',
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/75 via-cyan-900/70 to-gray-900/80"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl animate-fade-in">
          <div className="mb-6 inline-block">
            <Droplet className="w-16 h-16 text-cyan-300 mx-auto drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }} />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.9)' }}>
            Un espacio creado con esfuerzo familiar para que disfrutes sin preocupaciones
          </h1>
          <p className="text-xl md:text-2xl text-cyan-100 mb-10 font-light tracking-wide" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
            Piscina Picaflor · Experiencia premium en Litueche
          </p>
          <button
            onClick={scrollToAction}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-10 py-5 rounded-full text-lg md:text-xl font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
          >
            <Sparkles className="w-6 h-6" />
            Sumarme al programa de puntos
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* STORYTELLING SECTION */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6 animate-slide-in-left">
              <div className="inline-block">
                <Heart className="w-12 h-12 text-rose-500 mb-4" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight">
                Una historia familiar
              </h2>
              <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"></div>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Piscina Picaflor nace como un sueño familiar, construido paso a paso con dedicación y cariño. Cada detalle ha sido pensado para crear un lugar donde las familias puedan compartir momentos inolvidables.
              </p>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Entendemos el valor de un espacio seguro, limpio y acogedor. Por eso trabajamos día a día para que tu experiencia sea excepcional, donde los niños jueguen tranquilos y los adultos descansen sin preocupaciones.
              </p>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium text-emerald-700">
                Este es nuestro compromiso: un lugar pensado con el corazón para que lo disfrutes con los tuyos.
              </p>
            </div>
            <div className="order-1 md:order-2 animate-slide-in-right">
              <MediaCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* SISTEMA DE PUNTOS SECTION */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-cyan-600 to-emerald-600 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6 inline-block animate-fade-in">
            <Gift className="w-16 h-16 text-white mx-auto drop-shadow-lg" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Cuatro formas simples de ganar puntos
          </h2>
          <p className="text-xl text-cyan-100 mb-16 max-w-3xl mx-auto">
            Visítanos, trae amigos y acumula recompensas de forma automática
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-12">
            <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <QrCode className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">1. Escanea el QR</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Encuentra nuestros códigos QR en Litueche o cuando nos visites. Un simple escaneo y comienzas a sumar.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Droplet className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">2. Acumula puntos</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Cada vez que vienes a disfrutar de Piscina Picaflor, automáticamente sumas puntos a tu cuenta.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">3. Trae amigos</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Por cada persona que venga de tu parte (referido), sumas puntos extra. ¡Comparte la experiencia!
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">4. Gana recompensas</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Cada 200 puntos alcanzados, ganas una recompensa especial que te entregamos en el lugar.
              </p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur border-2 border-white/40 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-white text-lg font-medium">
              💡 Las recompensas se informan directamente en el lugar
            </p>
          </div>
        </div>
      </section>

      {/* BENEFICIOS SECTION */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
            ¿Por qué unirte a nuestro programa?
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Porque valoramos tu preferencia y queremos que sigas eligiéndonos
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">100% Gratis</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                No pagas nada por formar parte. Es nuestro regalo para ti por elegirnos.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Sin vencimiento</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Tus puntos no caducan. Acumula a tu ritmo y úsalos cuando quieras.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Premia tu lealtad</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Mientras más nos visites, más beneficios obtienes. Es así de simple.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL SECTION */}
      <section id="cta-section" className="py-20 md:py-32 bg-gradient-to-br from-gray-900 via-cyan-900 to-emerald-900 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 animate-fade-in">
            <Sparkles className="w-20 h-20 text-cyan-300 mx-auto drop-shadow-lg" />
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Empieza hoy a acumular puntos en Piscina Picaflor
          </h2>
          <p className="text-xl md:text-2xl text-cyan-100 mb-12 max-w-2xl mx-auto">
            Súmate a nuestra familia y comienza a disfrutar de beneficios exclusivos
          </p>

          <button
            onClick={() => setShowCardModal(true)}
            className="bg-white hover:bg-gray-100 text-gray-900 px-12 py-6 rounded-full text-xl md:text-2xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3 mb-8">
            <Gift className="w-8 h-8" />
            Agregar mi tarjeta de beneficios
          </button>

          <p className="text-cyan-200 text-sm md:text-base">
            ✨ Compatible con Google Wallet y Apple Wallet
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <Droplet className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Piscina Picaflor
            </h3>
            <p className="text-cyan-300 text-lg">
              Litueche, Chile
            </p>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8">
            <p className="text-gray-400 text-lg mb-4">
              Gracias por apoyar un proyecto familiar local
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 Piscina Picaflor · Hecho con ❤️ en Litueche
            </p>
          </div>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE DE WHATSAPP */}
      <button
        onClick={() => setShowWhatsAppPopup(true)}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl z-50 transform hover:scale-110 transition-all duration-300 animate-pulse-green"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* POPUP DE WHATSAPP */}
      {showWhatsAppPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setShowWhatsAppPopup(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-3xl relative">
                <button
                  onClick={() => setShowWhatsAppPopup(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur rounded-full p-3">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      ¡Hablemos por WhatsApp!
                    </h3>
                    <p className="text-green-50 text-sm">
                      Respuesta rápida garantizada
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Estamos listos para ayudarte con tu reserva en <span className="font-semibold text-cyan-600">Piscina Picaflor</span>
                  </p>
                  <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">Consulta disponibilidad en tiempo real</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <a
                    href="https://wa.me/56975003757?text=Hola!%20Quiero%20hacer%20una%20reserva%20en%20Piscina%20Picaflor%20🏊‍♂️"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Abrir WhatsApp
                  </a>
                  <button
                    onClick={() => setShowWhatsAppPopup(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors duration-300"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL DE REGISTRO */}
      {showCardModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
            onClick={handleCardModalClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-scale-in max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 p-6 rounded-t-3xl relative sticky top-0">
                <button
                  onClick={handleCardModalClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-4 pr-10">
                  <div className="bg-white/20 backdrop-blur rounded-full p-3">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Tu Tarjeta de Beneficios
                    </h3>
                    <p className="text-cyan-50 text-sm">
                      Completa el formulario para unirte
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors duration-300 focus:outline-none ${formErrors.nombre ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-cyan-500 bg-gray-50'
                      }`}
                  />
                  {formErrors.nombre && <p className="text-red-500 text-sm mt-1">{formErrors.nombre}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Celular <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="celular"
                    value={formData.celular}
                    onChange={handleFormChange}
                    placeholder="+569 1234 5678"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors duration-300 focus:outline-none ${formErrors.celular ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-cyan-500 bg-gray-50'
                      }`}
                  />
                  {formErrors.celular && <p className="text-red-500 text-sm mt-1">{formErrors.celular}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors duration-300 focus:outline-none ${formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-cyan-500 bg-gray-50'
                      }`}
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                  >
                    {isSubmitting ? 'Procesando...' : (
                      <>
                        <Gift className="w-6 h-6" />
                        Obtener Tarjeta
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* POPUP EXITO */}
      {showSuccessPopup && (
        <PopupExito
          datos={successData}
          onClose={() => setShowSuccessPopup(false)}
        />
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse-green { 0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 50% { box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0) translateX(-50%); } 50% { transform: translateY(-10px) translateX(-50%); } }

        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 1s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 1s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-pulse-green { animation: pulse-green 2s infinite; }
        .animate-bounce { animation: bounce 2s infinite; }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

// Main App Component with Routes
const PiscinaPicaflorApp = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingContent />} />
        <Route path="/r/:codigoReferido" element={<LandingContent />} />
        <Route path="/u/:codigo" element={<PortalUsuario />} />
        <Route path="/dashboard/:code" element={<UserDashboard />} />
        {/* Fallback route */}
        <Route path="*" element={<LandingContent />} />
      </Routes>
    </HashRouter>
  );
};

export default PiscinaPicaflorApp;

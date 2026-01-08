import React, { useState, useEffect, useRef } from 'react';
import { Droplet, Gift, Heart, Sparkles, CheckCircle, QrCode, ChevronLeft, ChevronRight, Play, MessageCircle, X, Send, Smartphone } from 'lucide-react';

// Componente de Carrusel Multimedia
const MediaCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);
  
  const mediaItems = [
    { type: 'video', src: 'https://res.cloudinary.com/dea2y9hvv/video/upload/f_auto,q_auto,w_1280,so_0/20251227_195609_1_duyx3l.mp4', alt: 'video piscina 1' },
    { type: 'image', src: 'https://i.ibb.co/vp0FyrP/piscina2.avif', alt: 'foto piscina' },
    { type: 'image', src: 'https://i.ibb.co/CppgVBrd/carrusel-eventos.png', alt: 'celebra eventos' },
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
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {mediaItems.map((item, index) => (
          <div key={index} className="min-w-full snap-center relative">
            {item.type === 'video' ? (
              <div className="relative w-full h-[400px] md:h-[500px] bg-black">
                <video className="w-full h-full object-cover" controls playsInline preload="metadata">
                  <source src={item.src} type="video/mp4" />
                </video>
                <div className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  Video
                </div>
              </div>
            ) : (
              <img src={item.src} alt={item.alt} className="w-full h-[400px] md:h-[500px] object-cover" loading="lazy" />
            )}
          </div>
        ))}
      </div>

      <button onClick={prevSlide} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 z-10">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={nextSlide} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 z-10">
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {mediaItems.map((_, index) => (
          <button key={index} onClick={() => scrollToIndex(index)} className={`transition-all duration-300 rounded-full ${index === currentIndex ? 'bg-white w-8 h-2' : 'bg-white/50 w-2 h-2 hover:bg-white/75'}`} />
        ))}
      </div>

      <div className="absolute top-4 right-4 bg-gray-900/80 text-white px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur">
        {currentIndex + 1} / {mediaItems.length}
      </div>
    </div>
  );
};

const PiscinaPicaflorLanding = () => {
  const [scrollY, setScrollY] = useState(0);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [passUrl, setPassUrl] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToAction = () => {
    document.getElementById('cta-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="flex items-center justify-center gap-2"><div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Creando tu tarjeta...</span></div>';
    submitButton.disabled = true;

    try {
      const response = await fetch('https://piscinapicaflor.app.n8n.cloud/webhook-test/9038baec-90ea-4435-bd1b-ee6d4958b37e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.name,
          email: formData.email,
          telefono: formData.phone || 'No proporcionado',
          fecha_registro: new Date().toISOString(),
          origen: 'Landing Page',
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPassUrl(result.data.passUrl);
        setShowWalletPopup(false);
        setShowSuccessPopup(true);
        setFormData({ name: '', email: '', phone: '' });
      } else {
        throw new Error(result.message || 'Error al crear la tarjeta');
      }
    } catch (error) {
      console.error('Error al crear tarjeta:', error);
      
      const continuar = confirm(
        'Hubo un problema técnico al crear tu tarjeta automáticamente.\n\n' +
        '¿Quieres que te ayudemos por WhatsApp?\n' +
        'Te generaremos tu tarjeta manualmente en minutos.'
      );
      
      if (continuar) {
        const message = `Hola! Quiero mi tarjeta de Piscina Picaflor 🏊‍♂️%0A%0ANombre: ${formData.name}%0AEmail: ${formData.email}%0ATeléfono: ${formData.phone || 'No proporcionado'}%0A%0AHubo un error técnico en el registro automático.`;
        window.open(`https://wa.me/56975003757?text=${message}`, '_blank');
      }
      
      setShowWalletPopup(false);
      setFormData({ name: '', email: '', phone: '' });
    } finally {
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-emerald-50">
      
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: 'url(https://i.ibb.co/vp0FyrP/piscina2.avif)',
            transform: `translateY(${scrollY * 0.5}px)`,
          }}>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/75 via-cyan-900/70 to-gray-900/80"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl animate-fade-in">
          <div className="mb-6 inline-block">
            <Droplet className="w-16 h-16 text-cyan-300 mx-auto drop-shadow-lg" style={{filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'}} />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight" style={{textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.9)'}}>
            Un espacio creado con esfuerzo familiar para que disfrutes sin preocupaciones
          </h1>
          <p className="text-xl md:text-2xl text-cyan-100 mb-10 font-light tracking-wide" style={{textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>
            Piscina Picaflor · Experiencia premium en Litueche
          </p>
          <button onClick={scrollToAction} className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-10 py-5 rounded-full text-lg md:text-xl font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3">
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

            <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{animationDelay: '0.15s'}}>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Droplet className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">2. Acumula puntos</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Cada vez que vienes a disfrutar de Piscina Picaflor, automáticamente sumas puntos a tu cuenta.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">3. Trae amigos</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Por cada persona que venga de tu parte (referido), sumas puntos extra. ¡Comparte la experiencia!
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{animationDelay: '0.45s'}}>
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

            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Sin vencimiento</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Tus puntos no caducan. Acumula a tu ritmo y úsalos cuando quieras.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
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
            onClick={() => setShowWalletPopup(true)}
            className="bg-white hover:bg-gray-100 text-gray-900 px-12 py-6 rounded-full text-xl md:text-2xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3 mb-8"
          >
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

      {/* POPUP WHATSAPP */}
      {showWhatsAppPopup && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setShowWhatsAppPopup(false)} />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-3xl relative">
                <button onClick={() => setShowWhatsAppPopup(false)} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur rounded-full p-3">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">¡Hablemos por WhatsApp!</h3>
                    <p className="text-green-50 text-sm">Respuesta rápida garantizada</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-gray-600 text-lg leading-relaxed">
                  Estamos listos para ayudarte con tu reserva en <span className="font-semibold text-cyan-600">Piscina Picaflor</span>
                </p>
                
                <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Consulta disponibilidad en tiempo real</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Información sobre precios y horarios</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Reserva tu día perfecto en familia</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <a href="https://wa.me/56975003757?text=Hola!%20Quiero%20hacer%20una%20reserva%20en%20Piscina%20Picaflor%20🏊‍♂️" target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg">
                    <MessageCircle className="w-6 h-6" />
                    Abrir WhatsApp
                  </a>
                  
                  <button onClick={() => setShowWhatsAppPopup(false)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors duration-300">
                    Cerrar
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500">
                  También puedes llamarnos al: <br/>
                  <a href="tel:+56975003757" className="text-cyan-600 hover:text-cyan-700 font-semibold">+56 9 7500 3757</a>
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* POPUP WALLET/TARJETA */}
      {showWalletPopup && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setShowWalletPopup(false)} />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-scale-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 p-6 relative">
                <button onClick={() => setShowWalletPopup(false)} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur rounded-full p-3">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Tu Tarjeta Digital</h3>
                    <p className="text-cyan-50 text-sm">Compatible con Google & Apple Wallet</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  Regístrate para recibir tu tarjeta digital de beneficios y empezar a acumular puntos
                </p>

                <form onSubmit={handleWalletSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Nombre completo</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-colors" placeholder="Juan Pérez" />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Correo electrónico</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-colors" placeholder="juan@ejemplo.com" />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Teléfono (opcional)</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-colors" placeholder="+56 9 1234 5678" />
                  </div>

                  <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-2xl p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Acumula puntos automáticamente</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Acceso a recompensas exclusivas</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">100% gratis, sin costo ni vencimiento</p>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg">
                    <Gift className="w-6 h-6" />
                    Obtener mi tarjeta
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-4">
                    Al registrarte, aceptas recibir tu tarjeta digital y comunicaciones sobre el programa de beneficios
                  </p>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* POPUP ÉXITO */}
      {showSuccessPopup && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setShowSuccessPopup(false)} />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="text-center pt-8 pb-4">
                <div className="text-7xl mb-4 animate-bounce-slow">🎉</div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">¡Felicidades!</h3>
                <p className="text-lg text-gray-600 px-6">Tu tarjeta ha sido creada exitosamente</p>
              </div>

              <div className="px-6 pb-6">
                <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Gift className="w-8 h-8 text-emerald-600" />
                    <span className="text-2xl font-bold text-gray-800">20 Puntos</span>
                  </div>
                  <p className="text-center text-gray-600">de bienvenida ya están en tu tarjeta</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Acumula 100 puntos por cada visita</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Gana 50 puntos por cada referido</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Canjea recompensas cada 200 puntos</p>
                  </div>
                </div>

                <a href={passUrl} className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg mb-3">
                  <Smartphone className="w-6 h-6" />
                  Agregar a mi Wallet
                </a>

                <button onClick={() => setShowSuccessPopup(false)} className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm">
                  Lo haré después
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  Compatible con Google Wallet y Apple Wallet
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse-green { 0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 50% { box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); } }
        @keyframes fade-in-dramatic { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce-in { from { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes pulse-text { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0) translateX(-50%); } 50% { transform: translateY(-10px) translateX(-50%); } }
        
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 1s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 1s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-pulse-green { animation: pulse-green 2s infinite; }
        .animate-fade-in-dramatic { animation: fade-in-dramatic 1s ease-out; }
        .animate-slide-up { animation: slide-up 1s ease-out forwards; opacity: 0; }
        .animate-bounce-in { animation: bounce-in 0.6s ease-out; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-pulse-text { animation: pulse-text 2s ease-in-out infinite; }
        .animate-bounce { animation: bounce 2s infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default PiscinaPicaflorLanding;
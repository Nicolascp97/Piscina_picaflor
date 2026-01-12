import React from 'react';
import { Gift, Sparkles } from 'lucide-react';

const BannerReferido = ({ nombreReferidor }) => {
    if (!nombreReferidor) return null;

    return (
        <div className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 text-white p-4 shadow-lg animate-fade-in-down sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm animate-pulse">
                        <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-lg md:text-xl flex items-center gap-2 justify-center md:justify-start">
                            ¡{nombreReferidor} te invitó a Piscina Picaflor!
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                        </p>
                        <p className="text-white/90 text-sm">
                            Regístrate ahora y ambos ganarán <span className="font-bold underline">50 puntos extra</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => document.getElementById('cta-section').scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-purple-600 px-6 py-2 rounded-full font-bold shadow-md hover:scale-105 active:scale-95 transition-all text-sm md:text-base whitespace-nowrap"
                >
                    Reclamar mis puntos
                </button>
            </div>

            <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out;
        }
      `}</style>
        </div>
    );
};

export default BannerReferido;

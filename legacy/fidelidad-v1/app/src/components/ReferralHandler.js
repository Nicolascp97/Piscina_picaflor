import React, { useState } from 'react';
import { Gift, Copy, Check, Share2 } from 'lucide-react';

const ReferralHandler = () => {
  const [copied, setCopied] = useState(false);
  
  const referralLink = `https://piscinapicaflor.com/ref/${localStorage.getItem('userId') || 'demo'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-emerald-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Gift className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Programa de Referidos
          </h1>
          <p className="text-xl text-gray-600">
            Invita amigos y gana puntos adicionales
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Tu enlace de referencia</h2>
          
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg font-mono text-sm"
            />
            <button
              onClick={handleCopy}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Cómo funciona:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Comparte tu enlace con amigos</li>
              <li>✓ Cada amigo que se registre con tu link suma puntos a tu cuenta</li>
              <li>✓ Sin límite de referidos</li>
              <li>✓ Los puntos se acumulan automáticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralHandler;
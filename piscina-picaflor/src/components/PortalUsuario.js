import React, { useState } from 'react';
import { User, LogOut, Award, TrendingUp } from 'lucide-react';

const PortalUsuario = () => {
  const [usuario, setUsuario] = useState({
    nombre: 'Usuario Demo',
    email: 'usuario@ejemplo.com',
    puntos: 450,
    nivel: 'Oro'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-emerald-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{usuario.nombre}</h1>
                <p className="text-gray-600">{usuario.email}</p>
              </div>
            </div>
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors">
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-8 h-8 text-cyan-600" />
                <h3 className="text-xl font-bold text-gray-800">Puntos totales</h3>
              </div>
              <p className="text-4xl font-bold text-cyan-600">{usuario.puntos}</p>
              <p className="text-gray-600 mt-2">Próxima recompensa: 200 puntos</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
                <h3 className="text-xl font-bold text-gray-800">Nivel</h3>
              </div>
              <p className="text-4xl font-bold text-emerald-600">{usuario.nivel}</p>
              <p className="text-gray-600 mt-2">Miembro premium</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalUsuario;
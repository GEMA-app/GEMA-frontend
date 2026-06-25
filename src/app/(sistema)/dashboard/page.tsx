'use client';

import React from 'react';
import { Search, Bell, User, TrendingUp, Clock, Monitor, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto">
      
      <header className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Hola, administrador!</h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-6">Resumen operativo</h2>
          <p className="text-gray-500 text-sm">Vista general del estado actual de los activos</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400"/>
            </div>
            <input 
              type="text" 
              placeholder="Buscar activo..." 
              className="pl-10 pr-4 py-2 bg-[#F8F6F4] border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-[#ECA03C] outline-none"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <Bell className="w-6 h-6 text-gray-600" strokeWidth={1.5}/>
          </button>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <User className="w-6 h-6 text-gray-600" strokeWidth={1.5}/>
          </button>
        </div>
      </header>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-[#EAE1D0] rounded-3xl p-6 shadow-sm flex flex-col justify-between h-56">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Total activos</h3>
            <div className="text-5xl font-bold text-gray-900">12345</div>
          </div>
          <div className="bg-[#ECA03C] w-max px-3 py-1 rounded-lg flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-900"/>
            <span className="text-sm font-bold text-gray-900">+12%</span>
          </div>
        </div>

        
        <div className="bg-[#EAE1D0] rounded-3xl p-6 shadow-sm flex flex-col justify-between h-56">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">En mantenimiento</h3>
            <div className="text-5xl font-bold text-gray-900">8</div>
          </div>
          <div>
            <div className="w-full bg-white rounded-full h-3 mb-2 border border-gray-300">
              <div className="bg-gradient-to-r from-[#8B4513] to-white h-3 rounded-full" style={{ width: '15%' }}></div>
            </div>
            <p className="text-sm text-gray-800">Capacidad técnica al 15%</p>
          </div>
        </div>

        
        <div className="bg-[#EAE1D0] rounded-3xl p-6 shadow-sm flex flex-col justify-between h-56">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Presupuesto ejecutado</h3>
            <div className="text-5xl font-bold text-gray-900 mb-2">100$</div>
            <p className="font-bold text-gray-900 text-sm">Disponible 50$</p>
          </div>
          <button className="bg-[#8B4513] text-white font-semibold py-2 px-4 rounded-xl text-sm hover:bg-[#6b340e] transition-colors">
            Ver reporte financiero
          </button>
        </div>
      </div>

      
      <div className="flex flex-col space-y-6 pb-8">
        
        <div className="bg-white border border-[#EAE1D0] rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="text-blue-600">
              <Clock className="w-7 h-7" strokeWidth="{2}"/>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Próximos mantenimientos preventivos</h3>
          </div>
          
          <div className="bg-[#EAE1D0]/40 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <Monitor className="w-6 h-6 text-blue-500" strokeWidth="{1.5}"/>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">Servidor Lab C-1</p>
                <p className="text-xs text-gray-600 font-medium">Programado: 12 may 2024</p>
              </div>
            </div>
            <button className="text-blue-600 font-bold hover:text-blue-800 text-sm px-4">
              Asignar
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#EAE1D0] rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-8">
            <div className="text-[#FF6B00]">
              <AlertCircle className="w-7 h-7" strokeWidth="{2}"/>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Estado de activos</h3>
          </div>

          <div className="space-y-6 mb-8 pl-4 pr-12">
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-900 font-medium text-lg">Operativo</span>
                <span className="text-gray-900 font-bold text-lg">85%</span>
              </div>
              <div className="w-full bg-[#E8F5E9] rounded-full h-4">
                <div className="bg-[#00897B] h-4 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-900 font-medium text-lg">En mantenimiento</span>
                <span className="text-gray-900 font-bold text-lg">10%</span>
              </div>
              <div className="w-full bg-[#FFE0B2] rounded-full h-4">
                <div className="bg-[#FF6B00] h-4 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-900 font-medium text-lg">Fuera de servicio</span>
                <span className="text-gray-900 font-bold text-lg">5%</span>
              </div>
              <div className="w-full bg-[#FFCDD2] rounded-full h-4">
                <div className="bg-[#E53935] h-4 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFEBE5] rounded-2xl p-5 flex items-start space-x-3 mx-4">
             <AlertCircle className="w-6 h-6 text-[#FF6B00] flex-shrink-0 mt-0.5" strokeWidth="{2}"/>
             <p className="text-sm text-[#D84315] leading-relaxed">
               <span className="font-bold">Atención:</span> El porcentaje de equipos en mantenimiento ha subido un 2% esta semana. Revise las órdenes de trabajo pendientes en el laboratorio de química
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}

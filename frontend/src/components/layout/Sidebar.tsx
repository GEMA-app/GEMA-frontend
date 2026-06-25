'use client';

import React, { useState } from 'react';
import { LayoutDashboard, Box, Wrench, ClipboardList, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
    { icon: Box, label: 'Activos', href: '/activos' },
    { icon: Wrench, label: 'Mantenimiento', href: '/mantenimiento' },
    { icon: ClipboardList, label: 'Reportes', href: '/reportes' },
    { icon: Settings, label: 'Configuración', href: '/configuracion' },
  ];

  return (
    <aside
      className={`bg-[#2B405B] text-white flex flex-col transition-all duration-300 rounded-r-3xl h-screen ${isCollapsed ? 'w-24' : 'w-72'}`}
    >
      {/* Logo Area */}
      <div className="p-6 flex items-center justify-start cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <img
          src="/GEMA%20Logo%20Perlado.png"
          alt="GEMA Logo Perlado"
          className={`w-auto object-contain transition-all duration-300 ${isCollapsed ? 'h-10' : 'h-16'}`}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link key={index} href={item.href}>
              <div className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-colors ${item.active ? 'bg-[#ECA03C] text-gray-900 font-semibold' : 'text-[#ECA03C] hover:bg-[#3F546D]'}`}>
                <Icon className="w-6 h-6" strokeWidth={1.5} />
                {!isCollapsed && <span className="ml-4">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-6">
        <button className="flex items-center text-gray-400 hover:text-white transition-colors w-full">
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          {!isCollapsed && <span className="ml-3 text-sm underline decoration-gray-500 underline-offset-4">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}

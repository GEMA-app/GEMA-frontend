'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Box,
  Wrench,
  Boxes,
  MapPin,
  Truck,
  ClipboardList,
  History,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearSession, getToken } from '@/lib/auth';
import { fetchWithAuth } from '@/lib/api';

interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    label: 'Operaciones',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: Box, label: 'Activos', href: '/activos' },
      { icon: Wrench, label: 'Mantenimiento', href: '/mantenimiento' },
    ],
  },
  {
    label: 'Recursos',
    items: [
      { icon: Boxes, label: 'Inventario', href: '/configuracion/repuestos' },
      { icon: MapPin, label: 'Ubicaciones', href: '/ubicaciones' },
      { icon: Truck, label: 'Proveedores', href: '/proveedores' },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { icon: ClipboardList, label: 'Reportes', href: '/reportes' },
      { icon: History, label: 'Historial', href: '/historial' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { icon: Users, label: 'Usuarios', href: '/usuarios' },
      { icon: Settings, label: 'Configuración', href: '/configuracion' },
    ],
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    if (getToken()) {
      try {
        await fetchWithAuth('/v1/auth/cerrar-sesion', { method: 'POST' });
      } catch {
        // cerrar sesión igual aunque falle el request
      }
    }
    clearSession();
    window.location.href = '/login';
  };

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col border-r border-white/10 bg-gema-primary transition-all duration-300 dark:bg-gema-bg-dark ${
        isCollapsed ? 'w-16' : 'w-16 md:w-64'
      }`}
    >
      <button
        type="button"
        onClick={() => setIsCollapsed((v) => !v)}
        aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
        className="hidden cursor-pointer items-center justify-start gap-3 px-4 py-6 md:flex"
      >
        <img
          src="/GEMA%20Logo%20Perlado.png"
          alt="GEMA"
          className="h-9 w-auto shrink-0 object-contain"
        />
        <span className={`font-heading text-lg font-bold text-white ${isCollapsed ? 'hidden' : 'hidden md:inline'}`}>
          GEMA
        </span>
      </button>

      <div className="flex items-center justify-center py-4 md:hidden">
        <img
          src="/GEMA%20Logo%20Perlado.png"
          alt="GEMA"
          className="h-8 w-auto shrink-0 object-contain"
        />
      </div>

      <nav
        className="flex-1 space-y-6 overflow-y-auto px-2 py-2 md:px-3"
        aria-label="Navegación principal"
      >
        {MENU_SECTIONS.map((section) => (
          <div key={section.label}>
            <p
              className={`mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-white/40 ${
                isCollapsed ? 'hidden' : 'hidden md:block'
              }`}
            >
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.label}
                    title={item.label}
                  >
                    <div
                      className={`flex items-center justify-center gap-3 py-2.5 pl-3 pr-3 transition-colors cursor-pointer md:justify-start ${
                        isActive
                          ? 'border-l-4 border-white/70 bg-gema-accent font-semibold text-gema-bg-dark rounded-r-xl'
                          : 'border-l-4 border-transparent text-white/70 hover:bg-white/10 rounded-xl'
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden />
                      <span className={`text-sm ${isCollapsed ? 'hidden' : 'hidden md:inline'}`}>
                        {item.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-2 md:p-4">
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white md:justify-start"
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden />
          <span className={`text-sm ${isCollapsed ? 'hidden' : 'hidden md:inline'}`}>
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  );
}

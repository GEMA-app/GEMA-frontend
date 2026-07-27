'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Moon, Sun, User, Lock, Info, LogOut, Wrench, AlertTriangle, ClipboardList, CheckCircle2 } from 'lucide-react';
import { getUserName, clearSession } from '@/lib/auth';
import { fetchWithAuth } from '@/lib/api';
import { getCurrentUser } from '@/services/auth';
import { getEmpresa } from '@/services/empresa';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

interface NotificacionMock {
  id: string;
  icon: typeof Wrench;
  titulo: string;
  descripcion: string;
  tiempo: string;
  leida: boolean;
}

const NOTIFICACIONES_INICIALES: NotificacionMock[] = [
  {
    id: '1',
    icon: Wrench,
    titulo: 'Orden de trabajo #OT-0023 fue cerrada exitosamente',
    descripcion: 'La orden de trabajo se completó sin novedades.',
    tiempo: 'hace 5 min',
    leida: false,
  },
  {
    id: '2',
    icon: AlertTriangle,
    titulo: "Repuesto 'Filtro de aceite' bajo stock mínimo",
    descripcion: 'Revisa el inventario para reponer existencias.',
    tiempo: 'hace 2 horas',
    leida: false,
  },
  {
    id: '3',
    icon: ClipboardList,
    titulo: 'Plan de mantenimiento preventivo programado para mañana',
    descripcion: 'Se ejecutará según el calendario establecido.',
    tiempo: 'hace 1 día',
    leida: true,
  },
  {
    id: '4',
    icon: CheckCircle2,
    titulo: 'Activo ACT-012 cambió estado a operativo',
    descripcion: 'El activo volvió a estar disponible.',
    tiempo: 'hace 2 días',
    leida: true,
  },
];

export default function Header({ isDark, onToggleTheme }: HeaderProps) {
  const router = useRouter();
  const [userName] = useState(() => getUserName() ?? 'Usuario');
  const [email, setEmail] = useState('');
  const [empresaNombre, setEmpresaNombre] = useState('');
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState(NOTIFICACIONES_INICIALES);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const usuario = await getCurrentUser();
        if (!cancelled) setEmail(usuario.email);
      } catch {
        // no bloquear el header si falla
      }
      try {
        const empresa = await getEmpresa();
        if (!cancelled) setEmpresaNombre(empresa.nombre);
      } catch {
        // no bloquear el header si falla
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const marcarTodasVistas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const limpiarNotificaciones = () => {
    setNotificaciones([]);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetchWithAuth('/v1/auth/cerrar-sesion', { method: 'POST' });
    } catch {
      // cerrar sesión igual aunque falle el request
    }
    clearSession();
    router.push('/login');
  };

  const initial = userName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white/80 px-4 backdrop-blur dark:border-white/10 dark:bg-gema-surface-dark/80 sm:h-20 sm:gap-4 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <p className="truncate font-heading text-base font-bold text-gema-primary dark:text-white sm:text-lg">
          Hola, {userName}
        </p>
        <p className="hidden text-xs text-gema-primary/50 dark:text-white/50 sm:block">
          Bienvenido de vuelta a GEMA
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gema-primary/70 transition-colors hover:bg-gema-primary/5 dark:text-white/70 dark:hover:bg-white/10 sm:h-10 sm:w-10"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label="Notificaciones"
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setOpen(false);
            }}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gema-primary/70 transition-colors hover:bg-gema-primary/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10 sm:h-10 sm:w-10"
          >
            <Bell size={18} strokeWidth={1.5} />
            {noLeidas > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gema-accent" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gema-surface-dark">
              <div className="flex items-center gap-2 px-4 py-4">
                <p className="font-heading font-bold text-gray-900 dark:text-white">Notificaciones</p>
                {noLeidas > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gema-accent px-1.5 text-xs font-bold text-gray-900">
                    {noLeidas}
                  </span>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-white/10" />

              <div className="max-h-80 overflow-y-auto">
                {notificaciones.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-white/50">
                    No hay notificaciones.
                  </p>
                ) : (
                  notificaciones.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 ${!n.leida ? 'bg-gema-accent/5' : ''}`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gema-accent/15 text-gema-accent-dark dark:text-gema-accent">
                          <Icon size={16} strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.titulo}</p>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-white/50">{n.descripcion}</p>
                          <p className="mt-1 text-xs text-gray-400 dark:text-white/40">{n.tiempo}</p>
                        </div>
                        {!n.leida && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gema-accent" />}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-white/10" />

              <div className="flex items-center justify-between gap-2 p-2">
                <button
                  type="button"
                  onClick={marcarTodasVistas}
                  className="flex-1 rounded-xl px-3 py-2 text-xs font-semibold text-gema-primary transition-colors hover:bg-gray-50 dark:text-white dark:hover:bg-white/5 cursor-pointer"
                >
                  Marcar todas como vistas
                </button>
                <button
                  type="button"
                  onClick={limpiarNotificaciones}
                  className="flex-1 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Perfil"
            onClick={() => {
              setOpen((prev) => !prev);
              setNotifOpen(false);
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gema-primary/70 transition-colors hover:bg-gema-primary/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10 sm:h-10 sm:w-10"
          >
            <User size={18} strokeWidth={1.5} />
          </button>

          {open && (
            <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gema-surface-dark">
              <div className="flex items-center gap-3 px-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gema-accent font-heading text-base font-bold text-gray-900">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-heading font-bold text-gray-900 dark:text-white">{userName}</p>
                  {email && <p className="truncate text-sm text-gray-500 dark:text-white/60">{email}</p>}
                  {empresaNombre && (
                    <p className="truncate text-sm text-gray-500 dark:text-white/60">{empresaNombre}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-white/10" />

              <nav className="p-2">
                <Link
                  href="/configuracion/perfil"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/5"
                >
                  <User size={16} strokeWidth={1.5} />
                  Mi perfil
                </Link>
                <Link
                  href="/configuracion/contrasena"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/5"
                >
                  <Lock size={16} strokeWidth={1.5} />
                  Cambiar contraseña
                </Link>
                <Link
                  href="/configuracion/acerca-de"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/5"
                >
                  <Info size={16} strokeWidth={1.5} />
                  Acerca de
                </Link>
              </nav>

              <div className="border-t border-gray-200 dark:border-white/10" />

              <div className="p-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-500/10"
                >
                  <LogOut size={16} strokeWidth={1.5} />
                  {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

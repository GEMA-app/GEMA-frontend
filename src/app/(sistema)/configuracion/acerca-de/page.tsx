'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

const EQUIPO = [
  { nombre: 'Alburquerque Sheen', rol: 'Product Manager' },
  { nombre: 'Leal Mauricio', rol: 'Scrum Master' },
  { nombre: 'Rodriguez Jesus', rol: 'DevOps / Arquitecto' },
  { nombre: 'Ortega Luismer', rol: 'DevOps Auxiliar' },
  { nombre: 'Quintero Franklyn', rol: 'DBA' },
  { nombre: 'Valderrey Eldry', rol: 'UI / UX' },
  { nombre: 'Miserol Jose', rol: 'Backend' },
  { nombre: 'Ortiz Sebastián', rol: 'Frontend' },
  { nombre: 'González Angel', rol: 'QA' },
  { nombre: 'Mundarain Adrián', rol: 'QA' },
  { nombre: 'Guarema Saniurka', rol: 'QA' },
  { nombre: 'Antoima Mariangel', rol: 'Backend' },
  { nombre: 'Rinaldi Giovanni', rol: 'Backend' },
  { nombre: 'Reyes Cesar', rol: 'Backend' },
  { nombre: 'Sotillo Glihanny', rol: 'Backend' },
  { nombre: 'Piñero Jorman', rol: 'Frontend' },
  { nombre: 'Ramirez Jesus', rol: 'Frontend' },
  { nombre: 'Leonet Miguelangel', rol: 'Mantenimiento' },
  { nombre: 'Glod Diorgelys', rol: 'Mantenimiento' },
  { nombre: 'Rodríguez Edfrank', rol: 'Integraciones' },
  { nombre: 'Palma Franyibeth', rol: 'Integraciones' },
];

export default function AcercaDePage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/configuracion"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a configuración
        </Link>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Card padding="lg" className="flex flex-col items-center gap-4 text-center">
          <Image src="/gema-logo.png" alt="GEMA" width={112} height={112} className="h-28 w-auto object-contain" />
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-gema-primary dark:text-white">GEMA</h1>
            <span className="mt-2 inline-flex items-center rounded-full bg-gema-accent px-3 py-1 text-xs font-bold text-gray-900">
              v1.0.0 MVP
            </span>
          </div>
          <p className="max-w-xl text-sm text-gema-primary/70 dark:text-white/60">
            Sistema CMMS industrial para Ciudad Guayana. Gestión de activos, mantenimiento,
            inventario y reportes para plantas industriales.
          </p>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gema-accent/15 text-gema-accent-dark dark:text-gema-accent">
                <Users className="h-5 w-5" strokeWidth={2} />
              </div>
              <CardTitle>Equipo</CardTitle>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EQUIPO.map((persona) => (
              <div
                key={persona.nombre}
                className="rounded-xl border border-gema-primary/10 dark:border-white/10 bg-gema-bg-light dark:bg-gema-surface-dark-2 px-4 py-3"
              >
                <p className="text-sm font-semibold text-gema-primary dark:text-white">{persona.nombre}</p>
                <p className="text-xs text-gema-primary/60 dark:text-white/50">{persona.rol}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex items-center justify-center gap-3 py-4 text-center">
          <GraduationCap className="h-6 w-6 text-gema-accent-dark dark:text-gema-accent" strokeWidth={2} />
          <div className="text-left">
            <p className="font-heading font-bold text-sm text-gema-primary dark:text-white">
              Universidad Nacional Experimental de Guayana (UNEG)
            </p>
            <p className="text-xs text-gema-primary/60 dark:text-white/50">
              Ingeniería del Software II — 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

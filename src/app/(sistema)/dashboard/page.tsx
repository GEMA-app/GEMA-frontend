'use client';

import React, { useEffect, useState } from 'react';
import { ensureSessionRoles } from '@/lib/auth';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { SupervisorActivosDashboard } from '@/components/dashboard/SupervisorActivosDashboard';
import { SupervisorOperacionesDashboard } from '@/components/dashboard/SupervisorOperacionesDashboard';
import { TecnicoDashboard } from '@/components/dashboard/TecnicoDashboard';
import { AlmacenistaDashboard } from '@/components/dashboard/AlmacenistaDashboard';
import { ConsultorDashboard } from '@/components/dashboard/ConsultorDashboard';
import { DefaultDashboard } from '@/components/dashboard/DefaultDashboard';

export default function DashboardPage() {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoles() {
      try {
        const userRoles = await ensureSessionRoles();
        setRoles(userRoles);
      } catch {
        setRoles([]);
      } finally {
        setLoading(false);
      }
    }
    loadRoles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-gema-primary/20 dark:border-white/20 border-t-gema-accent animate-spin" />
      </div>
    );
  }

  if (roles.includes('supervisor-activos')) {
    return <SupervisorActivosDashboard />;
  }

  if (roles.includes('supervisor-operaciones')) {
    return <SupervisorOperacionesDashboard />;
  }

  if (roles.includes('tecnico')) {
    return <TecnicoDashboard />;
  }

  if (roles.includes('almacenista')) {
    return <AlmacenistaDashboard />;
  }

  if (roles.includes('consultor')) {
    return <ConsultorDashboard />;
  }

  if (roles.includes('admin')) {
    return <AdminDashboard />;
  }

  return <DefaultDashboard />;
}

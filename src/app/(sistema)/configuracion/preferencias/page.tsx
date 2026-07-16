'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sun, Moon, Monitor, Save } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { getPreferences, updatePreferences } from '@/services/preferences';

export default function PreferenciasPage() {
  const [prefs, setPrefs] = useState({ tema: 'oscuro', version: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await getPreferences();
        if (cancelled) return;
        setPrefs({ tema: p.tema, version: p.version });
      } catch (err) {
        if (!cancelled) setStatus(err instanceof Error ? err.message : 'Error al cargar preferencias');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setStatus('Guardando...');
    try {
      const p = await updatePreferences(prefs.tema, prefs.version);
      setPrefs({ tema: p.tema, version: p.version });
      setStatus('Preferencias guardadas.');
      setTimeout(() => setStatus(''), 2000);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Error al guardar preferencias');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Configuración / Preferencias" variant="activos" />
      <p className="text-sm text-gray-500 mt-4">Cargando preferencias...</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Configuración / Preferencias" variant="activos" />

      <div className="mb-6">
        <Link href="/configuracion" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver a configuración
        </Link>
      </div>

      <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
        <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Preferencias</h2>
            <p className="text-gray-500 text-xs mt-1">Personaliza tu experiencia visual.</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
            <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        <div className="max-w-xl space-y-6">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-gray-800">Tema visual</h3>
          </div>

          <div className="flex gap-3">
            {[
              { value: 'claro', icon: Sun, label: 'Claro' },
              { value: 'oscuro', icon: Moon, label: 'Oscuro' },
              { value: 'sistema', icon: Monitor, label: 'Sistema' },
            ].map(t => {
              const Icon = t.icon;
              return (
                <button key={t.value} type="button" onClick={() => setPrefs(prev => ({ ...prev, tema: t.value }))}
                  className={`flex-1 flex flex-col items-center gap-2 rounded-xl border px-4 py-4 transition-all ${prefs.tema === t.value ? 'border-[#ECA03C] bg-amber-50/50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                >
                  <Icon className={`w-6 h-6 ${prefs.tema === t.value ? 'text-[#8B4513]' : 'text-gray-500'}`} strokeWidth={1.5} />
                  <span className={`text-xs font-semibold ${prefs.tema === t.value ? 'text-[#8B4513]' : 'text-gray-600'}`}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {status && <p className={`text-sm ${status.includes('Error') ? 'text-red-600' : 'text-emerald-700'}`}>{status}</p>}
      </div>
    </div>
  );
}

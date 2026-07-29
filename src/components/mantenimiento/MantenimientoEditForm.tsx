'use client';

import { useEffect, useState } from 'react';

type MantenimientoRecord = {
  id: string;
  empresa_id: string;
  equipo_nombre: string;
  tipo_servicio: 'correctivo' | 'preventivo';
  prioridad: 'baja' | 'media' | 'alta';
  tecnico_id: string;
  fecha_programada: string;
  notas: string;
  version: string;
};

type ErrorResponse = {
  errors: Array<{ status: string; detail: string }>;
};

type Permissions = {
  canEdit: boolean;
  canSubmit: boolean;
};

const API_BASE = '/v1';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/vnd.api+json',
  'Accept': 'application/vnd.api+json',
  Authorization: `Bearer ${token}`,
});

export default function MantenimientoEditForm({
  empresaId,
  mantenimientoId,
  token,
  permissions,
}: {
  empresaId: string;
  mantenimientoId: string;
  token: string;
  permissions: Permissions;
}) {
  const [data, setData] = useState<MantenimientoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!empresaId || !mantenimientoId || !token) return;

    async function loadRecord() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/empresas/${empresaId}/ordenes-trabajo/${mantenimientoId}`, {
          headers: getHeaders(token),
          method: 'GET',
        });

        if (!res.ok) {
          const payload = (await res.json()) as ErrorResponse;
          throw new Error(payload.errors?.[0]?.detail || 'Error cargando mantenimiento');
        }

        const json = await res.json();
        const record = json.data?.attributes;
        const id = json.data?.id;
        const version = json.data?.meta?.version ?? json.data?.attributes?.version;

        if (!record || !id) {
          throw new Error('Respuesta inválida de mantenimiento');
        }

        setData({
          id,
          empresa_id: empresaId,
          equipo_nombre: record.equipo_nombre,
          tipo_servicio: record.tipo_servicio,
          prioridad: record.prioridad,
          tecnico_id: record.tecnico_id,
          fecha_programada: record.fecha_programada,
          notas: record.notas,
          version,
        });
      } catch (err: any) {
        setError(err?.message ?? 'No se pudo cargar el mantenimiento');
      } finally {
        setLoading(false);
      }
    }

    loadRecord();
  }, [empresaId, mantenimientoId, token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data || !permissions.canSubmit) return;

    setSaving(true);
    setError(null);

    try {
      const payload = {
        data: {
          type: 'mantenimientos',
          id: data.id,
          attributes: {
            equipo_nombre: data.equipo_nombre,
            tipo_servicio: data.tipo_servicio,
            prioridad: data.prioridad,
            tecnico_id: data.tecnico_id,
            fecha_programada: data.fecha_programada,
            notas: data.notas,
            version: data.version,
          },
        },
      };

      const res = await fetch(`${API_BASE}/empresas/${empresaId}/mantenimientos/${data.id}`, {
        method: 'PATCH',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const payload = (await res.json()) as ErrorResponse;
        throw new Error(payload.errors?.[0]?.detail || 'Error actualizando mantenimiento');
      }

      const json = await res.json();
      const record = json.data?.attributes;
      const newestVersion = json.data?.meta?.version ?? json.data?.attributes?.version;

      setData((current) =>
        current
          ? {
              ...current,
              equipo_nombre: record.equipo_nombre,
              tipo_servicio: record.tipo_servicio,
              prioridad: record.prioridad,
              tecnico_id: record.tecnico_id,
              fecha_programada: record.fecha_programada,
              notas: record.notas,
              version: newestVersion,
            }
          : null
      );
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo actualizar el mantenimiento');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <p className="text-sm text-slate-500">Cargando datos de mantenimiento…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <p className="text-sm text-red-600">{error || 'No se encontró el mantenimiento seleccionado.'}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-xl font-semibold text-slate-900">Editar mantenimiento</h2>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span>Equipo</span>
            <input
              type="text"
              value={data.equipo_nombre}
              onChange={(event) => setData({ ...data, equipo_nombre: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span>Tipo de servicio</span>
            <select
              value={data.tipo_servicio}
              onChange={(event) => setData({ ...data, tipo_servicio: event.target.value as 'correctivo' | 'preventivo' })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="correctivo">Correctivo</option>
              <option value="preventivo">Preventivo</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span>Prioridad</span>
            <select
              value={data.prioridad}
              onChange={(event) => setData({ ...data, prioridad: event.target.value as 'baja' | 'media' | 'alta' })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span>Fecha programada</span>
            <input
              type="datetime-local"
              value={data.fecha_programada}
              onChange={(event) => setData({ ...data, fecha_programada: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Notas</span>
          <textarea
            value={data.notas}
            onChange={(event) => setData({ ...data, notas: event.target.value })}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">UUID: {data.id}</p>
          <button
            type="submit"
            disabled={!permissions.canSubmit || saving}
            className="inline-flex items-center justify-center rounded-full bg-[#E59D2C] px-6 py-3 text-sm font-semibold text-[#000000] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>

        {!permissions.canEdit ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            No tienes permisos suficientes para editar este mantenimiento.
          </p>
        ) : null}
      </form>
    </div>
  );
}

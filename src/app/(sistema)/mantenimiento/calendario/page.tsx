"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const defaultAssets = [
  { value: '', label: 'Seleccione un equipo...' },
];

const priorities = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
];

const defaultTechnicians = [
  { value: '', label: 'Seleccione técnico' },
];

export default function CalendarPage() {
  const [serviceType, setServiceType] = useState<'correctivo' | 'preventivo'>('correctivo');
  const [asset, setAsset] = useState('');
  const [priority, setPriority] = useState('baja');
  const [technician, setTechnician] = useState('');
  const [assetOpen, setAssetOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [technicianOpen, setTechnicianOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');

  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [activos, setActivos] = useState(defaultAssets);
  const [techniciansList, setTechniciansList] = useState(defaultTechnicians);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataLoadMessage, setDataLoadMessage] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleSchedule = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!asset) {
      setSubmissionMessage('Seleccione un activo para continuar.');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      setSubmissionMessage('Seleccione una fecha y una hora para la orden.');
      return;
    }

    if (!technician) {
      setSubmissionMessage('Asigne un técnico para continuar.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionMessage(null);

    try {
      const token = localStorage.getItem('token');
      const empresaId = localStorage.getItem('empresaId');

      if (!token || !empresaId) {
        throw new Error('No se pudo identificar la sesión del usuario.');
      }

      const activoLabel = activos.find((item) => item.value === asset)?.label ?? asset;
      const technicianLabel = techniciansList.find((item) => item.value === technician)?.label ?? technician;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/empresas/${empresaId}/ordenes-trabajo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/vnd.api+json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.api+json',
          },
          body: JSON.stringify({
            data: {
              type: 'ordenes-trabajo',
              attributes: {
                tipo: serviceType,
                descripcion_trabajo: notes,
                fecha_apertura: `${scheduledDate}T${scheduledTime}`,
                activo_id: asset,
                supervisor_id: technician,
                prioridad: priority,
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const detail = (errBody as any)?.errors?.[0]?.detail ?? `Error ${response.status}`;
        throw new Error(detail);
      }

      const reportData = {
        equipoNombre: activoLabel,
        tipoServicio: serviceType === 'correctivo' ? 'Correctivo' : 'Preventivo',
        codigoInventario: asset,
        referenciasFalla: notes || 'Sin detalles adicionales',
        resumenActividades: `Agendado servicio ${serviceType === 'correctivo' ? 'correctivo' : 'preventivo'} para ${activoLabel} el ${scheduledDate} a las ${scheduledTime}.`,
        fechaApertura: `${scheduledDate} ${scheduledTime}`,
        fechaCierre: 'Pendiente',
        tecnicoResponsable: technicianLabel,
        supervisorResponsable: 'Supervisor GEMA',
        costoTotal: '$0.00',
      };

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('gemaOrdenReporte', JSON.stringify(reportData));
      }

      router.push('/mantenimiento/orden');
    } catch (err: unknown) {
      console.error('Error creando orden', err);
      const message = err instanceof Error ? err.message : 'No se pudo agendar la orden. Intente nuevamente.';
      setSubmissionMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setServiceType('correctivo');
    setAsset('');
    setPriority('baja');
    setTechnician('');
    setAssetOpen(false);
    setPriorityOpen(false);
    setTechnicianOpen(false);
    setScheduledDate('');
    setScheduledTime('');
    setNotes('');
    setSubmissionMessage(null);
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoadingData(true);
      setDataLoadMessage(null);

      try {
        const token = localStorage.getItem('token');
        const empresaId = localStorage.getItem('empresaId');

        if (!token || !empresaId) {
          throw Object.assign(
            new Error('No hay sesión activa. Inicie sesión para cargar activos y técnicos.'),
            { status: 401 }
          );
        }

        setEmpresaId(empresaId);

        const activosRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/empresas/${empresaId}/activos`,
          { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.api+json' } }
        );
        if (activosRes.ok && mounted) {
          const activosData = await activosRes.json();
          const activosMapped = (activosData.data ?? []).map((a: Record<string, any>) => ({
            value: a.id,
            label: a.attributes?.nombre ?? a.id,
          }));
          if (activosMapped.length) setActivos(activosMapped);
        }

        const usuariosRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/empresas/${empresaId}/usuarios`,
          { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.api+json' } }
        );
        if (usuariosRes.ok && mounted) {
          const usuariosData = await usuariosRes.json();
          const usuariosMapped = (usuariosData.data ?? []).map((u: Record<string, any>) => ({
            value: u.id,
            label: u.attributes?.nombre ?? u.attributes?.email ?? u.id,
          }));
          if (usuariosMapped.length) setTechniciansList(usuariosMapped);
        }
      } catch (err: any) {
        const status = err?.status;
        if (status === 401) {
          setDataLoadMessage('No hay sesión activa o esta expiró. Inicie sesión para cargar los datos del sistema.');
        } else if (status === 400) {
          setDataLoadMessage('No se pudieron cargar los datos de la empresa. Revise la configuración del backend.');
        } else if (status === 422) {
          setDataLoadMessage('Los datos recibidos por el sistema no son válidos.');
        } else {
          setDataLoadMessage(err?.message || 'No se pudo conectar con el servidor. Verifique que el backend esté disponible.');
        }
      } finally {
        if (mounted) setIsLoadingData(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F3] py-10 px-6 overflow-auto">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white border border-gray-100 p-10 shadow-xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-[#0B2545]">NUEVA ORDEN</p>
          <p className="mt-2 text-sm text-[#000000]">Agendar servicio de mantenimiento</p>
        </div>

        {isLoadingData ? (
          <div className="mb-6 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
            Cargando activos y técnicos...
          </div>
        ) : null}

        {dataLoadMessage ? (
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {dataLoadMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md p-3 text-[#0B2545]">
                <svg viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30,3H2A2,2,0,0,0,0,5V24a2,2,0,0,0,2,2H14v2H10v1H22V28H18V26H30a2,2,0,0,0,2-2V5A2,2,0,0,0,30,3ZM17,28H15V26h2v2Zm14-4a1,1,0,0,1-1,1H2a1,1,0,0,1-1-1V5A1,1,0,0,1,2,4H30a1,1,0,0,1,1,1V24Z" />
                  <path d="M2,21H30V5H2V21ZM3,6H29V20H3V6Z" />
                  <circle cx="16" cy="23" r="1" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0B2545]">Información del activo</p>
              </div>
            </div>
            <div className="relative">
              <div
                className="flex items-center justify-between rounded-md border border-[#D1D5DB]  bg-[#F2F2F3] px-4 py-3 text-sm text-[#000000] shadow-[0_4px_12px_#F2F2F3] cursor-pointer"
                onClick={() => setAssetOpen((prev) => !prev)}
              >
                <span>{activos.find((item) => item.value === asset)?.label ?? 'Seleccione un equipo...'}</span>
                <span className="text-sm">▼</span>
              </div>

              {assetOpen && (
                <ul className="absolute z-10 w-full mt-1  bg-[#F2F2F3]  border border-[#D1D5DB] rounded-md shadow-lg overflow-hidden">
                  {activos.map((item: { value: string; label: string }) => (
                    <li
                      key={item.value}
                      className="cursor-pointer px-4 py-3 text-sm text-[#000000] hover:bg-[#F3D58D] hover:text-[#000000]"
                      onClick={() => {
                        setAsset(item.value);
                        setAssetOpen(false);
                      }}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <div className="border-b border-[#000000]" />

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md  p-3 text-[#0B2545]">
                <svg viewBox="0 0 485.213 485.212" className="h-6 w-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <path d="M60.652,75.816V15.163C60.652,6.781,67.433,0,75.817,0c8.38,0,15.161,6.781,15.161,15.163v60.653 c0,8.38-6.781,15.161-15.161,15.161C67.433,90.978,60.652,84.196,60.652,75.816z M318.424,90.978 c8.378,0,15.163-6.781,15.163-15.161V15.163C333.587,6.781,326.802,0,318.424,0c-8.382,0-15.168,6.781-15.168,15.163v60.653 C303.256,84.196,310.042,90.978,318.424,90.978z M485.212,363.906c0,66.996-54.312,121.307-121.303,121.307 c-66.986,0-121.302-54.311-121.302-121.307c0-66.986,54.315-121.3,121.302-121.3C430.9,242.606,485.212,296.919,485.212,363.906z M454.89,363.906c0-50.161-40.81-90.976-90.98-90.976c-50.166,0-90.976,40.814-90.976,90.976c0,50.171,40.81,90.98,90.976,90.98 C414.08,454.886,454.89,414.077,454.89,363.906z M121.305,181.955H60.652v60.651h60.653V181.955z M60.652,333.584h60.653V272.93 H60.652V333.584z M151.629,242.606h60.654v-60.651h-60.654V242.606z M151.629,333.584h60.654V272.93h-60.654V333.584z M30.328,360.891V151.628h333.582v60.653h30.327V94c0-18.421-14.692-33.349-32.843-33.349h-12.647v15.166 c0,16.701-13.596,30.325-30.322,30.325c-16.731,0-30.326-13.624-30.326-30.325V60.651H106.14v15.166 c0,16.701-13.593,30.325-30.322,30.325c-16.733,0-30.327-13.624-30.327-30.325V60.651H32.859C14.707,60.651,0.001,75.579,0.001,94 v266.892c0,18.36,14.706,33.346,32.858,33.346h179.424v-30.331H32.859C31.485,363.906,30.328,362.487,30.328,360.891z M303.256,242.606v-60.651h-60.648v60.651H303.256z M409.399,363.906h-45.49v-45.49c0-8.377-6.781-15.158-15.163-15.158 s-15.159,6.781-15.159,15.158v60.658c0,8.378,6.777,15.163,15.159,15.163h60.653c8.382,0,15.163-6.785,15.163-15.163 C424.562,370.692,417.781,363.906,409.399,363.906z" />
                  </g>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0B2545]">Programación</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-3">
                <span className="text-sm font-semibold text-[#000000] ">Fecha del servicio</span>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(event) => setScheduledDate(event.target.value)}
                  className="custom-picker accent-[#E59D2C] transition-all duration-200 w-full rounded-md border border-[#000000] bg-[#F2F2F3] px-4 py-3 text-sm text-[#000000] outline-none shadow-[0_4px_12px_#F2F2F3] hover:border-[#E59D2C] hover:shadow-[0_4px_12px_#F3D58D] focus:ring-2 focus:ring-[#E59D2C] focus:outline-none"
                />
              </label>

              <label className="space-y-3">
                <span className="text-sm font-semibold text-[#000000]">Hora sugerida</span>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(event) => setScheduledTime(event.target.value)}
                  placeholder="--:--"
                  className="custom-picker accent-[#E59D2C] transition-all duration-200 w-full rounded-md border border-[#000000] bg-[#F2F2F3] px-4 py-3 text-sm text-[#000000] outline-none shadow-[0_4px_12px_#F2F2F3] hover:border-[#E59D2C] hover:shadow-[0_4px_12px_#F3D58D] focus:ring-2 focus:ring-[#E59D2C] focus:outline-none"
                />
              </label>
            </div>
          </section>

          <div className="border-b border-[#000000]" />

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md p-3 text-[#0B2545]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19,14.5 L19,5.5 C19,4.67157288 18.3284271,4 17.5,4 L6.5,4 C5.67157288,4 5,4.67157288 5,5.5 L5,18.5 C5,19.3284271 5.67157288,20 6.5,20 L13.5,20 C14.3284271,20 15,19.3284271 15,18.5 C15,17.1192881 16.1192881,16 17.5,16 C18.3284271,16 19,15.3284271 19,14.5 L19,14.5 Z M18.5014408,16.7913481 C18.1948298,16.9255432 17.8561101,17 17.5,17 C16.6715729,17 16,17.6715729 16,18.5 C16,18.8561101 15.9255432,19.1948298 15.7913481,19.5014408 C16.9873685,18.9526013 17.9526013,17.9873685 18.5014408,16.7913481 L18.5014408,16.7913481 Z M4,5.5 C4,4.11928813 5.11928813,3 6.5,3 L17.5,3 C18.8807119,3 20,4.11928813 20,5.5 L20,14.5 C20,18.0898509 17.0898509,21 13.5,21 L6.5,21 C5.11928813,21 4,19.8807119 4,18.5 L4,5.5 Z M8.5,9 C8.22385763,9 8,8.77614237 8,8.5 C8,8.22385763 8.22385763,8 8.5,8 L15.5,8 C15.7761424,8 16,8.22385763 16,8.5 C16,8.77614237 15.7761424,9 15.5,9 L8.5,9 Z M8.5,12 C8.22385763,12 8,11.7761424 8,11.5 C8,11.2238576 8.22385763,11 8.5,11 L15.5,11 C15.7761424,11 16,11.2238576 16,11.5 C16,11.7761424 15.7761424,12 15.5,12 L8.5,12 Z M8.5,15 C8.22385763,15 8,14.7761424 8,14.5 C8,14.2238576 8.22385763,14 8.5,14 L13.5,14 C13.7761424,14 14,14.2238576 14,14.5 C14,14.7761424 13.7761424,15 13.5,15 L8.5,15 Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0B2545]">Asignación y tipo</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#000000]">Tipo de servicio</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setServiceType('correctivo')}
                    className={`flex-1 rounded-md px-4 py-3 text-sm font-semibold transition ${
                      serviceType === 'correctivo'
                        ? 'bg-[#E59D2C] text-[#000000] shadow-[0_4px_12px_rgba(242,242,243,1)]'
                        : 'bg-[#F2F2F3] text-[#000000] border border-[#000000] shadow-[0_4px_12px_rgba(242,242,243,1)]'
                    }`}
                  >
                    Correctivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceType('preventivo')}
                    className={`flex-1 rounded-md px-4 py-3 text-sm font-semibold transition ${
                      serviceType === 'preventivo'
                        ? 'bg-[#E59D2C] text-[#000000] shadow-[0_4px_12px_rgba(242,242,243,1)]'
                        : 'bg-[#F2F2F3] text-[#000000] border border-[#000000] shadow-[0_4px_12px_rgba(242,242,243,1)]'
                    }`}
                  >
                    Preventivo
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#000000] ">Prioridad</label>
                <div className="relative">
                  <div
                    className="flex items-center justify-between rounded-md border border-[#D1D5DB] bg-[#F2F2F3]  px-4 py-3 text-sm text-[#000000] shadow-[0_4px_12px_#F2F2F3] cursor-pointer"
                    onClick={() => setPriorityOpen((prev) => !prev)}
                  >
                    <span>{priorities.find((item) => item.value === priority)?.label ?? 'Seleccione prioridad'}</span>
                    <span className="text-sm">▼</span>
                  </div>

                  {priorityOpen && (
                    <ul className="absolute z-10 w-full mt-1 bg-[#F2F2F3] border border-[#D1D5DB] rounded-md shadow-lg overflow-hidden">
                      {priorities.map((item) => (
                        <li
                          key={item.value}
                          className="cursor-pointer px-4 py-3 text-sm text-[#000000] hover:bg-[#F3D58D] hover:text-[#000000]"
                          onClick={() => {
                            setPriority(item.value);
                            setPriorityOpen(false);
                          }}
                        >
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <label className="block text-sm font-semibold text-[#000000]">Técnico asignado</label>
            <div className="relative">
              <div
                className="flex items-center justify-between rounded-md border border-[#D1D5DB]  bg-[#F2F2F3]  px-4 py-3 text-sm text-[#000000] shadow-[0_4px_12px_#F2F2F3] cursor-pointer"
                onClick={() => setTechnicianOpen((prev) => !prev)}
              >
                <span>{techniciansList.find((item) => item.value === technician)?.label ?? 'Seleccione técnico'}</span>
                <span className="text-sm">▼</span>
              </div>

              {technicianOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-[#F2F2F3] border border-[#D1D5DB] rounded-md shadow-lg overflow-hidden">
                  {techniciansList.map((item: { value: string; label: string }) => (
                    <li
                      key={item.value}
                      className="cursor-pointer px-4 py-3 text-sm text-[#000000] hover:bg-[#F3D58D] hover:text-[#000000]"
                      onClick={() => {
                        setTechnician(item.value);
                        setTechnicianOpen(false);
                      }}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <label className="block text-sm font-semibold text-[#000000]">Notas adicionales / instrucciones</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notes..."
              rows={6}
              className="w-full rounded-md border border-[#D1D5DB] bg-[#F2F2F3] px-4 py-4 text-sm text-[#000000] outline-none resize-none shadow-[0_4px_12px_rgba(242,242,243,1)]"
            />
          </section>

          {submissionMessage ? (
            <div className={`rounded-md border px-4 py-3 text-sm ${submissionMessage.includes('correctamente') ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
              {submissionMessage}
            </div>
          ) : null}

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              type="button"
             onClick={() => window.location.href = '/mantenimiento'}
               className="rounded-full bg-[#F3D58D] px-8 py-3.5 text-base font-semibold text-[#000000] shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:brightness-90 transition duration-200"            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSchedule}
              ////
              disabled={!empresaId || isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-[#E59D2C] px-8 py-3.5 text-base font-semibold text-[#000000] shadow-[0_4px_12px_rgba(0,0,0,0.08)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Procesando…' : '+ Agendar orden'}
            </button>
          </div>
        </form>
        <style jsx global>{`
          input.custom-picker {
            background: #F2F2F3;
            border-radius: 0.375rem;
            color: #000000;
            box-shadow: 0 4px 12px #F2F2F3;
            accent-color: #E59D2C;
            color-scheme: light;
          }

          input.custom-picker:hover {
            border-color: #E59D2C;
            box-shadow: 0 4px 12px #F3D58D;
          }

          input.custom-picker:focus {
            outline: none;
            box-shadow: 0 0 0 2px #E59D2C, 0 4px 12px #F3D58D;
          }

          input.custom-picker::-webkit-calendar-picker-indicator,
          input.custom-picker::-webkit-clear-button,
          input.custom-picker::-webkit-inner-spin-button {
            cursor: pointer;
            filter: invert(34%) sepia(78%) saturate(517%) hue-rotate(1deg) brightness(96%) contrast(90%);
          }

          input.custom-picker::-webkit-calendar-picker-indicator:hover,
          input.custom-picker::-webkit-clear-button:hover,
          input.custom-picker::-webkit-inner-spin-button:hover {
            filter: invert(76%) sepia(41%) saturate(437%) hue-rotate(1deg) brightness(101%) contrast(101%);
          }

          input.custom-picker::-webkit-clear-button {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
}
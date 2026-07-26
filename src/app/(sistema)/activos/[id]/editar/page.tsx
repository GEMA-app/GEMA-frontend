'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, MapPin, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useActivo, useActivos } from '@/hooks/useActivos';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { flattenUbicacionesForSelect } from '@/lib/ubicaciones';

function EditarActivoContent() {
  const params = useParams();
  const activoId = params.id as string;
  const { ubicaciones, loading: loadingUbicaciones, error: ubicacionesError } = useUbicaciones();
  const ubicacionOptions = useMemo(
    () => flattenUbicacionesForSelect(ubicaciones),
    [ubicaciones],
  );
  const router = useRouter();
  const { activo: asset, catalog, loading: loadingAsset } = useActivo(activoId ?? '');
  const { editarActivo } = useActivos();

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    marca: '',
    ubicacion: '',
    fechaCompra: '',
    estadoInicial: 'Operativo',
    version: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Poblar formulario cuando se cargan los datos
  useEffect(() => {
    if (!asset) return;
    const estadoMap: Record<string, string> = {
      'operativo': 'Operativo',
      'en_mantenimiento': 'En mantenimiento',
      'fuera_de_servicio': 'Fuera de servicio',
      'dado_de_baja': 'Dado de baja',
    };
    setFormData({
      nombre: asset.serial_interno,
      codigo: asset.codigo_activo,
      marca: catalog?.manufacturer || '',
      ubicacion: asset.ubicacion_id || '',
      fechaCompra: asset.fecha_adquisicion || '',
      estadoInicial: estadoMap[asset.estado] || 'Operativo',
      version: asset.version,
    });
  }, [asset, catalog]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setSubmitStatus('');
  };

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!formData.nombre.trim()) next.nombre = 'El serial interno (nombre) es obligatorio.';
    if (!formData.codigo.trim()) next.codigo = 'El código de activo es obligatorio.';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validateForm();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSubmitStatus('Por favor corrige los errores antes de guardar.');
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus('Guardando...');
    try {
      await editarActivo(activoId, {
        serial_interno: formData.nombre,
        codigo_activo: formData.codigo,
        ubicacion_id: formData.ubicacion || null,
        fecha_adquisicion: formData.fechaCompra || null,
        estado: formData.estadoInicial.toLowerCase().replace(/\s+/g, '_'),
        version: formData.version,
      });
      setSubmitStatus('Activo actualizado correctamente.');
      setTimeout(() => router.push(`/activos/${activoId}`), 800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setSubmitStatus(
        /no se puede transicionar/i.test(msg)
          ? 'Los activos dados de baja no pueden cambiar de estado. Si necesitas registrar este activo de nuevo, crea uno desde cero.'
          : msg || 'Error al actualizar el activo',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAsset) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
        <PageHeader title="Activos / Editar activo" variant="activos" />
        <p className="text-gray-500 text-sm mt-8">Cargando datos del activo...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Activos / Editar activo" variant="activos" />

      <div className="mb-6">
        <Link href={`/activos/${activoId}`} className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver a la ficha
        </Link>
      </div>

      <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
        <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Activo</h2>
            <p className="text-gray-500 text-xs mt-1">Modifique los datos del equipo en el inventario.</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/activos/${activoId}`} className="px-6 py-2.5 bg-[#F3D58D] text-gray-900 font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">
              Cancelar
            </Link>
            <PermissionGuard module="activos" action="edit">
              <button
                type="submit"
                form="editar-activo-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
                {isSubmitting ? 'Guardando...' : 'guardar cambios'}
              </button>
            </PermissionGuard>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <form id="editar-activo-form" onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <FileText className="w-5 h-5" />
                <span className="text-gray-800">Información General</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="nombre">Serial Interno (Nombre)</label>
                  <input
                    id="nombre" name="nombre" type="text"
                    value={formData.nombre} onChange={handleInputChange}
                    className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.nombre ? 'border-red-500' : 'border-gray-400'}`}
                  />
                  {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Artículo (catálogo)</label>
                  <p className="text-sm py-1.5 border-b border-gray-300">
                    {catalog?.name ? <Link href={`/catalogo/${asset?.articulo_id}`} className="text-[#E59D12] hover:underline">{catalog.name}</Link> : '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="codigo">Código de Activo</label>
                  <input
                    id="codigo" name="codigo" type="text"
                    value={formData.codigo} onChange={handleInputChange}
                    className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.codigo ? 'border-red-500' : 'border-gray-400'}`}
                  />
                  {errors.codigo && <p className="text-xs text-red-600 mt-1">{errors.codigo}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="ubicacion">Ubicación Física</label>
                  <select
                    id="ubicacion" name="ubicacion"
                    value={formData.ubicacion} onChange={handleInputChange}
                    disabled={loadingUbicaciones}
                    className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400"
                  >
                    <option value="">
                      {loadingUbicaciones ? 'Cargando ubicaciones...' : 'Seleccione una ubicación'}
                    </option>
                    {ubicacionOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                  {ubicacionesError && <p className="text-xs text-amber-700 mt-1">{ubicacionesError}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <MapPin className="w-5 h-5" />
                <span className="text-gray-800">Adquisición</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="fechaCompra">Fecha de Adquisición</label>
                  <input
                    id="fechaCompra" name="fechaCompra" type="date"
                    value={formData.fechaCompra} onChange={handleInputChange}
                    style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                    className="date-input w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400"
                  />
                </div>
              </div>
            </div>

            {submitStatus && (
              <p className={`text-sm ${submitStatus.includes('Error') || submitStatus.includes('error') ? 'text-red-600' : 'text-emerald-700'}`}>{submitStatus}</p>
            )}
          </form>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md flex flex-col items-center">
            <h3 className="text-gray-800 font-bold text-center mb-6 text-base">Estado</h3>
            <div className="w-full space-y-3">
              {['Operativo', 'En mantenimiento', 'Fuera de servicio', 'Dado de baja'].map((estado) => (
                <label key={estado} className="flex items-center px-4 py-3 border border-gray-200 rounded-xl cursor-pointer transition-all bg-white">
                  <input
                    type="radio" name="estadoInicial"
                    value={estado}
                    checked={formData.estadoInicial === estado}
                    onChange={handleInputChange}
                    className="accent-[#8B4513] w-4 h-4 mr-3"
                  />
                  <span className="text-xs font-semibold text-gray-700">{estado}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditarActivoPage() {
  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico']}>
      <PermissionGuard module="activos" action="edit">
        <EditarActivoContent />
      </PermissionGuard>
    </AuthGuard>
  );
}

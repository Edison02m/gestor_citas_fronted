'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import configuracionPlanesService, {
  ConfiguracionPlan,
  EstadisticasPlanes,
} from '@/services/configuracion-planes.service';

export default function ConfiguracionPlanesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [planes, setPlanes] = useState<ConfiguracionPlan[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPlanes | null>(null);
  const [planSeleccionado, setPlanSeleccionado] = useState<ConfiguracionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  // Verificar que sea Super Admin
  useEffect(() => {
    if (user && user.rol !== 'SUPER_ADMIN') {
      router.push('/dashboard-usuario');
    }
  }, [user, router]);

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [planesData, statsData] = await Promise.all([
        configuracionPlanesService.obtenerConfiguracionPlanes(),
        configuracionPlanesService.obtenerEstadisticasPlanes(),
      ]);
      setPlanes(planesData);
      setEstadisticas(statsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar la configuración de planes');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarPlan = (plan: ConfiguracionPlan) => {
    setPlanSeleccionado(plan);
    setError(null);
    setExito(false);
  };

  const handleCancelar = () => {
    setPlanSeleccionado(null);
    setError(null);
    setExito(false);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planSeleccionado) return;

    try {
      setGuardando(true);
      setError(null);

      await configuracionPlanesService.actualizarConfiguracionPlan(
        planSeleccionado.plan,
        {
          limiteSucursales: planSeleccionado.limiteSucursales,
          limiteEmpleados: planSeleccionado.limiteEmpleados,
          limiteServicios: planSeleccionado.limiteServicios,
          limiteClientes: planSeleccionado.limiteClientes,
          limiteCitasMes: planSeleccionado.limiteCitasMes,
          limiteWhatsAppMes: planSeleccionado.limiteWhatsAppMes,
          limiteEmailMes: planSeleccionado.limiteEmailMes,
          reportesAvanzados: planSeleccionado.reportesAvanzados,
          duracionDias: planSeleccionado.duracionDias,
          precio: planSeleccionado.precio,
          nombre: planSeleccionado.nombre,
          descripcion: planSeleccionado.descripcion ?? undefined,
        }
      );

      setExito(true);
      await cargarDatos();
      
      setTimeout(() => {
        setPlanSeleccionado(null);
        setExito(false);
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  const actualizarCampo = (campo: keyof ConfiguracionPlan, valor: any) => {
    if (!planSeleccionado) return;
    setPlanSeleccionado({
      ...planSeleccionado,
      [campo]: valor,
    });
  };

  const formatLimite = (limite: number | null) => {
    return limite === null ? '∞' : limite.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0490C8] mx-auto"></div>
            <p className="text-sm text-gray-500 mt-4">Cargando configuración de planes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#0490C8] hover:text-[#023664] font-medium text-sm mb-4 inline-flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración de Planes</h1>
          <p className="text-sm text-gray-600">
            Gestiona los límites, precios y características de cada plan de suscripción
          </p>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Gratis</p>
              <p className="text-2xl font-bold text-green-600">{estadisticas.GRATIS}</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">PRO</p>
              <p className="text-2xl font-bold text-[#0490C8]">{estadisticas.PRO}</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">PRO PLUS</p>
              <p className="text-2xl font-bold text-purple-600">{estadisticas.PRO_PLUS}</p>
            </div>
            
            <div className="group bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200 p-6 hover:border-amber-400 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Custom</p>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-amber-600">{estadisticas.PERSONALIZADO}</p>
              <p className="text-xs text-amber-600 mt-1 font-medium">Personalizado</p>
            </div>
          </div>
        )}

        {/* Grid de planes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.nombre}</h3>
                  <p className="text-sm text-gray-600">{plan.descripcion}</p>
                </div>
                <button
                  onClick={() => handleEditarPlan(plan)}
                  className="text-[#0490C8] hover:text-[#023664] font-medium text-sm transition-colors"
                >
                  Editar
                </button>
              </div>

              {/* Precio y duración */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Precio</p>
                  <p className="text-xl font-bold text-gray-900">${plan.precio}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Duración</p>
                  <p className="text-xl font-bold text-gray-900">{plan.duracionDias} días</p>
                </div>
              </div>

              {/* Límites */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sucursales</span>
                  <span className="font-medium text-gray-900">{formatLimite(plan.limiteSucursales)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Empleados</span>
                  <span className="font-medium text-gray-900">{formatLimite(plan.limiteEmpleados)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Servicios</span>
                  <span className="font-medium text-gray-900">{formatLimite(plan.limiteServicios)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clientes</span>
                  <span className="font-medium text-gray-900">{formatLimite(plan.limiteClientes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Citas/mes</span>
                  <span className="font-medium text-gray-900">{formatLimite(plan.limiteCitasMes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WhatsApp/mes</span>
                  <span className="font-medium text-gray-900">{formatLimite(plan.limiteWhatsAppMes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emails/mes</span>
                  <span className="font-medium text-gray-900">{formatLimite(plan.limiteEmailMes)}</span>
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                  <span className="text-gray-600">Reportes Avanzados</span>
                  <span className={`font-medium ${plan.reportesAvanzados ? 'text-green-600' : 'text-gray-400'}`}>
                    {plan.reportesAvanzados ? '✓ Incluidos' : '✗ No incluidos'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de edición */}
        {planSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Editar {planSeleccionado.nombre}
                </h2>
                <button
                  onClick={handleCancelar}
                  disabled={guardando}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleGuardar} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-160px)]">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">
                    {error}
                  </div>
                )}

                {exito && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl text-xs">
                    ✓ Configuración guardada correctamente
                  </div>
                )}

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre del Plan
                  </label>
                  <input
                    type="text"
                    value={planSeleccionado.nombre}
                    onChange={(e) => actualizarCampo('nombre', e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    value={planSeleccionado.descripcion || ''}
                    onChange={(e) => actualizarCampo('descripcion', e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all resize-none"
                    rows={2}
                    placeholder="Describe las características del plan..."
                  />
                </div>

                {/* Precio y Duración */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Precio (USD/mes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={planSeleccionado.precio}
                      onChange={(e) => actualizarCampo('precio', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Duración (días)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={planSeleccionado.duracionDias}
                      onChange={(e) => actualizarCampo('duracionDias', parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Límites */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Límites de Recursos</h3>
                  <p className="text-xs text-gray-500 mb-3">Deja vacío o usa "0" para ilimitado</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'limiteSucursales', label: 'Sucursales' },
                      { key: 'limiteEmpleados', label: 'Empleados' },
                      { key: 'limiteServicios', label: 'Servicios' },
                      { key: 'limiteClientes', label: 'Clientes' },
                      { key: 'limiteCitasMes', label: 'Citas/mes' },
                      { key: 'limiteWhatsAppMes', label: 'WhatsApp/mes' },
                      { key: 'limiteEmailMes', label: 'Emails/mes' },
                    ].map((campo) => (
                      <div key={campo.key}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {campo.label}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={(planSeleccionado[campo.key as keyof ConfiguracionPlan] as number | null) ?? ''}
                          onChange={(e) => {
                            const valor = e.target.value === '' || e.target.value === '0' ? null : parseInt(e.target.value);
                            actualizarCampo(campo.key as keyof ConfiguracionPlan, valor);
                          }}
                          placeholder="Ilimitado"
                          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reportes Avanzados */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={planSeleccionado.reportesAvanzados}
                      onChange={(e) => actualizarCampo('reportesAvanzados', e.target.checked)}
                      className="w-4 h-4 text-[#0490C8] border-gray-300 rounded focus:ring-[#0490C8]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Incluir Reportes Avanzados
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelar}
                    disabled={guardando}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="flex-1 px-4 py-2.5 bg-[#0490C8] hover:bg-[#023664] text-white font-medium rounded-xl transition-all disabled:opacity-50 text-sm"
                  >
                    {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Empleado, EmpleadoSucursal, Sucursal } from '@/interfaces';
import EmpleadosService from '@/services/empleados.service';
import { SucursalesService } from '@/services/sucursales.service';

interface SucursalesEmpleadoModalProps {
  empleado: Empleado | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SucursalesEmpleadoModal({
  empleado,
  isOpen,
  onClose,
  onSuccess
}: SucursalesEmpleadoModalProps) {
  const [sucursalesAsignadas, setSucursalesAsignadas] = useState<EmpleadoSucursal[]>([]);
  const [todasSucursales, setTodasSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>(''); // Solo UNA
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && empleado) {
      cargarDatos();
    }
  }, [isOpen, empleado?.id]);

  const cargarDatos = async () => {
    if (!empleado) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [asignadas, todas] = await Promise.all([
        EmpleadosService.getSucursales(empleado.id),
        SucursalesService.getSucursales()
      ]);

      setSucursalesAsignadas(asignadas);
      // Filtrar solo sucursales activas
      setTodasSucursales(todas.filter(s => s.estado === 'ACTIVA'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar sucursales');
    } finally {
      setLoading(false);
    }
  };

  // Si ya tiene una sucursal, no mostrar disponibles (solo puede tener UNA)
  const sucursalesDisponibles = sucursalesAsignadas.length > 0 
    ? [] 
    : todasSucursales.filter(s => !sucursalesAsignadas.some(sa => sa.sucursalId === s.id));

  const handleAsignar = async () => {
    if (!empleado) return;
    
    if (!sucursalSeleccionada) {
      setError('Selecciona una sucursal');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      await EmpleadosService.asignarSucursales(empleado.id, {
        sucursalIds: [sucursalSeleccionada]
      });

      setSuccessMessage('Empleado asignado a la sucursal exitosamente');
      setSucursalSeleccionada('');
      await cargarDatos();
      onSuccess();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al asignar sucursal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDesasignar = async (sucursalId: string) => {
    if (!empleado) return;
    if (!confirm('¿Deseas desasignar al empleado de esta sucursal?')) return;

    try {
      setSubmitting(true);
      setError(null);

      await EmpleadosService.desasignarSucursal(empleado.id, sucursalId);
      
      setSuccessMessage('Empleado desasignado exitosamente');
      await cargarDatos();
      onSuccess();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al desasignar sucursal');
    } finally {
      setSubmitting(false);
    }
  };

  const seleccionarSucursal = (id: string) => {
    // Si ya está seleccionada, deseleccionar. Si no, seleccionarla.
    setSucursalSeleccionada(prev => prev === id ? '' : id);
  };

  if (!isOpen || !empleado) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestionar Sucursales</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {empleado.nombre} • {empleado.cargo}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              disabled={submitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4" style={{ maxHeight: 'calc(90vh - 140px)', overflowY: 'auto' }}>
          {/* Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2.5">
              <p className="text-sm text-green-700 font-medium">{successMessage}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-[#0490C8]"></div>
              <p className="text-sm text-gray-600 mt-3">Cargando sucursales...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {/* Sucursales Asignadas */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  Sucursales Asignadas ({sucursalesAsignadas.length})
                </h3>
                
                {sucursalesAsignadas.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">Sin sucursales asignadas</p>
                    <p className="text-xs text-gray-500 mt-1">Asigna desde la columna derecha</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {sucursalesAsignadas.map((asignacion) => (
                      <div
                        key={asignacion.sucursalId}
                        className="bg-white border-2 border-gray-200 rounded-xl p-3.5 hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate mb-2">
                              {asignacion.sucursal.nombre}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1 truncate">
                              {asignacion.sucursal.direccion}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Asignado el {new Date(asignacion.asignadoEn).toLocaleDateString('es-ES', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleDesasignar(asignacion.sucursalId)}
                            disabled={submitting}
                            className="flex-shrink-0 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Desasignar sucursal"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Asignar Nuevas Sucursales */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Asignar Sucursal (Solo una)
                  </h3>
                  {sucursalesDisponibles.length > 0 && (
                    <span className="text-xs text-gray-500 font-medium">
                      {sucursalesDisponibles.length} disponibles
                    </span>
                  )}
                </div>

                {sucursalesDisponibles.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">Ya tiene sucursal</p>
                    <p className="text-xs text-gray-500 mt-1">Debe desasignar primero para cambiarla</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                      {sucursalesDisponibles.map((sucursal) => (
                        <label
                          key={sucursal.id}
                          className={`flex items-start gap-2.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                            sucursalSeleccionada === sucursal.id
                              ? 'border-[#0490C8] bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="sucursal"
                            checked={sucursalSeleccionada === sucursal.id}
                            onChange={() => seleccionarSucursal(sucursal.id)}
                            className="mt-0.5 w-4 h-4 text-[#0490C8] border-gray-300 focus:ring-[#0490C8] focus:ring-offset-0"
                            disabled={submitting}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate mb-1.5">
                              {sucursal.nombre}
                            </h4>
                            <p className="text-xs text-gray-600 truncate mb-0.5">{sucursal.direccion}</p>
                            <p className="text-xs text-gray-500">{sucursal.telefono}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={handleAsignar}
                      disabled={submitting || !sucursalSeleccionada}
                      className="w-full px-4 py-2.5 bg-[#0490C8] text-white font-bold rounded-xl hover:bg-[#037ab0] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Asignando...</span>
                        </>
                      ) : (
                        <span>
                          Asignar sucursal
                        </span>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

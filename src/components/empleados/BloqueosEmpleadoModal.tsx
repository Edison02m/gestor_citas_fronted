'use client';

import { useState, useEffect } from 'react';
import { Empleado, BloqueoEmpleado, BloqueoEmpleadoDto } from '@/interfaces';
import EmpleadosService from '@/services/empleados.service';

interface BloqueosEmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  empleado: Empleado | null;
  onUpdate: () => void;
}

export default function BloqueosEmpleadoModal({ isOpen, onClose, empleado, onUpdate }: BloqueosEmpleadoModalProps) {
  const [bloqueos, setBloqueos] = useState<BloqueoEmpleado[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaFin: '',
    motivo: '',
    todoElDia: true,
    horaInicio: '09:00',
    horaFin: '18:00'
  });

  useEffect(() => {
    if (empleado && isOpen) {
      cargarBloqueos();
    }
  }, [empleado, isOpen]);

  const cargarBloqueos = async () => {
    if (!empleado) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await EmpleadosService.getBloqueos(empleado.id);
      setBloqueos(data);
    } catch (error: any) {
      setError('Error al cargar bloqueos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empleado) return;

    setError('');

    // Validaciones
    if (!formData.fechaInicio || !formData.fechaFin) {
      setError('Las fechas son requeridas');
      return;
    }

    if (formData.fechaInicio > formData.fechaFin) {
      setError('La fecha de inicio debe ser menor o igual a la fecha de fin');
      return;
    }

    if (!formData.todoElDia) {
      if (!formData.horaInicio || !formData.horaFin) {
        setError('Las horas son requeridas');
        return;
      }
      if (formData.horaInicio >= formData.horaFin) {
        setError('La hora de inicio debe ser menor que la hora de fin');
        return;
      }
    }

    setSubmitting(true);

    try {
      // Convertir fechas de YYYY-MM-DD a ISO 8601
      const fechaInicioISO = new Date(formData.fechaInicio + 'T00:00:00.000Z').toISOString();
      const fechaFinISO = new Date(formData.fechaFin + 'T23:59:59.999Z').toISOString();

      const bloqueoData: BloqueoEmpleadoDto = {
        fechaInicio: fechaInicioISO,
        fechaFin: fechaFinISO,
        todoElDia: formData.todoElDia,
        ...(formData.motivo && { motivo: formData.motivo }),
        ...(!formData.todoElDia && {
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFin
        })
      };

      await EmpleadosService.createBloqueo(empleado.id, bloqueoData);
      
      // Resetear formulario
      setFormData({
        fechaInicio: '',
        fechaFin: '',
        motivo: '',
        todoElDia: true,
        horaInicio: '09:00',
        horaFin: '18:00'
      });
      
      setMostrarFormulario(false);
      await cargarBloqueos();
      onUpdate();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al crear bloqueo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (bloqueoId: string) => {
    if (!empleado || !confirm('¿Estás seguro de eliminar este bloqueo?')) return;

    try {
      await EmpleadosService.deleteBloqueo(empleado.id, bloqueoId);
      await cargarBloqueos();
      onUpdate();
    } catch (error: any) {
      setError('Error al eliminar bloqueo');
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const esPasado = (fecha: string) => {
    return new Date(fecha) < new Date();
  };

  if (!isOpen || !empleado) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Gestionar Bloqueos</h2>
            <p className="text-xs text-gray-600 mt-0.5">{empleado.nombre}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Botón para mostrar formulario */}
          {!mostrarFormulario && (
            <button
              onClick={() => setMostrarFormulario(true)}
              className="w-full mb-6 px-4 py-3 bg-[#0490C8] text-white font-medium rounded-xl hover:bg-[#037ab0] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar nuevo bloqueo
            </button>
          )}

          {/* Formulario de nuevo bloqueo */}
          {mostrarFormulario && (
            <form onSubmit={handleSubmit} className="mb-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Nuevo Bloqueo</h3>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setError('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fecha inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent text-sm text-gray-900"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fecha fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                      min={formData.fechaInicio || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent text-sm text-gray-900"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Motivo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Motivo (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    placeholder="Ej: Vacaciones, Enfermedad, Capacitación"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                    disabled={submitting}
                  />
                </div>

                {/* Todo el día */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Bloquear todo el día</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, todoElDia: !formData.todoElDia })}
                    disabled={submitting}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.todoElDia ? 'bg-[#0490C8]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.todoElDia ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Horas específicas */}
                {!formData.todoElDia && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Hora inicio
                      </label>
                      <input
                        type="time"
                        value={formData.horaInicio}
                        onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent text-sm text-gray-900"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Hora fin
                      </label>
                      <input
                        type="time"
                        value={formData.horaFin}
                        onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent text-sm text-gray-900"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                )}

                {/* Botones del formulario */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setError('');
                    }}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-[#0490C8] text-white font-medium rounded-xl hover:bg-[#037ab0] transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Crear bloqueo'
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Lista de bloqueos */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0490C8] mx-auto"></div>
              <p className="text-sm text-gray-600 mt-4">Cargando bloqueos...</p>
            </div>
          ) : bloqueos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">No hay bloqueos</h3>
              <p className="text-sm text-gray-600">
                Agrega un bloqueo para marcar períodos en los que el empleado no estará disponible
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bloqueos.map((bloqueo) => {
                const pasado = esPasado(bloqueo.fechaFin);
                
                return (
                  <div 
                    key={bloqueo.id} 
                    className={`p-4 rounded-xl border ${
                      pasado 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <svg 
                            className={`w-4 h-4 ${pasado ? 'text-gray-400' : 'text-red-500'}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          <span className={`font-semibold text-sm ${pasado ? 'text-gray-600' : 'text-gray-900'}`}>
                            {formatearFecha(bloqueo.fechaInicio)} - {formatearFecha(bloqueo.fechaFin)}
                          </span>
                          {pasado && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full font-medium">
                              Pasado
                            </span>
                          )}
                        </div>
                        
                        {bloqueo.motivo && (
                          <p className={`text-sm mb-2 ${pasado ? 'text-gray-500' : 'text-gray-700'}`}>
                            {bloqueo.motivo}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs">
                          <span className={pasado ? 'text-gray-500' : 'text-gray-600'}>
                            {bloqueo.todoElDia ? (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Todo el día
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {bloqueo.horaInicio} - {bloqueo.horaFin}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleEliminar(bloqueo.id)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Eliminar bloqueo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

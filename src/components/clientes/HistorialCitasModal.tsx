'use client';

import { useState, useEffect } from 'react';
import { Cliente, Cita, EstadoCita } from '@/interfaces';
import { CitasService } from '@/services/citas.service';
import { formatDate } from '@/utils/format';

interface HistorialCitasModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
}

export default function HistorialCitasModal({ isOpen, onClose, cliente }: HistorialCitasModalProps) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // ✅ OPTIMIZACIÓN: Resetear estado al abrir el modal
  useEffect(() => {
    if (isOpen && cliente) {
      setPage(1);
      setError(null);
      cargarHistorial(1);
    }
    
    // Cleanup al cerrar
    if (!isOpen) {
      setCitas([]);
      setPage(1);
      setTotal(0);
      setTotalPages(1);
      setError(null);
    }
  }, [isOpen, cliente]);

  // ✅ OPTIMIZACIÓN: Efecto separado para cambios de página
  useEffect(() => {
    if (isOpen && cliente && page > 1) {
      cargarHistorial(page);
    }
  }, [page]);

  const cargarHistorial = async (currentPage: number = page) => {
    if (!cliente) return;

    try {
      setLoading(true);
      setError(null);
      const response = await CitasService.obtenerHistorialCliente(cliente.id, currentPage, 10);
      setCitas(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error('Error al cargar historial:', err);
      setError(err.response?.data?.message || 'Error al cargar el historial de citas');
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handler para cerrar y limpiar estado
  const handleClose = () => {
    onClose();
  };

  const getEstadoBadgeClass = (estado: EstadoCita) => {
    const classes: Record<EstadoCita, string> = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      CONFIRMADA: 'bg-blue-100 text-blue-800',
      COMPLETADA: 'bg-green-100 text-green-800',
      CANCELADA: 'bg-red-100 text-red-800',
      NO_ASISTIO: 'bg-gray-100 text-gray-800',
    };
    return classes[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoTexto = (estado: EstadoCita) => {
    const textos: Record<EstadoCita, string> = {
      PENDIENTE: 'Pendiente',
      CONFIRMADA: 'Confirmada',
      COMPLETADA: 'Completada',
      CANCELADA: 'Cancelada',
      NO_ASISTIO: 'No asistió',
    };
    return textos[estado] || estado;
  };

  if (!isOpen || !cliente) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Historial de Citas</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
              {cliente.nombre} • {total} cita{total !== 1 ? 's' : ''} registrada{total !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[#0490C8]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Error al cargar historial</h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => cargarHistorial(page)}
                className="px-4 py-2 bg-[#0490C8] hover:bg-[#023664] text-white font-medium rounded-xl transition-all text-sm"
              >
                Reintentar
              </button>
            </div>
          ) : citas.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Sin historial</h3>
              <p className="text-sm text-gray-500">Este cliente aún no tiene citas registradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {citas.map((cita) => (
                <div key={cita.id} className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200 hover:border-[#0490C8] transition-all">
                  {/* Info Principal */}
                  <div className="space-y-3">
                    {/* Fila 1: Fecha, Hora y Estado - Responsive */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {/* Fecha */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {formatDate(cita.fecha)}
                        </span>
                      </div>

                      {/* Separador visual en desktop */}
                      <span className="hidden sm:inline text-gray-300">•</span>

                      {/* Hora */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                          {cita.horaInicio} - {cita.horaFin}
                        </span>
                      </div>

                      {/* Estado - Full width en móvil, inline en desktop */}
                      <div className="w-full sm:w-auto sm:ml-auto">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoBadgeClass(cita.estado)}`}>
                          {getEstadoTexto(cita.estado)}
                        </span>
                      </div>
                    </div>

                    {/* Fila 2: Servicio */}
                    {cita.servicio && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cita.servicio.color }}
                        />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {cita.servicio.nombre}
                        </span>
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          • ${cita.servicio.precio}
                        </span>
                      </div>
                    )}

                    {/* Fila 3: Empleado y Sucursal - Stack en móvil, inline en tablet+ */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                      {cita.empleado && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="truncate">{cita.empleado.nombre}</span>
                        </div>
                      )}
                      {cita.sucursal && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="truncate">{cita.sucursal.nombre}</span>
                        </div>
                      )}
                    </div>

                    {/* Fila 4: Notas (si existen) */}
                    {cita.notas && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600 italic line-clamp-2">"{cita.notas}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con Paginación */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
            <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
              Página {page} de {totalPages}
            </div>
            <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">← Anterior</span>
                <span className="sm:hidden">← Ant.</span>
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Siguiente →</span>
                <span className="sm:hidden">Sig. →</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer sin paginación */}
        {totalPages <= 1 && !loading && !error && (
          <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex justify-end flex-shrink-0">
            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2 bg-[#0490C8] hover:bg-[#023664] text-white font-medium rounded-xl transition-all text-sm"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

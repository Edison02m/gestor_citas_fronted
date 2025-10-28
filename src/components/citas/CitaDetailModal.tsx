'use client';

import { useState } from 'react';
import { Cita } from '@/interfaces';
import { formatDate, toDate } from '@/utils/format';
import EditarCitaModal from './EditarCitaModal';

interface CitaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cita: Cita | null;
  onCitaUpdated?: () => void;
}

export default function CitaDetailModal({ isOpen, onClose, cita, onCitaUpdated }: CitaDetailModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    onCitaUpdated?.();
  };

  if (!isOpen || !cita) return null;

  const getEstadoColor = (estado: string) => {
    switch (estado.toUpperCase()) {
      case 'CONFIRMADA':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CANCELADA':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'COMPLETADA':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-3 border-b border-gray-200 bg-white">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-gray-900">Detalle de Cita</h2>
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${getEstadoColor(cita.estado)}`}>
                {cita.estado}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {formatDate(toDate(cita.fecha))} • {cita.horaInicio} - {cita.horaFin}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-xl"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Columna Izquierda */}
            <div className="space-y-3">
              {/* Servicio */}
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: `${cita.servicio?.color || '#0490C8'}20`,
                    }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cita.servicio?.color || '#0490C8' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-0.5">Servicio</p>
                    <h3 className="text-sm font-bold text-gray-900 truncate">{cita.servicio?.nombre}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-700">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{cita.servicio?.duracion}min</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-700">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">${cita.servicio?.precio}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cliente */}
              <div className="bg-white rounded-xl border border-gray-200 p-3">
                <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-2">Cliente</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{cita.cliente?.nombre}</p>
                    <p className="text-xs text-gray-600 truncate">{cita.cliente?.email}</p>
                  </div>
                </div>
                {cita.cliente?.telefono && (
                  <div className="flex items-center gap-2 mt-2 pl-9">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${cita.cliente.telefono}`} className="text-xs text-gray-700 hover:text-[#0490C8] font-medium">
                      {cita.cliente.telefono}
                    </a>
                  </div>
                )}
                {cita.cliente?.cedula && (
                  <div className="flex items-center gap-2 mt-1 pl-9">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <span className="text-xs text-gray-700 font-medium">Cédula: {cita.cliente.cedula}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-3">
              {/* Empleado */}
              {cita.empleado && (
                <div className="bg-white rounded-xl border border-gray-200 p-3">
                  <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-2">Profesional</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{cita.empleado.nombre}</p>
                      {cita.empleado.cargo && (
                        <p className="text-xs text-gray-600">{cita.empleado.cargo}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sucursal */}
              {cita.sucursal && (
                <div className="bg-white rounded-xl border border-gray-200 p-3">
                  <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-2">Sucursal</p>
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{cita.sucursal.nombre}</p>
                      {cita.sucursal.direccion && (
                        <p className="text-xs text-gray-600 truncate">{cita.sucursal.direccion}</p>
                      )}
                      {cita.sucursal.telefono && (
                        <p className="text-xs text-gray-600 mt-0.5">Tel: {cita.sucursal.telefono}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          {cita.notas && (
            <div className="mt-4 bg-amber-50 rounded-xl border border-amber-200 p-3">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1">Notas</p>
                  <p className="text-xs text-amber-900 whitespace-pre-wrap">{cita.notas}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-3 bg-gray-50 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-white hover:border-gray-400 transition-all text-xs"
          >
            Cerrar
          </button>
          <button
            onClick={handleEditClick}
            className="flex-1 px-3 py-2 bg-[#0490C8] hover:bg-[#037aa8] text-white font-semibold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar Cita
          </button>
        </div>
      </div>

      {/* Modal de Edición */}
      <EditarCitaModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        cita={cita}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

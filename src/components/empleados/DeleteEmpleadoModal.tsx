'use client';

import { Empleado } from '@/interfaces';

interface DeleteEmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  empleado: Empleado | null;
  loading?: boolean;
  error?: string;
}

export default function DeleteEmpleadoModal({
  isOpen,
  onClose,
  onConfirm,
  empleado,
  loading,
  error
}: DeleteEmpleadoModalProps) {
  if (!isOpen || !empleado) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">Eliminar Empleado</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Warning */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Esta acción no se puede deshacer
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Al eliminar este empleado, se perderá toda la información asociada.
                </p>
              </div>
            </div>
          </div>

          {/* Empleado Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: empleado.color }}
              >
                {empleado.foto ? (
                  <img 
                    src={empleado.foto} 
                    alt={empleado.nombre} 
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  empleado.nombre.charAt(0).toUpperCase()
                )}
              </div>
              <div className="text-sm flex-1">
                <p className="text-gray-900 font-semibold">{empleado.nombre}</p>
                <p className="text-gray-600 text-xs mt-0.5">{empleado.cargo}</p>
              </div>
            </div>

            {empleado.email && (
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">{empleado.email}</p>
                </div>
              </div>
            )}

            {empleado.telefono && (
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">{empleado.telefono}</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-900">No se puede eliminar el empleado</p>
                  <p className="text-xs text-gray-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#0490C8] hover:bg-[#023664] text-white rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

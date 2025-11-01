'use client';

import { useState, useEffect } from 'react';
import { Servicio, Sucursal } from '@/interfaces';
import { SucursalesService } from '@/services/sucursales.service';
import { ServiciosService } from '@/services/servicios.service';

interface SucursalesServicioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  servicio: Servicio | null;
  loading?: boolean;
}

export default function SucursalesServicioModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  servicio, 
  loading 
}: SucursalesServicioModalProps) {
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState<Sucursal[]>([]);
  const [sucursalesAsignadas, setSucursalesAsignadas] = useState<string[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [errors, setErrors] = useState<string>('');

  useEffect(() => {
    if (isOpen && servicio) {
      loadSucursales();
      loadSucursalesAsignadas();
    }
  }, [isOpen, servicio]);

  const loadSucursales = async () => {
    try {
      setLoadingSucursales(true);
      const data = await SucursalesService.getSucursales();
      setSucursalesDisponibles(data.filter(s => s.estado === 'ACTIVA'));
    } catch (error) {
      // Log removido
    } finally {
      setLoadingSucursales(false);
    }
  };

  const loadSucursalesAsignadas = () => {
    if (!servicio?.sucursales) return;
    const asignadas = servicio.sucursales.map(s => s.sucursalId);
    setSucursalesAsignadas(asignadas);
  };

  const handleToggleSucursal = (sucursalId: string) => {
    setSucursalesAsignadas(prev => 
      prev.includes(sucursalId)
        ? prev.filter(id => id !== sucursalId)
        : [...prev, sucursalId]
    );
  };

  const handleSubmit = async () => {
    if (!servicio) return;

    try {
      setSavingChanges(true);
      setErrors('');

      await ServiciosService.asignarSucursales(servicio.id, {
        sucursales: sucursalesAsignadas
      });
      
      await onSubmit();
      onClose(); // Cerrar el modal después de guardar exitosamente
    } catch (error: any) {
      let errorMessage = 'Error al asignar sucursales';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors(errorMessage);
    } finally {
      setSavingChanges(false);
    }
  };

  if (!isOpen || !servicio) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sucursales</h2>
              <p className="text-sm text-gray-600 mt-0.5">{servicio.nombre}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              disabled={savingChanges}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4" style={{ maxHeight: 'calc(90vh - 140px)', overflowY: 'auto' }}>
          {/* Error Message */}
          {errors && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5">
              <p className="text-sm text-red-700 font-medium">{errors}</p>
            </div>
          )}

          {loadingSucursales ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-[#0490C8]"></div>
              <p className="text-sm text-gray-600 mt-3">Cargando sucursales...</p>
            </div>
          ) : sucursalesDisponibles.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">No hay sucursales activas</p>
              <p className="text-xs text-gray-500 mt-1">Crea una sucursal activa primero</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-600">
                  Selecciona las sucursales para este servicio
                </p>
                <span className="text-xs text-gray-500 font-medium">
                  {sucursalesAsignadas.length} de {sucursalesDisponibles.length}
                </span>
              </div>

              <div className="space-y-2">
                {sucursalesDisponibles.map((sucursal) => (
                  <div
                    key={sucursal.id}
                    className={`border-2 rounded-xl p-3 transition-all ${
                      sucursalesAsignadas.includes(sucursal.id)
                        ? 'border-[#0490C8] bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sucursalesAsignadas.includes(sucursal.id)}
                        onChange={() => handleToggleSucursal(sucursal.id)}
                        className="mt-0.5 w-4 h-4 text-[#0490C8] border-gray-300 rounded focus:ring-[#0490C8]"
                        disabled={savingChanges}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {sucursal.nombre}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">{sucursal.direccion}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={savingChanges}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={savingChanges || sucursalesDisponibles.length === 0}
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#0490C8] hover:bg-[#023664] text-white rounded-xl transition-all disabled:opacity-50"
            >
              {savingChanges ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

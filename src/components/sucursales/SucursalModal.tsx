'use client';

import { useState, useEffect } from 'react';
import { Sucursal, CrearSucursalDto, ActualizarSucursalDto, HorarioDto } from '@/interfaces';

interface SucursalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearSucursalDto | ActualizarSucursalDto) => Promise<void>;
  sucursal?: Sucursal | null;
  loading?: boolean;
}

const DIAS_SEMANA_COMPLETO = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export default function SucursalModal({ isOpen, onClose, onSubmit, sucursal, loading }: SucursalModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    telefono: '',
    email: '',
    googleMapsUrl: '',
    estado: 'ACTIVA' as 'ACTIVA' | 'INACTIVA'
  });

  const [errors, setErrors] = useState<string>('');

  useEffect(() => {
    if (sucursal) {
      setFormData({
        nombre: sucursal.nombre,
        direccion: sucursal.direccion,
        ciudad: sucursal.ciudad || '',
        provincia: sucursal.provincia || '',
        telefono: sucursal.telefono,
        email: sucursal.email || '',
        googleMapsUrl: sucursal.googleMapsUrl || '',
        estado: sucursal.estado || 'ACTIVA'
      });
    } else {
      setFormData({
        nombre: '',
        direccion: '',
        ciudad: '',
        provincia: '',
        telefono: '',
        email: '',
        googleMapsUrl: '',
        estado: 'ACTIVA'
      });
    }
    setErrors('');
  }, [sucursal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      setErrors('El nombre de la sucursal es requerido');
      return;
    }

    if (!formData.direccion.trim()) {
      setErrors('La dirección es requerida');
      return;
    }

    if (!formData.telefono.trim()) {
      setErrors('El teléfono es requerido');
      return;
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrors('El formato del email no es válido');
      return;
    }

    try {
      const dataToSend: any = {
        nombre: formData.nombre,
        direccion: formData.direccion,
        telefono: formData.telefono
      };

      if (formData.ciudad) dataToSend.ciudad = formData.ciudad;
      if (formData.provincia) dataToSend.provincia = formData.provincia;
      if (formData.email) dataToSend.email = formData.email;
      if (formData.googleMapsUrl) dataToSend.googleMapsUrl = formData.googleMapsUrl;

      // Solo incluir estado si es edición
      if (sucursal) {
        dataToSend.estado = formData.estado;
      }

      // Si es creación, agregar horarios por defecto (todos cerrados)
      if (!sucursal) {
        dataToSend.horarios = Array.from({ length: 7 }, (_, i) => ({
          diaSemana: i,
          abierto: false,
          horaApertura: null,
          horaCierre: null,
          tieneDescanso: false,
          descansoInicio: null,
          descansoFin: null
        }));
      }

      await onSubmit(dataToSend);
    } catch (error: any) {
      // Mostrar error más detallado y amigable
      let errorMessage = 'Error al guardar la sucursal';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Si hay errores de validación específicos
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        
        // Convertir errores de validación en mensaje legible
        if (Array.isArray(validationErrors)) {
          errorMessage = validationErrors.join(', ');
        } else if (typeof validationErrors === 'object') {
          errorMessage = Object.values(validationErrors).join(', ');
        }
      }
      
      setErrors(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {sucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre de la sucursal *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
              placeholder="Ej: Sucursal Centro"
              disabled={loading}
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Dirección *
            </label>
            <input
              type="text"
              required
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
              placeholder="Ej: Av. Principal 123"
              disabled={loading}
            />
          </div>

          {/* Ciudad y Provincia */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ciudad (opcional)
              </label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
                placeholder="Ej: Quito"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Provincia (opcional)
              </label>
              <input
                type="text"
                value={formData.provincia}
                onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
                placeholder="Ej: Pichincha"
                disabled={loading}
              />
            </div>
          </div>

          {/* Teléfono y Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Teléfono *
              </label>
              <input
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
                placeholder="0987654321"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email (opcional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
                placeholder="sucursal@ejemplo.com"
                disabled={loading}
              />
            </div>
          </div>

          {/* Google Maps URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              URL de Google Maps (opcional)
            </label>
            <input
              type="url"
              value={formData.googleMapsUrl}
              onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
              placeholder="https://maps.google.com/..."
              disabled={loading}
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Puedes copiar el enlace desde Google Maps para mostrar la ubicación exacta
            </p>
          </div>

          {/* Estado - Solo al editar */}
          {sucursal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Estado
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="ACTIVA"
                    checked={formData.estado === 'ACTIVA'}
                    onChange={(e) => setFormData({ ...formData, estado: 'ACTIVA' })}
                    className="w-4 h-4 text-[#0490C8] focus:ring-[#0490C8]"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700">Activa</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="INACTIVA"
                    checked={formData.estado === 'INACTIVA'}
                    onChange={(e) => setFormData({ ...formData, estado: 'INACTIVA' })}
                    className="w-4 h-4 text-[#0490C8] focus:ring-[#0490C8]"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700">Inactiva</span>
                </label>
              </div>
            </div>
          )}

          {!sucursal && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Nota sobre horarios:</p>
                  <p>Los horarios se configurarán como "cerrados" por defecto. Podrás editarlos después de crear la sucursal.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">
              {errors}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#0490C8] hover:bg-[#023664] text-white font-medium rounded-xl transition-all disabled:opacity-50 text-sm"
            >
              {loading ? 'Guardando...' : (sucursal ? 'Actualizar' : 'Crear Sucursal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

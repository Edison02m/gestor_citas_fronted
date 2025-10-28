'use client';

import { useState, useEffect } from 'react';
import { Servicio, CreateServicioDto, UpdateServicioDto, Sucursal } from '@/interfaces';
import { SucursalesService } from '@/services/sucursales.service';

interface ServicioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateServicioDto | UpdateServicioDto) => Promise<void>;
  servicio?: Servicio | null;
  loading?: boolean;
}

export default function ServicioModal({ isOpen, onClose, onSubmit, servicio, loading }: ServicioModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion: '',
    precio: '',
    foto: '',
    color: '#3b82f6',
    estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
    sucursales: [] as string[]
  });

  const [sucursalesDisponibles, setSucursalesDisponibles] = useState<Sucursal[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [errors, setErrors] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadSucursales();
    }
  }, [isOpen]);

  useEffect(() => {
    if (servicio) {
      setFormData({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion,
        duracion: servicio.duracion.toString(),
        precio: servicio.precio.toString(),
        foto: servicio.foto || '',
        color: servicio.color || '#3b82f6',
        estado: servicio.estado || 'ACTIVO',
        sucursales: servicio.sucursales?.map(s => s.sucursalId) || []
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        duracion: '',
        precio: '',
        foto: '',
        color: '#3b82f6',
        estado: 'ACTIVO',
        sucursales: []
      });
    }
    setErrors('');
  }, [servicio, isOpen]);

  const loadSucursales = async () => {
    try {
      setLoadingSucursales(true);
      const data = await SucursalesService.getSucursales();
      setSucursalesDisponibles(data.filter(s => s.estado === 'ACTIVA'));
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    } finally {
      setLoadingSucursales(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');

    // Validaciones
    if (!formData.nombre.trim()) {
      setErrors('El nombre del servicio es requerido');
      return;
    }

    if (!formData.descripcion.trim()) {
      setErrors('La descripción es requerida');
      return;
    }

    const duracion = parseInt(formData.duracion);
    if (!formData.duracion || isNaN(duracion) || duracion <= 0) {
      setErrors('La duración debe ser mayor a 0 minutos');
      return;
    }

    const precio = parseFloat(formData.precio);
    if (!formData.precio || isNaN(precio) || precio < 0) {
      setErrors('El precio debe ser mayor o igual a 0');
      return;
    }

    if (!servicio && formData.sucursales.length === 0) {
      setErrors('Debes seleccionar al menos una sucursal');
      return;
    }

    try {
      const dataToSend: any = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        duracion: duracion,
        precio: precio,
        color: formData.color
      };

      if (formData.foto) {
        dataToSend.foto = formData.foto;
      }

      // Solo incluir estado si es edición
      if (servicio) {
        dataToSend.estado = formData.estado;
      } else {
        // Si es creación, incluir sucursales
        dataToSend.sucursales = formData.sucursales;
      }

      await onSubmit(dataToSend);
    } catch (error: any) {
      let errorMessage = 'Error al guardar el servicio';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        
        if (Array.isArray(validationErrors)) {
          errorMessage = validationErrors.join(', ');
        } else if (typeof validationErrors === 'object') {
          errorMessage = Object.values(validationErrors).join(', ');
        }
      }
      
      setErrors(errorMessage);
    }
  };

  const toggleSucursal = (sucursalId: string) => {
    setFormData(prev => ({
      ...prev,
      sucursales: prev.sucursales.includes(sucursalId)
        ? prev.sucursales.filter(id => id !== sucursalId)
        : [...prev.sucursales, sucursalId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full shadow-xl" style={{ maxWidth: servicio ? '600px' : '900px', maxHeight: '95vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {servicio ? 'Editar Servicio' : 'Nuevo Servicio'}
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
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4" style={{ maxHeight: 'calc(95vh - 140px)', overflowY: 'auto' }}>
            {servicio ? (
              // Layout 1 columna para edición
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del servicio</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                    placeholder="Ej: Corte de cabello"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white resize-none"
                    placeholder="Describe el servicio..."
                    disabled={loading}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Duración (min)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duracion}
                      onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                      placeholder="30"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Precio (USD)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                      placeholder="500.00"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">URL de foto (opcional)</label>
                  <input
                    type="url"
                    value={formData.foto}
                    onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                    placeholder="https://..."
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 px-1 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 bg-white cursor-pointer"
                      disabled={loading}
                    />
                    <div 
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 font-mono"
                      style={{ backgroundColor: formData.color + '20' }}
                    >
                      {formData.color}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Estado</label>
                  <div className="flex gap-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="ACTIVO"
                        checked={formData.estado === 'ACTIVO'}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'ACTIVO' | 'INACTIVO' })}
                        className="w-4 h-4 text-[#0490C8] focus:ring-[#0490C8]"
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-700">Activo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="INACTIVO"
                        checked={formData.estado === 'INACTIVO'}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'ACTIVO' | 'INACTIVO' })}
                        className="w-4 h-4 text-[#0490C8] focus:ring-[#0490C8]"
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-700">Inactivo</span>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              // Layout 2 columnas para creación
              <div className="grid grid-cols-2 gap-6">
                {/* Columna Izquierda: Datos del servicio */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nombre del Servicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                      placeholder="Ej: Corte de cabello"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white resize-none"
                      placeholder="Describe el servicio..."
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Duración (min) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.duracion}
                        onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                        placeholder="30"
                        disabled={loading}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Precio (USD) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.precio}
                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                        placeholder="500.00"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      URL de Foto (opcional)
                    </label>
                    <input
                      type="url"
                      value={formData.foto}
                      onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                      placeholder="https://..."
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-12 h-10 px-1 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 bg-white cursor-pointer"
                        disabled={loading}
                      />
                      <div 
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 font-mono"
                        style={{ backgroundColor: formData.color + '20' }}
                      >
                        {formData.color}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Sucursales */}
                <div className="border-l border-gray-200 pl-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-medium text-gray-600">
                      ASIGNAR A SUCURSALES <span className="text-red-500">*</span>
                    </label>
                    {formData.sucursales.length > 0 && (
                      <span className="px-2 py-0.5 bg-[#0490C8] text-white text-xs font-semibold rounded-full">
                        {formData.sucursales.length}
                      </span>
                    )}
                  </div>
                  
                  {loadingSucursales ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#0490C8]"></div>
                    </div>
                  ) : sucursalesDisponibles.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
                      <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium">No hay sucursales activas</p>
                      <p className="text-xs text-gray-500 mt-1">Crea una sucursal activa primero</p>
                    </div>
                  ) : (
                    <div className="space-y-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {sucursalesDisponibles.map((sucursal) => (
                        <label
                          key={sucursal.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                            formData.sucursales.includes(sucursal.id)
                              ? 'bg-blue-50 border-2 border-[#0490C8] shadow-sm'
                              : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300 hover:bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.sucursales.includes(sucursal.id)}
                            onChange={() => toggleSucursal(sucursal.id)}
                            className="mt-0.5 w-4 h-4 text-[#0490C8] border-gray-300 rounded focus:ring-[#0490C8] focus:ring-offset-0"
                            disabled={loading}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="text-sm font-semibold text-gray-900 truncate">{sucursal.nombre}</p>
                              {sucursal.estado === 'ACTIVA' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{sucursal.direccion}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-3 flex items-start gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#0490C8] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Selecciona las sucursales donde estará disponible este servicio</span>
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {errors && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{errors}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 text-sm">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#0490C8] text-white font-medium rounded-xl hover:bg-[#037ab0] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                servicio ? 'Guardar cambios' : 'Crear servicio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

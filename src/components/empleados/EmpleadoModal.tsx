'use client';

import { useState, useEffect } from 'react';
import { Empleado, EmpleadoDto, EmpleadoUpdateDto, Sucursal } from '@/interfaces';
import { SucursalesService } from '@/services/sucursales.service';

interface EmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmpleadoDto | EmpleadoUpdateDto, sucursalIds?: string[]) => Promise<void>;
  empleado?: Empleado | null;
  loading?: boolean;
}

const COLORES_PREDEFINIDOS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

export default function EmpleadoModal({ isOpen, onClose, onSubmit, empleado, loading }: EmpleadoModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: '',
    telefono: '',
    email: '',
    foto: '',
    color: '#3b82f6',
    estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO'
  });

  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>(''); // Solo UNA sucursal
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [errors, setErrors] = useState<string>('');

  // Cargar sucursales al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarSucursales();
    }
  }, [isOpen]);

  const cargarSucursales = async () => {
    try {
      setLoadingSucursales(true);
      const data = await SucursalesService.getSucursales();
      // Filtrar solo sucursales activas
      setSucursales(data.filter(s => s.estado === 'ACTIVA'));
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    } finally {
      setLoadingSucursales(false);
    }
  };

  useEffect(() => {
    if (empleado) {
      setFormData({
        nombre: empleado.nombre,
        cargo: empleado.cargo,
        telefono: empleado.telefono,
        email: empleado.email,
        foto: empleado.foto || '',
        color: empleado.color,
        estado: empleado.estado
      });
      setSucursalSeleccionada(''); // No pre-seleccionamos en edición
    } else {
      setFormData({
        nombre: '',
        cargo: '',
        telefono: '',
        email: '',
        foto: '',
        color: '#3b82f6',
        estado: 'ACTIVO'
      });
      setSucursalSeleccionada('');
    }
    setErrors('');
  }, [empleado, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');

    // Validaciones
    if (!formData.nombre.trim()) {
      setErrors('El nombre del empleado es requerido');
      return;
    }

    if (!formData.cargo.trim()) {
      setErrors('El cargo es requerido');
      return;
    }

    if (!formData.telefono.trim()) {
      setErrors('El teléfono es requerido');
      return;
    }

    if (formData.telefono.replace(/\D/g, '').length < 7) {
      setErrors('El teléfono debe tener al menos 7 dígitos');
      return;
    }

    if (!formData.email.trim()) {
      setErrors('El email es requerido');
      return;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrors('El formato del email no es válido');
      return;
    }

    // Validar que se seleccione una sucursal al crear (no al editar)
    if (!empleado && !sucursalSeleccionada) {
      setErrors('Debes seleccionar una sucursal para el empleado');
      return;
    }

    try {
      const dataToSend: any = {
        nombre: formData.nombre.trim(),
        cargo: formData.cargo.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
        color: formData.color
      };

      // Solo incluir foto si tiene valor
      if (formData.foto && formData.foto.trim()) {
        dataToSend.foto = formData.foto.trim();
      } else if (empleado) {
        dataToSend.foto = null;
      }

      // Solo incluir estado si es edición
      if (empleado) {
        dataToSend.estado = formData.estado;
      }

      await onSubmit(dataToSend, sucursalSeleccionada ? [sucursalSeleccionada] : []);
    } catch (error: any) {
      let errorMessage = 'Error al guardar el empleado';
      
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

  const seleccionarSucursal = (id: string) => {
    // Si ya está seleccionada, deseleccionar. Si no, seleccionarla.
    setSucursalSeleccionada(prev => prev === id ? '' : id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full shadow-xl" style={{ maxWidth: empleado ? '600px' : '900px', maxHeight: '95vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {empleado ? 'Editar Empleado' : 'Nuevo Empleado'}
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
            {empleado ? (
              // Layout 1 columna para edición
              <div className="space-y-4">
                {/* Avatar y nombre en fila */}
                <div className="flex items-start gap-4">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                    style={{ backgroundColor: formData.color }}
                  >
                    {formData.foto && formData.foto.trim() ? (
                      <img 
                        src={formData.foto} 
                        alt="Preview" 
                        className="w-full h-full rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      formData.nombre.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo</label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                        placeholder="Nombre completo"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cargo</label>
                      <input
                        type="text"
                        value={formData.cargo}
                        onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                        placeholder="Cargo"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Teléfono y Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                      placeholder="0987654321"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                      placeholder="email@ejemplo.com"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Foto */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">URL de foto (opcional)</label>
                  <input
                    type="url"
                    value={formData.foto}
                    onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                    placeholder="https://ejemplo.com/foto.jpg"
                    disabled={loading}
                  />
                </div>

                {/* Color y Estado */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Color identificador</label>
                    <div className="flex flex-wrap gap-1.5">
                      {COLORES_PREDEFINIDOS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-8 h-8 rounded-lg transition-all ${
                            formData.color === color 
                              ? 'ring-2 ring-offset-2 ring-[#0490C8] scale-110' 
                              : 'hover:scale-105 ring-1 ring-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                          disabled={loading}
                          title={color}
                        />
                      ))}
                      <div className="relative">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200"
                          disabled={loading}
                          title="Color personalizado"
                        />
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
              </div>
            ) : (
              // Layout 2 columnas para creación
              <div className="grid grid-cols-2 gap-6">
                {/* Columna Izquierda: Datos del empleado */}
                <div className="space-y-3.5">
                  {/* Avatar y Color en una fila compacta */}
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white flex-shrink-0"
                      style={{ backgroundColor: formData.color }}
                    >
                      {formData.foto && formData.foto.trim() ? (
                        <img 
                          src={formData.foto} 
                          alt="Preview" 
                          className="w-full h-full rounded-xl object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        formData.nombre.charAt(0).toUpperCase() || '?'
                      )}
                    </div>

                    {/* Selector de color compacto */}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Color identificador</label>
                      <div className="flex items-center gap-1.5">
                        {COLORES_PREDEFINIDOS.slice(0, 5).map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, color })}
                            className={`w-7 h-7 rounded-lg transition-all relative flex-shrink-0 ${
                              formData.color === color 
                                ? 'ring-2 ring-offset-1 ring-[#0490C8] shadow-md' 
                                : 'hover:scale-110 ring-1 ring-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                            disabled={loading}
                            title={color}
                          >
                            {formData.color === color && (
                              <svg className="w-3 h-3 text-white absolute inset-0 m-auto drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-7 h-7 rounded-lg cursor-pointer border-2 border-gray-200 hover:border-[#0490C8] transition-colors flex-shrink-0"
                          disabled={loading}
                          title="Color personalizado"
                        />
                        <span className="text-[10px] text-gray-500 font-mono ml-1">{formData.color.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                      placeholder="Ej: Juan Pérez"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Cargo / Puesto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                      placeholder="Ej: Estilista, Barbero"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                        placeholder="0987654321"
                        disabled={loading}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 text-sm bg-white"
                        placeholder="email@ejemplo.com"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      URL de foto (opcional)
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
                </div>

                {/* Columna Derecha: Sucursales */}
                <div className="border-l border-gray-200 pl-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-medium text-gray-600">
                      ASIGNAR A SUCURSAL <span className="text-red-500">*</span> (SOLO UNA)
                    </label>
                    {sucursalSeleccionada && (
                      <span className="px-2 py-0.5 bg-[#0490C8] text-white text-xs font-semibold rounded-full">
                        1
                      </span>
                    )}
                  </div>
                  
                  {loadingSucursales ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#0490C8]"></div>
                    </div>
                  ) : sucursales.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
                      <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium">No hay sucursales activas</p>
                      <p className="text-xs text-gray-500 mt-1">Crea una sucursal activa primero</p>
                    </div>
                  ) : (
                    <div className="space-y-2" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                      {sucursales.map((sucursal) => (
                        <label
                          key={sucursal.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                            sucursalSeleccionada === sucursal.id
                              ? 'bg-blue-50 border-2 border-[#0490C8] shadow-sm'
                              : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300 hover:bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="sucursal"
                            checked={sucursalSeleccionada === sucursal.id}
                            onChange={() => seleccionarSucursal(sucursal.id)}
                            className="mt-0.5 w-4 h-4 text-[#0490C8] border-gray-300 focus:ring-[#0490C8] focus:ring-offset-0"
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
                    <span>Podrás configurar horarios de trabajo después de crear el empleado</span>
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
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#0490C8] text-white font-medium rounded-xl hover:bg-[#037ab0] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                empleado ? 'Guardar cambios' : 'Crear empleado'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

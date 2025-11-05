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

export default function EmpleadoModal({ isOpen, onClose, onSubmit, empleado, loading }: EmpleadoModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: '',
    telefono: '',
    email: '',
    foto: '',
    estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO'
  });

  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>(''); // Solo UNA sucursal
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [errors, setErrors] = useState<string>('');
  const [codigoPais, setCodigoPais] = useState('+593'); // Ecuador por defecto
  const [showCodigoPaisDropdown, setShowCodigoPaisDropdown] = useState(false);

  // Lista de códigos de países más comunes
  const codigosPaises = [
    { codigo: '+593', pais: 'Ecuador', bandera: '🇪🇨' },
    { codigo: '+54', pais: 'Argentina', bandera: '🇦🇷' },
    { codigo: '+591', pais: 'Bolivia', bandera: '🇧🇴' },
    { codigo: '+55', pais: 'Brasil', bandera: '🇧🇷' },
    { codigo: '+56', pais: 'Chile', bandera: '🇨🇱' },
    { codigo: '+57', pais: 'Colombia', bandera: '🇨🇴' },
    { codigo: '+506', pais: 'Costa Rica', bandera: '🇨🇷' },
    { codigo: '+53', pais: 'Cuba', bandera: '🇨🇺' },
    { codigo: '+34', pais: 'España', bandera: '🇪🇸' },
    { codigo: '+1', pais: 'Estados Unidos', bandera: '🇺🇸' },
    { codigo: '+502', pais: 'Guatemala', bandera: '🇬🇹' },
    { codigo: '+504', pais: 'Honduras', bandera: '🇭🇳' },
    { codigo: '+52', pais: 'México', bandera: '🇲🇽' },
    { codigo: '+505', pais: 'Nicaragua', bandera: '🇳🇮' },
    { codigo: '+507', pais: 'Panamá', bandera: '🇵🇦' },
    { codigo: '+595', pais: 'Paraguay', bandera: '🇵🇾' },
    { codigo: '+51', pais: 'Perú', bandera: '🇵🇪' },
    { codigo: '+1', pais: 'Puerto Rico', bandera: '🇵🇷' },
    { codigo: '+598', pais: 'Uruguay', bandera: '🇺🇾' },
    { codigo: '+58', pais: 'Venezuela', bandera: '🇻🇪' },
  ];

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
      // Log removido
    } finally {
      setLoadingSucursales(false);
    }
  };

  useEffect(() => {
    if (empleado) {
      // Extraer código de país del teléfono si existe
      let telefonoSinCodigo = empleado.telefono || '';
      let codigoPaisDetectado = '+593'; // Ecuador por defecto
      
      if (telefonoSinCodigo && telefonoSinCodigo.startsWith('+')) {
        // El teléfono tiene código de país, extraerlo
        const codigoEncontrado = codigosPaises.find(p => telefonoSinCodigo.startsWith(p.codigo));
        if (codigoEncontrado) {
          codigoPaisDetectado = codigoEncontrado.codigo;
          telefonoSinCodigo = telefonoSinCodigo.substring(codigoEncontrado.codigo.length);
        }
      }
      
      setCodigoPais(codigoPaisDetectado);
      setFormData({
        nombre: empleado.nombre,
        cargo: empleado.cargo,
        telefono: telefonoSinCodigo,
        email: empleado.email,
        foto: empleado.foto || '',
        estado: empleado.estado
      });
      setSucursalSeleccionada(''); // No pre-seleccionamos en edición
    } else {
      setCodigoPais('+593');
      setFormData({
        nombre: '',
        cargo: '',
        telefono: '',
        email: '',
        foto: '',
        estado: 'ACTIVO'
      });
      setSucursalSeleccionada('');
    }
    setErrors('');
  }, [empleado, isOpen]);

  // Cerrar dropdown de código de país al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.codigo-pais-dropdown-container')) {
        setShowCodigoPaisDropdown(false);
      }
    };
    
    if (showCodigoPaisDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showCodigoPaisDropdown]);

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

    if (formData.telefono.length !== 9) {
      setErrors('El teléfono debe tener exactamente 9 dígitos');
      return;
    }

    if (!/^\d{9}$/.test(formData.telefono)) {
      setErrors('El teléfono debe contener solo números');
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
        telefono: `${codigoPais}${formData.telefono.trim()}`,
        email: formData.email.trim()
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
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-600"
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
                    <div className="flex gap-2">
                      {/* Selector de código de país */}
                      <div className="w-24 relative codigo-pais-dropdown-container">
                        <button
                          type="button"
                          onClick={() => setShowCodigoPaisDropdown(!showCodigoPaisDropdown)}
                          className="w-full px-2 py-2 text-xs text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all flex items-center justify-between"
                          disabled={loading}
                        >
                          <span className="truncate text-[10px]">
                            {codigosPaises.find(p => p.codigo === codigoPais)?.bandera} {codigoPais}
                          </span>
                          <svg className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform ${showCodigoPaisDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {showCodigoPaisDropdown && (
                          <div className="absolute z-50 w-56 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {codigosPaises.map((pais) => (
                              <button
                                key={`${pais.codigo}-${pais.pais}`}
                                type="button"
                                onClick={() => {
                                  setCodigoPais(pais.codigo);
                                  setShowCodigoPaisDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{pais.bandera}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-gray-900">{pais.pais}</div>
                                    <div className="text-[10px] text-gray-500">{pais.codigo}</div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Input de teléfono */}
                      <input
                        type="tel"
                        required
                        value={formData.telefono}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, ''); // Solo números
                          
                          // Si el primer caracter es 0, quitarlo
                          if (value.startsWith('0')) {
                            value = value.substring(1);
                          }
                          
                          // Limitar a 9 dígitos
                          if (value.length <= 9) {
                            setFormData({ ...formData, telefono: value });
                          }
                        }}
                        className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
                        placeholder="999999999"
                        disabled={loading}
                      />
                    </div>
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

                {/* Estado */}
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
                {/* Columna Izquierda: Datos del empleado */}
                <div className="space-y-3.5">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-600"
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
                      <div className="flex gap-2">
                        {/* Selector de código de país */}
                        <div className="w-20 relative codigo-pais-dropdown-container">
                          <button
                            type="button"
                            onClick={() => setShowCodigoPaisDropdown(!showCodigoPaisDropdown)}
                            className="w-full px-1.5 py-2 text-xs text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all flex items-center justify-between"
                            disabled={loading}
                          >
                            <span className="truncate text-[10px]">
                              {codigosPaises.find(p => p.codigo === codigoPais)?.bandera} {codigoPais}
                            </span>
                            <svg className={`w-2.5 h-2.5 text-gray-400 flex-shrink-0 transition-transform ${showCodigoPaisDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {showCodigoPaisDropdown && (
                            <div className="absolute z-50 w-56 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto left-0">
                              {codigosPaises.map((pais) => (
                                <button
                                  key={`crear-${pais.codigo}-${pais.pais}`}
                                  type="button"
                                  onClick={() => {
                                    setCodigoPais(pais.codigo);
                                    setShowCodigoPaisDropdown(false);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{pais.bandera}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-medium text-gray-900">{pais.pais}</div>
                                      <div className="text-[10px] text-gray-500">{pais.codigo}</div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Input de teléfono */}
                        <input
                          type="tel"
                          required
                          value={formData.telefono}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, ''); // Solo números
                            
                            // Si el primer caracter es 0, quitarlo
                            if (value.startsWith('0')) {
                              value = value.substring(1);
                            }
                            
                            // Limitar a 9 dígitos
                            if (value.length <= 9) {
                              setFormData({ ...formData, telefono: value });
                            }
                          }}
                          className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
                          placeholder="999999999"
                          disabled={loading}
                        />
                      </div>
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
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs text-blue-700">
                        <p className="font-medium mb-1">Nota sobre horarios:</p>
                        <p>Los horarios de trabajo del empleado se configurarán posteriormente. Podrás definir su disponibilidad después de crearlo.</p>
                      </div>
                    </div>
                  </div>
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

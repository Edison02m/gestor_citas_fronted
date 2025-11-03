'use client';

import { useState, useEffect } from 'react';
import { Cliente, CreateClienteDto, UpdateClienteDto } from '@/interfaces';

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClienteDto | UpdateClienteDto) => Promise<void>;
  cliente?: Cliente | null;
  loading?: boolean;
}

export default function ClienteModal({ isOpen, onClose, onSubmit, cliente, loading }: ClienteModalProps) {
  const [formData, setFormData] = useState<CreateClienteDto>({
    nombre: '',
    cedula: '',
    telefono: '',
    email: '',
    notas: ''
  });

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

  useEffect(() => {
    if (cliente) {
      // Extraer código de país del teléfono si existe
      let telefonoSinCodigo = cliente.telefono || '';
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
        nombre: cliente.nombre,
        cedula: cliente.cedula,
        telefono: telefonoSinCodigo,
        email: cliente.email || '',
        notas: cliente.notas || ''
      });
    } else {
      setCodigoPais('+593');
      setFormData({
        nombre: '',
        cedula: '',
        telefono: '',
        email: '',
        notas: ''
      });
    }
    setErrors('');
  }, [cliente, isOpen]);

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

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      setErrors('El nombre es requerido');
      return;
    }

    if (!formData.cedula.trim()) {
      setErrors('La cédula es requerida');
      return;
    }

    if (formData.cedula.length !== 10) {
      setErrors('La cédula debe tener exactamente 10 dígitos');
      return;
    }

    if (!/^\d{10}$/.test(formData.cedula)) {
      setErrors('La cédula debe contener solo números');
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

    if (!formData.email || !formData.email.trim()) {
      setErrors('El email es requerido');
      return;
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrors('El formato del email no es válido');
      return;
    }

    try {
      // Combinar código de país con teléfono antes de enviar
      const dataToSubmit = {
        ...formData,
        telefono: `${codigoPais}${formData.telefono}`
      };
      await onSubmit(dataToSubmit);
    } catch (error: any) {
      setErrors(error.message || 'Error al guardar el cliente');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
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
              Nombre completo *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
              placeholder="Ej: Juan Pérez"
              disabled={loading}
            />
          </div>

          {/* Cédula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cédula *
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={formData.cedula}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Solo números
                // Limitar a 10 dígitos
                if (value.length <= 10) {
                  setFormData({ ...formData, cedula: value });
                }
              }}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
              placeholder="1234567890"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.cedula.length}/10 dígitos {formData.cedula.length === 10 && '✓'}
            </p>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Teléfono *
            </label>
            <div className="flex gap-2">
              {/* Selector de código de país */}
              <div className="w-32 relative codigo-pais-dropdown-container">
                <button
                  type="button"
                  onClick={() => setShowCodigoPaisDropdown(!showCodigoPaisDropdown)}
                  className="w-full px-2 py-2 text-xs text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all flex items-center justify-between"
                  disabled={loading}
                >
                  <span className="truncate">
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

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
              placeholder="cliente@ejemplo.com"
              disabled={loading}
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400 resize-none"
              placeholder="Información adicional del cliente..."
              disabled={loading}
            />
          </div>

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
              {loading ? 'Guardando...' : (cliente ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

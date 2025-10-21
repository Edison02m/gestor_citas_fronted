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

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        cedula: cliente.cedula,
        telefono: cliente.telefono,
        email: cliente.email || '',
        notas: cliente.notas || ''
      });
    } else {
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

    if (formData.cedula.length !== 10 || !/^\d+$/.test(formData.cedula)) {
      setErrors('La cédula debe tener 10 dígitos numéricos');
      return;
    }

    if (!formData.telefono.trim()) {
      setErrors('El teléfono es requerido');
      return;
    }

    if (formData.telefono.length < 7) {
      setErrors('El teléfono debe tener al menos 7 dígitos');
      return;
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrors('El formato del email no es válido');
      return;
    }

    try {
      await onSubmit(formData);
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
                setFormData({ ...formData, cedula: value });
              }}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
              placeholder="1234567890"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">10 dígitos numéricos</p>
          </div>

          {/* Teléfono */}
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

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email (opcional)
            </label>
            <input
              type="email"
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

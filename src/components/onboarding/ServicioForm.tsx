'use client';

import { useState, useEffect } from 'react';
import { OnboardingService } from '@/services/onboarding.service';
import { Sucursal } from '@/interfaces';

interface Props {
  onSuccess: () => void;
}

interface FormData {
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  color?: string;
  sucursalIds: string[];
}

export default function ServicioForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    precio: 0,
    duracion: 30,
    color: '#3b82f6',
    sucursalIds: []
  });

  useEffect(() => {
    loadSucursales();
  }, []);

  const loadSucursales = async () => {
    try {
      // Log removido
      const data = await OnboardingService.getSucursales();
      // Log removido
      setSucursales(data);
      // Seleccionar todas las sucursales por defecto
      setFormData(prev => ({ ...prev, sucursalIds: data.map(s => s.id) }));
    } catch (err) {
      // Log removido
      setError('No se pudieron cargar las sucursales. Asegúrate de haber creado al menos una sucursal.');
    } finally {
      setLoadingSucursales(false);
    }
  };

  const toggleSucursal = (sucursalId: string) => {
    const newSucursalIds = formData.sucursalIds.includes(sucursalId)
      ? formData.sucursalIds.filter(id => id !== sucursalId)
      : [...formData.sucursalIds, sucursalId];
    
    setFormData({ ...formData, sucursalIds: newSucursalIds });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.sucursalIds.length === 0) {
      setError('Debes seleccionar al menos una sucursal');
      return;
    }

    setLoading(true);

    try {
      // Construir el DTO para enviar al backend
      const dataToSend = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: formData.precio,
        duracion: formData.duracion,
        color: formData.color,
        sucursalIds: formData.sucursalIds
      };
      
      await OnboardingService.createServicio(dataToSend);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear servicio');
    } finally {
      setLoading(false);
    }
  };

  if (loadingSucursales) {
    return <div className="text-center py-8">Cargando sucursales...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header explicativo */}
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
          Servicios que ofreces
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Agrega al menos un servicio que ofreces.{' '}
          <span className="text-gray-500 text-[10px] sm:text-xs">
            (Podrás agregar más servicios después)
          </span>
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            Nombre del servicio
            <div className="group relative">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="invisible group-hover:visible absolute left-0 sm:left-auto sm:right-0 top-6 w-56 sm:w-64 bg-gray-900 text-white text-[10px] sm:text-xs rounded-lg py-1.5 px-2.5 z-10 shadow-lg">
                Este nombre será visible para tus clientes al agendar
              </div>
            </div>
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
            placeholder="Ej: Corte de Cabello, Manicure, Consulta..."
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            Descripción (opcional)
          </label>
          <input
            type="text"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
            placeholder="Breve descripción..."
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Precio ($)
              <div className="group relative">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="invisible group-hover:visible absolute left-0 sm:left-auto sm:right-0 top-6 w-48 sm:w-56 bg-gray-900 text-white text-[10px] sm:text-xs rounded-lg py-1.5 px-2.5 z-10 shadow-lg">
                  Precio que cobrarás por este servicio
                </div>
              </div>
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
              placeholder="15.00"
              disabled={loading}
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Duración (min)
              <div className="group relative">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="invisible group-hover:visible absolute left-0 sm:left-auto sm:right-0 top-6 w-48 sm:w-56 bg-gray-900 text-white text-[10px] sm:text-xs rounded-lg py-1.5 px-2.5 z-10 shadow-lg">
                  Tiempo estimado del servicio
                </div>
              </div>
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.duracion}
              onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) || 30 })}
              className="w-full px-3 py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
              placeholder="30"
              disabled={loading}
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Color
              <div className="group relative">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="invisible group-hover:visible absolute left-0 sm:left-auto sm:right-0 top-6 w-48 sm:w-56 bg-gray-900 text-white text-[10px] sm:text-xs rounded-lg py-1.5 px-2.5 z-10 shadow-lg">
                  Color para identificar el servicio en la agenda
                </div>
              </div>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-10 sm:w-12 h-[34px] sm:h-[38px] px-1 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 bg-white cursor-pointer"
                disabled={loading}
              />
              <div 
                className="flex-1 px-2 sm:px-3 py-2 border border-gray-200 rounded-xl text-[10px] sm:text-sm text-gray-700 font-mono"
                style={{ backgroundColor: formData.color + '20' }}
              >
                {formData.color}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sucursales */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
        <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Sucursales donde se ofrece
          <div className="group relative">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="invisible group-hover:visible absolute left-0 sm:left-auto sm:right-0 top-6 w-48 sm:w-64 bg-gray-900 text-white text-[10px] sm:text-xs rounded-lg py-1.5 px-2.5 z-10 shadow-lg">
              Selecciona en qué sucursales estará disponible este servicio
            </div>
          </div>
        </label>
        <div className="space-y-1.5">
          {sucursales.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-[10px] sm:text-xs text-gray-500">No hay sucursales disponibles</p>
            </div>
          ) : (
            sucursales.map((sucursal) => (
              <label 
                key={sucursal.id} 
                className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all text-[10px] sm:text-xs ${
                  formData.sucursalIds.includes(sucursal.id)
                    ? 'border-[#0490C8] bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.sucursalIds.includes(sucursal.id)}
                  onChange={() => toggleSucursal(sucursal.id)}
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0490C8] rounded"
                  disabled={loading}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{sucursal.nombre}</div>
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm shadow-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0490C8] hover:bg-[#023664] text-white font-semibold py-2.5 sm:py-3 px-4 rounded-xl text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Guardando...' : 'Continuar'}
      </button>
    </form>
  );
}

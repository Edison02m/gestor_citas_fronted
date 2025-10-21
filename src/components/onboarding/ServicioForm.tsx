'use client';

import { useState, useEffect } from 'react';
import { OnboardingService } from '@/services/onboarding.service';
import { CreateServicioDto, Sucursal, ServicioExtraInput } from '@/interfaces';

interface Props {
  onSuccess: () => void;
}

export default function ServicioForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(true);
  
  const [formData, setFormData] = useState<CreateServicioDto>({
    nombre: '',
    descripcion: '',
    precio: 0,
    duracion: 30,
    color: '#3b82f6',
    sucursalIds: [],
    extras: []
  });

  const [newExtra, setNewExtra] = useState<ServicioExtraInput>({ nombre: '', precio: 0 });

  useEffect(() => {
    loadSucursales();
  }, []);

  const loadSucursales = async () => {
    try {
      console.log('🔍 Cargando sucursales...');
      const data = await OnboardingService.getSucursales();
      console.log('✅ Sucursales cargadas:', data);
      setSucursales(data);
      // Seleccionar todas las sucursales por defecto
      setFormData(prev => ({ ...prev, sucursalIds: data.map(s => s.id) }));
    } catch (err) {
      console.error('❌ Error al cargar sucursales:', err);
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

  const addExtra = () => {
    if (newExtra.nombre && newExtra.precio > 0) {
      setFormData({
        ...formData,
        extras: [...(formData.extras || []), newExtra]
      });
      setNewExtra({ nombre: '', precio: 0 });
    }
  };

  const removeExtra = (index: number) => {
    setFormData({
      ...formData,
      extras: formData.extras?.filter((_, i) => i !== index)
    });
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
      await OnboardingService.createServicio(formData);
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
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre del servicio
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
            placeholder="Ej: Corte de Cabello"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Descripción (opcional)
          </label>
          <input
            type="text"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
            placeholder="Breve descripción..."
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Precio ($)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
              placeholder="15.00"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Duración (min)
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.duracion}
              onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) || 30 })}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
              placeholder="30"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Color
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-[38px] border border-gray-200 rounded-xl cursor-pointer"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Sucursales */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Sucursales donde se ofrece
        </label>
        <div className="space-y-1.5">
          {sucursales.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs text-gray-500">No hay sucursales disponibles</p>
            </div>
          ) : (
            sucursales.map((sucursal) => (
              <label 
                key={sucursal.id} 
                className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all text-xs ${
                  formData.sucursalIds.includes(sucursal.id)
                    ? 'border-[#0490C8] bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.sucursalIds.includes(sucursal.id)}
                  onChange={() => toggleSucursal(sucursal.id)}
                  className="w-3.5 h-3.5 text-[#0490C8] rounded"
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

      {/* Extras opcionales */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Extras opcionales
        </label>
        
        {formData.extras && formData.extras.length > 0 && (
          <div className="space-y-1.5 mb-2">
            {formData.extras.map((extra, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-900">{extra.nombre}</span>
                  <span className="text-xs text-gray-600">${extra.precio.toFixed(2)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeExtra(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-all"
                  disabled={loading}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre"
            value={newExtra.nombre}
            onChange={(e) => setNewExtra({ ...newExtra, nombre: e.target.value })}
            className="flex-1 px-2 py-1.5 text-xs text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#0490C8] focus:ring-1 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
            disabled={loading}
          />
          <input
            type="number"
            placeholder="$"
            min="0"
            step="0.01"
            value={newExtra.precio || ''}
            onChange={(e) => setNewExtra({ ...newExtra, precio: parseFloat(e.target.value) || 0 })}
            className="w-20 px-2 py-1.5 text-xs text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#0490C8] focus:ring-1 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
            disabled={loading}
          />
          <button
            type="button"
            onClick={addExtra}
            disabled={loading || !newExtra.nombre || newExtra.precio <= 0}
            className="px-3 py-1.5 bg-[#0490C8] hover:bg-[#023664] text-white text-xs rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            +
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0490C8] hover:bg-[#023664] text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creando servicio...' : 'Continuar'}
      </button>
    </form>
  );
}

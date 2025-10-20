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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu primer servicio</h2>
        <p className="text-gray-600 text-sm">Define qué servicios ofreces a tus clientes</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Nombre del servicio *
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
            placeholder="Ej: Corte de Cabello"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Descripción
          </label>
          <textarea
            rows={2}
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 resize-none transition-all"
            placeholder="Breve descripción del servicio..."
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Precio * ($)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
              placeholder="15.00"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Duración (min) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.duracion}
              onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) || 30 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
              placeholder="30"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Color (para el calendario)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-14 h-14 border-2 border-gray-200 rounded-xl cursor-pointer"
              disabled={loading}
            />
            <span className="text-sm text-gray-600">{formData.color}</span>
          </div>
        </div>
      </div>

      {/* Sucursales */}
      <div className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-gray-50 to-white">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Sucursales donde se ofrece *
        </h3>
        <div className="space-y-2">
          {sucursales.length === 0 ? (
            <div className="text-center py-6">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm text-gray-600 font-medium mb-1">No hay sucursales disponibles</p>
              <p className="text-xs text-gray-500">Primero debes crear una sucursal en el paso anterior</p>
            </div>
          ) : (
            sucursales.map((sucursal) => (
              <label 
                key={sucursal.id} 
                className={`flex items-start p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.sucursalIds.includes(sucursal.id)
                    ? 'border-[#0490C8] bg-blue-50/50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.sucursalIds.includes(sucursal.id)}
                  onChange={() => toggleSucursal(sucursal.id)}
                  className="mt-1 mr-3 w-4 h-4 text-[#0490C8] rounded"
                  disabled={loading}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{sucursal.nombre}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{sucursal.direccion}</div>
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Extras opcionales */}
      <div className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-amber-50/30 to-white">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Extras (opcional)
        </h3>
        
        {formData.extras && formData.extras.length > 0 && (
          <div className="space-y-2 mb-3">
            {formData.extras.map((extra, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <span className="text-amber-600 text-xs">+</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 text-sm">{extra.nombre}</span>
                    <span className="text-gray-600 ml-2 text-sm">${extra.precio.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeExtra(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-1.5 transition-all"
                  disabled={loading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            placeholder="Nombre del extra"
            value={newExtra.nombre}
            onChange={(e) => setNewExtra({ ...newExtra, nombre: e.target.value })}
            className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            disabled={loading}
          />
          <input
            type="number"
            placeholder="Precio"
            min="0"
            step="0.01"
            value={newExtra.precio || ''}
            onChange={(e) => setNewExtra({ ...newExtra, precio: parseFloat(e.target.value) || 0 })}
            className="w-24 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            disabled={loading}
          />
          <button
            type="button"
            onClick={addExtra}
            disabled={loading || !newExtra.nombre || newExtra.precio <= 0}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
          >
            +
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0490C8] hover:bg-[#023664] text-white font-semibold py-4 px-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Creando servicio...</span>
          </>
        ) : (
          <>
            <span>Continuar</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

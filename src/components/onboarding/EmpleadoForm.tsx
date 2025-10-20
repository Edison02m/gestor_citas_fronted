'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingService } from '@/services/onboarding.service';
import { CreateEmpleadoDto, Sucursal } from '@/interfaces';

interface Props {
  onSuccess: () => void;
  onSkip: () => void;
}

export default function EmpleadoForm({ onSuccess, onSkip }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(true);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<CreateEmpleadoDto>({
    nombre: '',
    cargo: '',
    telefono: '',
    email: '',
    foto: '',
    color: '#10b981',
    sucursalIds: []
  });

  useEffect(() => {
    loadSucursales();
  }, []);

  const loadSucursales = async () => {
    try {
      const data = await OnboardingService.getSucursales();
      setSucursales(data);
      // Seleccionar todas las sucursales por defecto
      setFormData(prev => ({ ...prev, sucursalIds: data.map(s => s.id) }));
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
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
      await OnboardingService.createEmpleado(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear empleado');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipClick = () => {
    setShowSkipConfirm(true);
  };

  const confirmSkip = async () => {
    setLoading(true);
    setError('');

    try {
      // Crear un empleado automáticamente con los datos del usuario actual
      const empleadoData: CreateEmpleadoDto = {
        nombre: user?.nombre || 'Propietario',
        cargo: 'Propietario',
        telefono: (user as any)?.negocio?.telefono || '',
        email: user?.email || '',
        foto: (user as any)?.negocio?.logo || '',
        color: '#0490C8',
        sucursalIds: sucursales.map(s => s.id) // Asignar a todas las sucursales
      };

      console.log('📝 Creando empleado automático:', empleadoData);
      await OnboardingService.createEmpleado(empleadoData);
      console.log('✅ Empleado automático creado');
      
      onSkip();
    } catch (err: any) {
      console.error('❌ Error al crear empleado automático:', err);
      setError(err.message || 'Error al crear empleado automático');
      setShowSkipConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  if (loadingSucursales) {
    return (
      <div className="text-center py-12">
        <svg className="animate-spin h-10 w-10 text-[#0490C8] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600">Cargando datos...</p>
      </div>
    );
  }

  // Modal de confirmación para omitir
  if (showSkipConfirm) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Te agregaremos como empleado</h3>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 max-w-md mx-auto border border-blue-100">
            <p className="text-sm text-gray-700 mb-3">
              Para poder gestionar citas, necesitas al menos un empleado registrado. 
            </p>
            <div className="flex items-center gap-2 text-left">
              <div className="w-8 h-8 bg-[#0490C8] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{user?.nombre || 'Tú'}</span> será agregado como <span className="font-semibold text-gray-900">Propietario</span> en todas las sucursales
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Podrás agregar más empleados después desde el panel de control
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2 max-w-md mx-auto">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => setShowSkipConfirm(false)}
            disabled={loading}
            className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={confirmSkip}
            disabled={loading}
            className="px-6 py-3 bg-[#0490C8] text-white font-semibold rounded-2xl hover:bg-[#023664] transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creando...</span>
              </>
            ) : (
              <span>Continuar</span>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agregar empleados</h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Agrega los miembros de tu equipo. <span className="font-medium text-[#0490C8]">Este paso es opcional</span>, puedes hacerlo después.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
              placeholder="Ej: Carlos Martínez"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Cargo *
            </label>
            <input
              type="text"
              required
              value={formData.cargo}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
              placeholder="Ej: Estilista"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              required
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
              placeholder="+593 999 888 777"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
              placeholder="correo@ejemplo.com"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Foto (URL - opcional)
          </label>
          <input
            type="url"
            value={formData.foto}
            onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
            placeholder="https://ejemplo.com/foto.jpg"
            disabled={loading}
          />
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

        {/* Sucursales */}
        <div className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-gray-50 to-white">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Sucursales donde trabaja *
          </h3>
          <div className="space-y-2">
            {sucursales.map((sucursal) => (
              <label 
                key={sucursal.id} 
                className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.sucursalIds.includes(sucursal.id)
                    ? 'border-[#0490C8] bg-blue-50/50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.sucursalIds.includes(sucursal.id)}
                  onChange={() => toggleSucursal(sucursal.id)}
                  className="mr-3 w-4 h-4 text-[#0490C8] rounded"
                  disabled={loading}
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">{sucursal.nombre}</div>
                </div>
              </label>
            ))}
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

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSkipClick}
            disabled={loading}
            className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Omitir paso</span>
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#0490C8] hover:bg-[#023664] text-white font-semibold py-4 px-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creando...</span>
              </>
            ) : (
              <>
                <span>Agregar empleado</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

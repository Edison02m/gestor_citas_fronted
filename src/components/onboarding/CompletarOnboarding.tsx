'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingService } from '@/services/onboarding.service';

export default function CompletarOnboarding() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleCompletar = async () => {
    setLoading(true);

    try {
      // El onboarding ya fue completado (desde EmpleadoForm o ServicioForm)
      // Solo necesitamos refrescar el usuario y redirigir
      
      // 1. Actualizar el usuario desde el backend (esto obtiene primerLogin: false)
      await refreshUser();

      // 2. Pequeño delay para asegurar que el estado se propagó
      await new Promise(resolve => setTimeout(resolve, 300));

      // 3. Redirigir al dashboard
      router.push('/dashboard-usuario');
    } catch (error: any) {
      // Log removido
      alert(error.message || 'Error al redirigir al dashboard');
      setLoading(false);
    }
    // No hacemos setLoading(false) aquí porque ya estamos redirigiendo
  };

  return (
    <div className="text-center space-y-6">
      {/* Header minimalista */}
      <div>
        <div className="w-12 h-12 rounded-full bg-[#0490C8] flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Todo listo!
        </h2>
        <p className="text-sm text-gray-600">
          Tu negocio está configurado correctamente
        </p>
      </div>

      {/* Lista de verificación compacta */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-left">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full bg-[#0490C8] flex items-center justify-center flex-shrink-0">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-gray-700">Información del negocio</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full bg-[#0490C8] flex items-center justify-center flex-shrink-0">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-gray-700">Sucursales y horarios</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full bg-[#0490C8] flex items-center justify-center flex-shrink-0">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-gray-700">Catálogo de servicios</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full bg-[#0490C8] flex items-center justify-center flex-shrink-0">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-gray-700">Equipo de trabajo</span>
        </div>
      </div>

      {/* Mensaje de prueba */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
        <p className="text-sm text-gray-700">
          Tienes <span className="font-semibold text-[#0490C8]">30 días de prueba gratis</span> para explorar todas las funcionalidades
        </p>
      </div>

      {/* Botón de acción */}
      <button
        onClick={handleCompletar}
        disabled={loading}
        className="w-full bg-[#0490C8] hover:bg-[#023664] text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Cargando...' : 'Ir al Dashboard'}
      </button>
    </div>
  );
}

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
      // 1. Completar onboarding en el backend
      await OnboardingService.completar();

      // 2. Actualizar el usuario desde el backend (esto obtiene primerLogin: false)
      await refreshUser();

      // 3. Pequeño delay para asegurar que el estado se propagó
      await new Promise(resolve => setTimeout(resolve, 300));

      // 4. Redirigir al dashboard
      router.push('/dashboard-usuario');
    } catch (error: any) {
      console.error('Error al completar onboarding:', error);
      alert(error.message || 'Error al completar onboarding');
      setLoading(false);
    }
    // No hacemos setLoading(false) aquí porque ya estamos redirigiendo
  };

  return (
    <div className="text-center space-y-8">
      {/* Ícono de éxito */}
      <div className="relative">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          ¡Todo listo! 🎉
        </h2>
        <p className="text-gray-600 text-lg">
          Has configurado exitosamente tu negocio
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 space-y-4 border border-blue-100 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Información del negocio</p>
            <p className="text-sm text-gray-600">Datos básicos configurados</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Sucursales con horarios</p>
            <p className="text-sm text-gray-600">Ubicaciones y horarios de atención</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Servicios</p>
            <p className="text-sm text-gray-600">Catálogo de servicios disponible</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Empleados</p>
            <p className="text-sm text-gray-600">Equipo configurado o para agregar después</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-bold text-lg">30 días de prueba gratis</p>
        </div>
        <p className="text-sm text-blue-100">
          Explora todas las funcionalidades sin restricciones
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <p className="text-gray-700 font-medium">
          ¡Ya puedes empezar a gestionar tus citas y clientes!
        </p>
        
        <button
          onClick={handleCompletar}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#0490C8] to-[#0369a1] hover:from-[#023664] hover:to-[#012a4a] text-white font-bold py-5 px-8 rounded-2xl transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Completando...</span>
            </>
          ) : (
            <>
              <span className="text-lg">Ir al Dashboard</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

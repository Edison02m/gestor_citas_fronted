'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingService } from '@/services/onboarding.service';
import { OnboardingStatus } from '@/interfaces';
import SucursalForm from '@/components/onboarding/SucursalForm';
import ServicioForm from '@/components/onboarding/ServicioForm';
import EmpleadoForm from '@/components/onboarding/EmpleadoForm';
import CompletarOnboarding from '@/components/onboarding/CompletarOnboarding';

export default function OnboardingPage() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(2);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const loadStatus = useCallback(async () => {
    try {
      const data = await OnboardingService.getStatus();
      setStatus(data);
      setCurrentStep(data.pasoActual);

      // Si ya completó, redirigir al dashboard
      if (data.completado) {
        router.push('/dashboard-usuario');
      }
    } catch (error) {
      console.error('Error al cargar estado:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // 🔒 Proteger ruta: Solo usuarios autenticados con primerLogin
  useEffect(() => {
    if (!isLoading) {
      console.log('🔍 Verificando acceso a onboarding:', { 
        user: user?.email, 
        primerLogin: 'primerLogin' in (user || {}) ? (user as any).primerLogin : 'N/A'
      });

      // Redirigir si no está autenticado
      if (!user) {
        console.log('❌ No autenticado, redirigiendo a /auth');
        router.push('/auth');
        return;
      }

      // SuperAdmin no debe acceder a onboarding
      if (user.rol === 'SUPER_ADMIN') {
        console.log('❌ SuperAdmin no puede acceder, redirigiendo a /dashboard');
        router.push('/dashboard');
        return;
      }

      // Si el usuario ya completó el onboarding, redirigir al dashboard
      if ('primerLogin' in user && !user.primerLogin) {
        console.log('✅ Onboarding completado, redirigiendo a /dashboard-usuario');
        router.push('/dashboard-usuario');
        return;
      }

      // Cargar el estado del onboarding
      if ('primerLogin' in user && user.primerLogin) {
        console.log('🔄 Cargando estado del onboarding...');
        loadStatus();
      }
    }
  }, [user, isLoading, router, loadStatus]);

  const handleNext = () => {
    loadStatus(); // Recargar estado después de cada acción
  };

  const handleSkip = () => {
    // Saltar paso opcional (empleados)
    loadStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0490C8] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Error al cargar el onboarding</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido a CitaYA! 🎉
          </h1>
          <p className="text-gray-600">
            Configura tu negocio en pocos pasos y comienza a gestionar tus citas
          </p>
          <p className="text-sm text-[#0490C8] font-medium mt-2">
            Tienes 30 días de prueba gratis
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            {status.pasos.map((paso, index) => (
              <div key={paso.paso} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                      paso.completado
                        ? 'bg-green-500 text-white'
                        : currentStep === paso.paso
                        ? 'bg-[#0490C8] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {paso.completado ? '✓' : paso.paso}
                  </div>
                  <p
                    className={`text-xs mt-2 text-center ${
                      currentStep === paso.paso ? 'text-[#0490C8] font-medium' : 'text-gray-600'
                    }`}
                  >
                    {paso.nombre}
                  </p>
                  {paso.opcional && (
                    <span className="text-xs text-gray-400 italic">(Opcional)</span>
                  )}
                </div>
                {index < status.pasos.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 transition-all ${
                      paso.completado ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenido del paso actual */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {currentStep === 2 && <SucursalForm onSuccess={handleNext} />}
          {currentStep === 3 && <ServicioForm onSuccess={handleNext} />}
          {currentStep === 4 && <EmpleadoForm onSuccess={handleNext} onSkip={handleSkip} />}
          {currentStep === 5 && <CompletarOnboarding />}
        </div>
      </div>
    </div>
  );
}

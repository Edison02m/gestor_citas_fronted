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
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header minimalista */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Bienvenido a CitaYA
          </h1>
          <p className="text-sm text-gray-600">
            Configura tu negocio en pocos pasos
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-200">
            <svg className="w-3.5 h-3.5 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-700 font-medium">30 días de prueba gratis</span>
          </div>
        </div>

        {/* Barra de progreso minimalista */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {status.pasos.map((paso, index) => (
              <div key={paso.paso} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      paso.completado
                        ? 'bg-[#0490C8] text-white'
                        : currentStep === paso.paso
                        ? 'bg-[#0490C8] text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {paso.completado ? '✓' : paso.paso}
                  </div>
                  <p
                    className={`text-[10px] mt-1.5 text-center leading-tight ${
                      currentStep === paso.paso ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {paso.nombre}
                  </p>
                  {paso.opcional && (
                    <span className="text-[9px] text-gray-400">(Opcional)</span>
                  )}
                </div>
                {index < status.pasos.length - 1 && (
                  <div
                    className={`h-px flex-1 mx-1 transition-all ${
                      paso.completado ? 'bg-[#0490C8]' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenido del paso actual */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {currentStep === 2 && <SucursalForm onSuccess={handleNext} />}
          {currentStep === 3 && <ServicioForm onSuccess={handleNext} />}
          {currentStep === 4 && <EmpleadoForm onSuccess={handleNext} onSkip={handleSkip} />}
          {currentStep === 5 && <CompletarOnboarding />}
        </div>
      </div>
    </div>
  );
}

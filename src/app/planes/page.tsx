'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PricingTable from '@/components/planes/PricingTable';
import PricingCardsSkeleton from '@/components/shared/PricingCardsSkeleton';
import planesService from '@/services/planes.service';
import { TipoPlan } from '@/interfaces';
import LandingHeader from '@/components/landing/LandingHeader';

export default function PlanesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<TipoPlan | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // La página de planes es PÚBLICA - cualquiera puede verla
    // Solo cargar plan actual si el usuario está autenticado
    if (!authLoading) {
      if (user) {
        cargarPlanActual();
      } else {
        // Si no hay usuario, simplemente no mostrar plan actual
        setIsLoadingPlan(false);
      }
    }
  }, [user, authLoading]);

  const cargarPlanActual = async () => {
    try {
      setIsLoadingPlan(true);
      const response = await planesService.getPlanActual();
      setCurrentPlan(response.data.plan);
    } catch (error) {
      console.error('Error al cargar plan actual:', error);
      // No mostrar error si el usuario no tiene plan aún
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const handlePlanSelect = async (planId: string) => {
    // Si no está autenticado, redirigir a registro/login
    if (!user) {
      router.push('/auth?mode=register&plan=' + planId);
      return;
    }

    try {
      const response = await planesService.cambiarPlan(planId as TipoPlan);
      
      // Mostrar mensaje de éxito
      setSuccessMessage(`✓ Plan cambiado exitosamente a ${planId}`);
      setShowSuccess(true);
      
      // Actualizar plan actual
      setCurrentPlan(planId as TipoPlan);
      
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard-usuario');
      }, 2000);
    } catch (error: any) {
      console.error('Error al cambiar plan:', error);
      alert(error.response?.data?.message || 'Error al cambiar el plan. Por favor intenta de nuevo.');
    }
  };

  // Solo mostrar loading si está cargando auth o si hay usuario y está cargando plan
  if (authLoading || (user && isLoadingPlan)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando planes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header de navegación */}
      <LandingHeader />

      {/* Notificación de éxito */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-[#0490C8] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-[#023664]/20">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-bold">{successMessage}</p>
              <p className="text-sm text-white/90">Redirigiendo al dashboard...</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Estilo minimalista como landing */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge minimalista */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 mb-6">
            <span className="text-xs font-medium text-gray-600">Prueba Gratis - Sin Compromiso</span>
          </div>

          {/* Título simplificado */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-4">
            Elige el Plan Perfecto
            <br />
            <span className="text-[#0490C8]">para tu Negocio</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Gestiona tus citas, clientes y empleados sin complicaciones.
            Comienza gratis y escala cuando lo necesites.
          </p>
          
          {/* Badges de beneficios - estilo minimalista */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
              <svg className="w-3 h-3 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-gray-900">Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
              <svg className="w-3 h-3 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-gray-900">Cancela cuando quieras</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
              <svg className="w-3 h-3 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-gray-900">Soporte 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabla de precios */}
      <div className="relative">
        {isLoadingPlan ? (
          <PricingCardsSkeleton />
        ) : (
          <PricingTable 
            currentPlanId={currentPlan} 
            onPlanSelect={handlePlanSelect}
          />
        )}
      </div>

      {/* FAQ - Estilo minimalista */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Header de sección */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 mb-5">
              <span className="text-xs font-medium text-gray-700">Preguntas Frecuentes</span>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Tienes alguna duda?
            </h2>
            <p className="text-base text-gray-600">
              Encuentra respuestas a las preguntas más comunes
            </p>
          </div>
        
        <div className="space-y-6">
          <details className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 group">
            <summary className="font-bold text-gray-900 cursor-pointer flex justify-between items-center">
              <span>¿Puedo cambiar de plan en cualquier momento?</span>
              <svg
                className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-4 text-gray-600">
              Sí, puedes actualizar o cambiar tu plan en cualquier momento desde tu dashboard.
              Los cambios se aplicarán inmediatamente y ajustaremos la facturación de forma proporcional.
            </p>
          </details>

          <details className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 group">
            <summary className="font-bold text-gray-900 cursor-pointer flex justify-between items-center">
              <span>¿Qué sucede cuando alcanzo un límite?</span>
              <svg
                className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-4 text-gray-600">
              Te notificaremos cuando te acerques a un límite. No perderás datos, pero no podrás
              crear nuevos recursos hasta que actualices tu plan. Puedes actualizar en cualquier momento
              con un solo clic.
            </p>
          </details>

          <details className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 group">
            <summary className="font-bold text-gray-900 cursor-pointer flex justify-between items-center">
              <span>¿El plan GRATIS es realmente gratis?</span>
              <svg
                className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-4 text-gray-600">
              Sí, el plan GRATIS te da acceso completo durante 14 días sin necesidad de tarjeta de crédito.
              Incluye 1 sucursal, 3 empleados, 5 servicios, 50 clientes y 50 citas al mes. Perfecto para
              comenzar y probar todas las funcionalidades.
            </p>
          </details>

          <details className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 group">
            <summary className="font-bold text-gray-900 cursor-pointer flex justify-between items-center">
              <span>¿Qué incluyen los reportes avanzados?</span>
              <svg
                className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-4 text-gray-600">
              Los reportes avanzados (disponibles en PRO PLUS) incluyen análisis de ingresos,
              rendimiento de empleados, servicios más solicitados, horarios pico, tendencias de clientes
              y exportación a Excel. Ideal para tomar decisiones basadas en datos.
            </p>
          </details>

          <details className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 group">
            <summary className="font-bold text-gray-900 cursor-pointer flex justify-between items-center">
              <span>¿Ofrecen descuentos por pago anual?</span>
              <svg
                className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-4 text-gray-600">
              ¡Sí! Al elegir facturación anual ahorras el equivalente a 2 meses (aproximadamente 17% de descuento).
              Es la mejor opción si ya decidiste que nuestra plataforma es la indicada para tu negocio.
            </p>
          </details>
        </div>
        </div>
      </section>

      {/* CTA Final - Estilo minimalista */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 sm:p-10 rounded-2xl bg-white border border-gray-200">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 mb-5">
                <span className="text-xs font-medium text-gray-700">Únete Hoy</span>
              </div>

              {/* Título */}
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                ¿Listo para transformar
                <br />
                <span className="text-[#0490C8]">tu negocio?</span>
              </h2>

              {/* Descripción */}
              <p className="text-base text-gray-600 mb-8 max-w-xl mx-auto">
                {user 
                  ? 'Vuelve a tu dashboard y comienza a gestionar tu negocio de manera profesional.'
                  : 'Únete hoy y obtén acceso completo sin compromiso. Cancela cuando quieras.'
                }
              </p>

              {/* CTA Button */}
              {user ? (
                <button
                  onClick={() => router.push('/dashboard-usuario')}
                  className="group relative px-8 py-3 rounded-xl overflow-hidden inline-flex items-center gap-2 bg-[#0490C8] hover:bg-[#023664] transition-colors"
                >
                  <div className="relative text-white font-bold text-base">
                    Volver al Dashboard
                  </div>
                  <svg className="relative w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth?mode=register')}
                  className="group relative px-8 py-3 rounded-xl overflow-hidden inline-flex items-center gap-2 bg-[#0490C8] hover:bg-[#023664] transition-colors"
                >
                  <div className="relative text-white font-bold text-base">
                    Comenzar Gratis
                  </div>
                  <svg className="relative w-4 h-4 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              )}

              {/* Trust badges */}
              {!user && (
                <div className="flex flex-wrap items-center justify-center gap-5 mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-gray-600">Sin tarjeta de crédito</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-gray-600">Configuración en 5 minutos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-gray-600">Soporte 24/7</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

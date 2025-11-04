'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Usuario } from '@/interfaces';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api from '@/services/api';

// Helper para verificar si es Usuario (no SuperAdmin)
const isUsuario = (user: any): user is Usuario => {
  return user && 'negocio' in user;
};

export default function ActivarCodigoPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [codigo, setCodigo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [suscripcionVencida, setSuscripcionVencida] = useState(false);
  const [planEnCola, setPlanEnCola] = useState<{
    planPendiente: string;
    fechaActivacion: string;
    planActual: string;
  } | null>(null);

  // Detectar si viene de una suscripción vencida
  useEffect(() => {
    const expired = searchParams?.get('expired') === 'true';
    const estadoVencido = isUsuario(user) && user.negocio?.estadoSuscripcion === 'VENCIDA';
    setSuscripcionVencida(expired || estadoVencido);
  }, [searchParams, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!codigo.trim()) {
      setError('Por favor ingresa el código de activación');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data: {
          suscripcion: {
            id: string;
            fechaActivacion: string;
            fechaVencimiento: string;
            plan: string;
          };
          negocio: {
            estadoSuscripcion: string;
            fechaVencimiento: string;
          };
          // 🎯 Sistema de cola
          enCola?: boolean;
          planActual?: string;
          planPendiente?: string;
          fechaActivacionPendiente?: string;
        };
      }>('/suscripciones/activar-codigo', { codigo: codigo.trim() });

      setSuccess(response.message);

      // 🎯 Si el plan está en cola, guardar información adicional
      if (response.data.enCola) {
        setPlanEnCola({
          planPendiente: response.data.planPendiente || '',
          fechaActivacion: response.data.fechaActivacionPendiente || '',
          planActual: response.data.planActual || '',
        });
      }

      // 🔥 ACTUALIZAR EL USUARIO EN EL CONTEXTO
      await refreshUser();

      // Si el plan está en cola, esperar más tiempo para que el usuario lea el mensaje
      const tiempoEspera = response.data.enCola ? 4000 : 1500;
      
      setTimeout(() => {
        router.push('/dashboard-usuario');
      }, tiempoEspera);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al activar código');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0490C8] bg-opacity-10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isUsuario(user) && user.negocio?.estadoSuscripcion === 'ACTIVA' 
                  ? 'Renovar o Cambiar Plan' 
                  : 'Activar Código'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                {isUsuario(user) && user.negocio?.estadoSuscripcion === 'ACTIVA'
                  ? 'Ingresa un código para renovar tu suscripción o cambiar de plan'
                  : 'Activa tu suscripción con un código de activación'}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* 🚨 Banner de Suscripción Vencida */}
          {suscripcionVencida && (
            <div className="flex items-center gap-2 mb-4 px-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-gray-700">
                Tu suscripción ha vencido. Ingresa un código para renovar y recuperar el acceso.
                {isUsuario(user) && user.negocio?.fechaVencimiento && (
                  <span className="ml-2 text-gray-500">(Venció el {new Date(user.negocio.fechaVencimiento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })})</span>
                )}
              </span>
            </div>
          )}

          {/* Banner informativo si ya tiene suscripción activa */}
          {isUsuario(user) && user.negocio?.estadoSuscripcion === 'ACTIVA' && (
            <div className="flex items-center gap-2 mb-4 px-2">
              <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-gray-700">
                Ya tienes una suscripción activa. Puedes ingresar un nuevo código para renovar o cambiar tu plan.
              </span>
            </div>
          )}

          {/* Card Principal */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Input Código */}
                <div>
                  <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Activación
                  </label>
                  <input
                    id="codigo"
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Ej: MEN-2025-ABC123"
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition duration-150 text-center text-lg font-mono"
                    disabled={isSubmitting}
                    maxLength={20}
                  />
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    El código te fue proporcionado por el administrador
                  </p>
                </div>

                {/* Mensajes */}
                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-600 px-2">
                    <svg className="h-4 w-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {success && !planEnCola && (
                  <div className="flex items-center gap-2 text-xs text-green-700 px-2">
                    <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{success} <span className="text-gray-400">Redirigiendo...</span></span>
                  </div>
                )}

                {/* Mensaje especial para plan en cola */}
                {success && planEnCola && (
                  <div className="flex flex-col gap-1 text-xs text-blue-800 px-2">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Plan programado:</span>
                      <span>{planEnCola.planPendiente}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Actual:</span>
                      <span>{planEnCola.planActual}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500">Activa el:</span>
                      <span>{new Date(planEnCola.fechaActivacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <span className="text-gray-400">El plan se activará automáticamente. Redirigiendo...</span>
                  </div>
                )}

                {/* Botón Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || !codigo.trim()}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#0490C8] hover:bg-[#037aa8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0490C8] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Activando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Activar Código
                    </>
                  )}
                </button>

                {/* Info adicional */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="text-center space-y-2">
                    <p className="text-xs text-gray-500">
                      ¿No tienes un código de activación?
                    </p>
                    <p className="text-xs text-gray-400">
                      Contacta al administrador del sistema para obtener uno
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Info sobre planes */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Planes Disponibles
            </h3>
            
            <div className="space-y-3">
              {/* Plan PRO */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PRO</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">Plan PRO</h4>
                </div>
                <div className="space-y-2 pl-10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600"><span className="font-medium">Mensual:</span> 30 días</span>
                    <span className="text-gray-900 font-semibold">$10/mes</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600"><span className="font-medium">Anual:</span> 365 días</span>
                    <span className="text-gray-900 font-semibold">$9/mes</span>
                  </div>
                </div>
              </div>

              {/* Plan PRO PLUS */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0490C8] flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">PRO+</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">Plan PRO PLUS</h4>
                </div>
                <div className="space-y-2 pl-10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600"><span className="font-medium">Mensual:</span> 30 días</span>
                    <span className="text-gray-900 font-semibold">$20/mes</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600"><span className="font-medium">Anual:</span> 365 días</span>
                    <span className="text-gray-900 font-semibold">$17/mes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Nota sobre acumulación */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start gap-2 mb-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-[11px] font-semibold text-gray-900">Acumulación Inteligente</p>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed pl-6">
                  • Los códigos de <span className="font-medium">igual o mayor nivel</span> se suman automáticamente<br/>
                  • Los planes <span className="font-medium">inferiores</span> se guardan en cola y se activan al vencer el actual<br/>
                  • Solo puedes tener <span className="font-medium">1 plan en cola</span> a la vez
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

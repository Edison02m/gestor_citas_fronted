'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Usuario } from '@/interfaces';
import api from '@/services/api';

// Helper para verificar si es Usuario (no SuperAdmin)
const isUsuario = (user: any): user is Usuario => {
  return user && 'negocio' in user;
};

export default function ActivarCodigoPage() {
  const { user, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [planEnCola, setPlanEnCola] = useState<{
    planPendiente: string;
    fechaActivacion: string;
    planActual: string;
  } | null>(null);

  useEffect(() => {
    // Redirigir si no está autenticado
    if (!isLoading && !user) {
      router.push('/auth');
      return;
    }

    // Redirigir si es SuperAdmin
    if (user?.rol === 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    // 🔒 VALIDACIÓN CRÍTICA: Si aún no completó el onboarding, redirigir
    if (isUsuario(user) && user.primerLogin) {
      router.push('/onboarding');
      return;
    }

    // ✅ PERMITIR ACCESO: Usuarios con suscripción activa también pueden activar códigos
    // para renovar o cambiar de plan
  }, [user, isLoading, router]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isUsuario(user) && user.negocio?.estadoSuscripcion === 'ACTIVA' 
              ? 'Renovar o Cambiar Plan' 
              : 'Activa tu Suscripción'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bienvenido, <span className="font-medium">{isUsuario(user) ? user.negocio?.nombre : user?.email}</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {isUsuario(user) && user.negocio?.estadoSuscripcion === 'ACTIVA'
              ? 'Ingresa un código para renovar tu suscripción o cambiar de plan'
              : 'Ingresa tu código de activación para comenzar a usar el sistema'}
          </p>
        </div>

        {/* Banner informativo si ya tiene suscripción activa */}
        {isUsuario(user) && user.negocio?.estadoSuscripcion === 'ACTIVA' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  Ya tienes una suscripción activa
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Puedes ingresar un nuevo código para renovar o cambiar tu plan actual
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
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
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 text-center text-lg font-mono"
                disabled={isSubmitting}
                maxLength={20}
              />
              <p className="mt-2 text-xs text-gray-500 text-center">
                El código te fue proporcionado por el administrador
              </p>
            </div>

            {/* Mensajes */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <svg
                  className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && !planEnCola && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium">{success}</p>
                  <p className="text-xs mt-1">Redirigiendo al dashboard...</p>
                </div>
              </div>
            )}

            {/* Mensaje especial para plan en cola */}
            {success && planEnCola && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
                <div className="flex items-start mb-3">
                  <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-bold">📅 Plan Programado</p>
                    <p className="text-sm mt-1">{success}</p>
                  </div>
                </div>
                <div className="bg-blue-100 rounded-lg p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Plan actual:</span>
                    <span className="font-semibold text-blue-900">{planEnCola.planActual}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Plan programado:</span>
                    <span className="font-semibold text-blue-900">{planEnCola.planPendiente}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Fecha de activación:</span>
                    <span className="font-semibold text-blue-900">
                      {new Date(planEnCola.fechaActivacion).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-xs mt-3 text-blue-600 text-center">
                  El plan se activará automáticamente • Redirigiendo...
                </p>
              </div>
            )}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !codigo.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Activando...
                </>
              ) : (
                'Activar Código'
              )}
            </button>

            {/* Info adicional */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500">
                  ¿No tienes un código de activación?
                </p>
                <p className="text-xs text-gray-400">
                  Contacta al administrador del sistema para obtener uno
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              {isUsuario(user) && user.negocio?.estadoSuscripcion === 'ACTIVA' && (
                <button
                  type="button"
                  onClick={() => router.push('/dashboard-usuario')}
                  className="flex-1 text-sm text-gray-600 hover:text-gray-900 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150"
                >
                  Volver al Dashboard
                </button>
              )}
              <button
                type="button"
                onClick={logout}
                className={`${isUsuario(user) && user.negocio?.estadoSuscripcion === 'ACTIVA' ? 'flex-1' : 'w-full'} text-sm text-gray-600 hover:text-gray-900 transition duration-150`}
              >
                Cerrar sesión
              </button>
            </div>
          </form>
        </div>

        {/* Info sobre planes */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Tipos de códigos disponibles:
          </h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• <span className="font-medium">PRUEBA:</span> 7 días de prueba gratuita</li>
            <li>• <span className="font-medium">MENSUAL:</span> 1 mes de acceso</li>
            <li>• <span className="font-medium">TRIMESTRAL:</span> 3 meses de acceso</li>
            <li>• <span className="font-medium">SEMESTRAL:</span> 6 meses de acceso</li>
            <li>• <span className="font-medium">ANUAL:</span> 12 meses de acceso</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Usuario } from '@/interfaces';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

// Helper para verificar si es Usuario (no SuperAdmin)
const isUsuario = (user: any): user is Usuario => {
  return user && 'negocio' in user;
};

export default function DashboardUsuarioPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);

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

    // Redirigir si no tiene suscripción activa
    if (isUsuario(user)) {
      if (user.negocio?.estadoSuscripcion === 'SIN_SUSCRIPCION') {
        router.push('/activar-codigo');
        return;
      }

      if (user.negocio?.estadoSuscripcion === 'VENCIDA') {
        router.push('/activar-codigo?expired=true');
        return;
      }

      // Calcular días restantes
      if (user.negocio?.fechaVencimiento) {
        const fechaVenc = new Date(user.negocio.fechaVencimiento);
        const ahora = new Date();
        const diff = fechaVenc.getTime() - ahora.getTime();
        const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
        setDiasRestantes(dias);
      }
    }
  }, [user, isLoading, router]);

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

  if (!isUsuario(user)) {
    return null;
  }

  const estadoColor = {
    ACTIVA: 'bg-green-100 text-green-800 border-green-200',
    VENCIDA: 'bg-red-100 text-red-800 border-red-200',
    SIN_SUSCRIPCION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    BLOQUEADA: 'bg-gray-100 text-gray-800 border-gray-200',
    CANCELADA: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const estadoTexto = {
    ACTIVA: 'Suscripción Activa',
    VENCIDA: 'Suscripción Vencida',
    SIN_SUSCRIPCION: 'Sin Suscripción',
    BLOQUEADA: 'Cuenta Bloqueada',
    CANCELADA: 'Suscripción Cancelada',
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header con bienvenida */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            ¡Hola, {user.nombre}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gestiona tu negocio de forma simple y eficiente
          </p>
        </div>

        {/* Estado de Suscripción - Grid Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Card Estado */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Estado</h3>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0490C8]/10 flex items-center justify-center">
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6 text-[#0490C8]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border ${
                estadoColor[user.negocio?.estadoSuscripcion as keyof typeof estadoColor] ||
                'bg-gray-100 text-gray-800'
              }`}
            >
              {estadoTexto[user.negocio?.estadoSuscripcion as keyof typeof estadoTexto] ||
                user.negocio?.estadoSuscripcion}
            </div>
          </div>

          {/* Card Días Restantes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Días Restantes</h3>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0490C8]/10 flex items-center justify-center">
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6 text-[#0490C8]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            {diasRestantes !== null && diasRestantes > 0 ? (
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">{diasRestantes}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                  {diasRestantes === 1 ? 'día' : 'días'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No disponible</p>
            )}
          </div>

          {/* Card Fecha Vencimiento */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Vencimiento</h3>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0490C8]/10 flex items-center justify-center">
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6 text-[#0490C8]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            {user.negocio?.fechaVencimiento ? (
              <p className="text-sm sm:text-base font-semibold text-gray-900">
                {new Date(user.negocio.fechaVencimiento).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            ) : (
              <p className="text-sm text-gray-500">No disponible</p>
            )}
          </div>
        </div>

        {/* Alerta si está por vencer */}
        {diasRestantes !== null && diasRestantes > 0 && diasRestantes <= 7 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-bold text-yellow-900 mb-1">
                  ⏰ Tu suscripción está por vencer
                </h3>
                <p className="text-xs sm:text-sm text-yellow-800">
                  Te quedan <span className="font-bold">{diasRestantes}</span> {diasRestantes === 1 ? 'día' : 'días'}. 
                  Contacta al administrador para renovar tu suscripción y seguir disfrutando del servicio.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información del Negocio */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6 sm:mb-8 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0490C8]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Información del Negocio</h2>
                <p className="text-xs sm:text-sm text-gray-600">Detalles de tu empresa</p>
              </div>
            </div>
          </div>
          <div className="px-5 sm:px-6 py-5 sm:py-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-6 sm:gap-y-5">
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Nombre del Negocio
                </dt>
                <dd className="text-sm sm:text-base font-semibold text-gray-900">{user.negocio?.nombre}</dd>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Teléfono
                </dt>
                <dd className="text-sm sm:text-base font-semibold text-gray-900">{user.negocio?.telefono}</dd>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </dt>
                <dd className="text-sm sm:text-base font-semibold text-gray-900 break-all">{user.email}</dd>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  ID del Negocio
                </dt>
                <dd className="text-xs sm:text-sm font-mono font-semibold text-gray-900 break-all">{user.negocio?.id}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0490C8]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Próximamente</h2>
                <p className="text-xs sm:text-sm text-gray-600">Funciones en desarrollo</p>
              </div>
            </div>
          </div>
          <div className="px-5 sm:px-6 py-5 sm:py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card Citas */}
              <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 p-4 sm:p-6 hover:border-[#0490C8]/50 hover:from-[#0490C8]/5 hover:to-[#0490C8]/10 transition-all duration-300 cursor-not-allowed opacity-60">
                <div className="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 group-hover:text-[#0490C8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-700">Citas</span>
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    Pronto
                  </span>
                </div>
              </div>

              {/* Card Clientes */}
              <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 p-4 sm:p-6 hover:border-[#0490C8]/50 hover:from-[#0490C8]/5 hover:to-[#0490C8]/10 transition-all duration-300 cursor-not-allowed opacity-60">
                <div className="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 group-hover:text-[#0490C8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-700">Clientes</span>
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    Pronto
                  </span>
                </div>
              </div>

              {/* Card Servicios */}
              <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 p-4 sm:p-6 hover:border-[#0490C8]/50 hover:from-[#0490C8]/5 hover:to-[#0490C8]/10 transition-all duration-300 cursor-not-allowed opacity-60">
                <div className="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 group-hover:text-[#0490C8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-700">Servicios</span>
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    Pronto
                  </span>
                </div>
              </div>

              {/* Card Reportes */}
              <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 p-4 sm:p-6 hover:border-[#0490C8]/50 hover:from-[#0490C8]/5 hover:to-[#0490C8]/10 transition-all duration-300 cursor-not-allowed opacity-60">
                <div className="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 group-hover:text-[#0490C8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-700">Reportes</span>
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    Pronto
                  </span>
                </div>
              </div>
            </div>

            {/* Mensaje adicional */}
            <div className="mt-6 p-4 bg-gradient-to-r from-[#0490C8]/5 to-[#023664]/5 rounded-xl border border-[#0490C8]/20">
              <p className="text-xs sm:text-sm text-center text-gray-700">
                <span className="font-semibold">✨ Estamos trabajando para ti.</span> Estas funcionalidades estarán disponibles muy pronto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
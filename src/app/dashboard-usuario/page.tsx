'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Usuario } from '@/interfaces';

// Helper para verificar si es Usuario (no SuperAdmin)
const isUsuario = (user: any): user is Usuario => {
  return user && 'negocio' in user;
};

export default function DashboardUsuarioPage() {
  const { user, isLoading, logout } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.negocio?.nombre || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estado de Suscripción */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card Estado */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Estado</h3>
              <svg
                className="h-8 w-8 text-blue-600"
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
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                estadoColor[user.negocio?.estadoSuscripcion as keyof typeof estadoColor] ||
                'bg-gray-100 text-gray-800'
              }`}
            >
              {estadoTexto[user.negocio?.estadoSuscripcion as keyof typeof estadoTexto] ||
                user.negocio?.estadoSuscripcion}
            </div>
          </div>

          {/* Card Días Restantes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Días Restantes</h3>
              <svg
                className="h-8 w-8 text-blue-600"
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
            {diasRestantes !== null && diasRestantes > 0 ? (
              <div>
                <p className="text-3xl font-bold text-gray-900">{diasRestantes}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {diasRestantes === 1 ? 'día' : 'días'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No disponible</p>
            )}
          </div>

          {/* Card Fecha Vencimiento */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Vencimiento</h3>
              <svg
                className="h-8 w-8 text-blue-600"
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
            {user.negocio?.fechaVencimiento ? (
              <p className="text-sm font-medium text-gray-900">
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <svg
                className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Tu suscripción está por vencer
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Te quedan {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'}. Contacta al
                  administrador para renovar tu suscripción.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información del Negocio */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Información del Negocio</h2>
          </div>
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre del Negocio</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.negocio?.nombre}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.negocio?.telefono}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ID del Negocio</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{user.negocio?.id}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Próximamente</h2>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition duration-150 opacity-50 cursor-not-allowed">
                <svg
                  className="h-12 w-12 text-gray-400 mb-2"
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
                <span className="text-sm font-medium text-gray-600">Citas</span>
              </button>

              <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition duration-150 opacity-50 cursor-not-allowed">
                <svg
                  className="h-12 w-12 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-600">Clientes</span>
              </button>

              <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition duration-150 opacity-50 cursor-not-allowed">
                <svg
                  className="h-12 w-12 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-600">Servicios</span>
              </button>

              <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition duration-150 opacity-50 cursor-not-allowed">
                <svg
                  className="h-12 w-12 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-600">Reportes</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
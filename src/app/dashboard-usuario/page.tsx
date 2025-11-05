'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Usuario } from '@/interfaces';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UsageDashboard from '@/components/dashboard/UsageDashboard';
import LimitReachedModal from '@/components/dashboard/LimitReachedModal';
import { useTour } from '@/hooks/useTour';
import { TOURS } from '@/utils/tours';
import { DriveStep } from 'driver.js';
import HelpButton from '@/components/shared/HelpButton';

// Helper para verificar si es Usuario (no SuperAdmin)
const isUsuario = (user: any): user is Usuario => {
  return user && 'negocio' in user;
};

export default function DashboardUsuarioPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);
  
  // Estados para controlar los dropdowns
  const [suscripcionOpen, setSuscripcionOpen] = useState(true);
  const [negocioOpen, setNegocioOpen] = useState(true);
  const [usageOpen, setUsageOpen] = useState(true);

  // Definir pasos del tour general - simplificado
  const tourSteps: DriveStep[] = [
    {
      popover: {
        title: '¡Bienvenido a CitaYA! 👋',
        description: 'Te voy a mostrar las secciones principales para que empieces a gestionar tu negocio.',
      }
    },
    // Menú - Citas
    {
      element: '#menu-citas',
      popover: {
        title: '📅 Citas',
        description: 'Aquí podrás ver todas tus citas, crear nuevas y gestionar tu agenda diaria.',
        side: 'right',
      }
    },
    // Menú - Gestión del negocio (Servicios, Sucursales, Empleados, Clientes)
    {
      element: '#menu-servicios',
      popover: {
        title: '� Gestión del Negocio',
        description: 'En estas secciones configurarás tus servicios, sucursales, empleados y clientes. Todo lo necesario para que tu negocio funcione.',
        side: 'right',
      }
    },
    // Menú - Configuración
    {
      element: '#menu-configuracion',
      popover: {
        title: '⚙️ Configuración',
        description: 'Configura los datos básicos de tu negocio, link de agendamiento, notificaciones y mensajes personalizados.',
        side: 'right',
      }
    },
    // Menú - WhatsApp
    {
      element: '#menu-whatsapp',
      popover: {
        title: '💬 WhatsApp',
        description: 'Vincula tu número de WhatsApp para enviar notificaciones automáticas a tus clientes.',
        side: 'right',
      }
    },
    // Dashboard - Uso de Recursos
    {
      element: '#usage-dashboard',
      popover: {
        title: '📊 Uso de Recursos',
        description: 'Monitorea cuántas citas, clientes, empleados y servicios has creado según los límites de tu plan.',
        side: 'top',
      }
    },
    {
      popover: {
        title: '¡Listo para empezar! 🚀',
        description: '¡Ahora ya conoces las herramientas principales! Comienza a gestionar tu negocio con CitaYA.',
      }
    }
  ];

  // Activar tour automáticamente
  useTour({ 
    tourKey: TOURS.GENERAL, 
    steps: tourSteps,
    autoStart: true 
  });

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
        router.push('/dashboard-usuario/activar-codigo');
        return;
      }

      if (user.negocio?.estadoSuscripcion === 'VENCIDA') {
        router.push('/dashboard-usuario/activar-codigo?expired=true');
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
        <div id="dashboard-header" className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            ¡Hola, {user.nombre}! 👋
          </h1>
          <p className="text-sm text-gray-600">
            Gestiona tu negocio de forma simple y eficiente
          </p>
        </div>

        {/* 🎯 Banner de Plan Pendiente */}
        {user.negocio?.planPendiente && user.negocio?.fechaInicioPendiente && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500 text-white">
                    📅 PLAN PROGRAMADO
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  Tienes un plan {user.negocio.planPendiente.replace('_', ' ')} pendiente
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Se activará automáticamente el{' '}
                  <span className="font-bold text-blue-700">
                    {new Date(user.negocio.fechaInicioPendiente).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Tu plan actual permanecerá activo hasta que se active el nuevo plan</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estado de Suscripción - Con Dropdown */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-6 sm:mb-8 overflow-hidden">
          <button
            onClick={() => setSuscripcionOpen(!suscripcionOpen)}
            className="w-full p-5 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0490C8] bg-opacity-10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Estado de Suscripción</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Detalles de tu plan actual</p>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${suscripcionOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {suscripcionOpen && (
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-gray-100">
              <div id="suscripcion-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Card Estado */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Estado</p>
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    estadoColor[user.negocio?.estadoSuscripcion as keyof typeof estadoColor] ||
                    'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  {estadoTexto[user.negocio?.estadoSuscripcion as keyof typeof estadoTexto] ||
                    user.negocio?.estadoSuscripcion}
                </span>
              </div>
            </div>
          </div>

          {/* Card Días Restantes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Días Restantes</p>
                {diasRestantes !== null && diasRestantes > 0 ? (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-gray-900">{diasRestantes}</span>
                    <span className="text-sm text-gray-600">
                      {diasRestantes === 1 ? 'día' : 'días'}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">No disponible</p>
                )}
              </div>
            </div>
          </div>

          {/* Card Fecha Vencimiento */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-all sm:col-span-2 lg:col-span-1">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Vencimiento</p>
                {user.negocio?.fechaVencimiento ? (
                  <div className="space-y-0.5">
                    <p className="text-sm text-gray-900 font-semibold">
                      {new Date(user.negocio.fechaVencimiento).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(user.negocio.fechaVencimiento).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">No disponible</p>
                )}
              </div>
            </div>
          </div>
        </div>
            </div>
          )}
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
                <h3 className="text-sm font-bold text-yellow-900 mb-1">
                  ⏰ Tu suscripción está por vencer
                </h3>
                <p className="text-sm text-yellow-800">
                  Te quedan <span className="font-bold">{diasRestantes}</span> {diasRestantes === 1 ? 'día' : 'días'}. 
                  Contacta al administrador para renovar tu suscripción y seguir disfrutando del servicio.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información del Negocio - Con Dropdown */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-6 sm:mb-8 overflow-hidden">
          <div className="p-5 sm:p-6 flex items-center justify-between border-b border-gray-100">
            <button
              onClick={() => setNegocioOpen(!negocioOpen)}
              className="flex-1 flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-[#0490C8] bg-opacity-10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Información del Negocio</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Detalles de tu empresa</p>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${negocioOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => router.push('/dashboard-usuario/configuracion')}
              className="ml-3 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[#0490C8] hover:text-[#023664] bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
          </div>

          {negocioOpen && (
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre del Negocio */}
              <div className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nombre del Negocio</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user.negocio?.nombre}</p>
                  </div>
                </div>
              </div>

              {/* Teléfono */}
              <div className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Teléfono</p>
                    <p className="text-sm text-gray-900">{user.negocio?.telefono}</p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm text-gray-900 break-all">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* ID del Negocio */}
              <div className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">ID del Negocio</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-900 break-all flex-1">{user.negocio?.id}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(user.negocio?.id || '');
                          // Opcional: mostrar toast de copiado
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                        title="Copiar ID"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>

        {/* Dashboard de uso de recursos - Con Dropdown */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-6 sm:mb-8 overflow-hidden">
          <button
            onClick={() => setUsageOpen(!usageOpen)}
            className="w-full p-5 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0490C8] bg-opacity-10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Uso de Recursos</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Monitorea el uso de tu plan</p>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${usageOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {usageOpen && (
            <div id="usage-dashboard" className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-gray-100">
              <div className="mt-4">
                <UsageDashboard />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de límite alcanzado (se muestra globalmente) */}
      <LimitReachedModal />
      
      {/* Botón de ayuda flotante */}
      <HelpButton tourKey={TOURS.GENERAL} tooltip="Ver tour guiado nuevamente" />
    </DashboardLayout>
  );
}

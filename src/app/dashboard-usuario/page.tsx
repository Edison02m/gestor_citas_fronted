'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Cita, EstadoCita, Usuario } from '@/interfaces';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UsageDashboard from '@/components/dashboard/UsageDashboard';
import LimitReachedModal from '@/components/dashboard/LimitReachedModal';
import { useTour } from '@/hooks/useTour';
import { TOURS } from '@/utils/tours';
import { DriveStep } from 'driver.js';
import HelpButton from '@/components/shared/HelpButton';
import CitasService from '@/services/citas.service';
import { formatDateInput } from '@/utils/format';

// Helper para verificar si es Usuario (no SuperAdmin)
const isUsuario = (user: any): user is Usuario => {
  return user && 'negocio' in user;
};

export default function DashboardUsuarioPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);
  const [citasHoy, setCitasHoy] = useState<Cita[]>([]);
  const [citasLoading, setCitasLoading] = useState<boolean>(false);
  const [changingStatusCitaId, setChangingStatusCitaId] = useState<string | null>(null);
  
  // Estados para controlar los dropdowns
  const [resumenOpen, setResumenOpen] = useState(true);
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
        title: ' Citas',
        description: 'Aquí podrás ver todas tus citas, crear nuevas y gestionar tu agenda diaria.',
        side: 'right',
      }
    },
    // Menú - Gestión del negocio (Servicios, Sucursales, Empleados, Clientes)
    {
      element: '#menu-servicios',
      popover: {
        title: ' Gestión del Negocio',
        description: 'En estas secciones configurarás tus servicios, sucursales, empleados y clientes. Todo lo necesario para que tu negocio funcione.',
        side: 'right',
      }
    },
    // Menú - Configuración
    {
      element: '#menu-configuracion',
      popover: {
        title: ' Configuración',
        description: 'Configura los datos básicos de tu negocio, link de agendamiento, notificaciones',
        side: 'right',
      }
    },
    // Menú - WhatsApp
    {
      element: '#menu-whatsapp',
      popover: {
        title: ' WhatsApp',
        description: 'Vincula tu número de WhatsApp para enviar notificaciones automáticas a tus clientes y mensajes personalizados.',
        side: 'right',
      }
    },
    // Dashboard - Uso de Recursos
    {
      element: '#usage-dashboard',
      popover: {
        title: ' Uso de Recursos',
        description: 'Monitorea cuántas citas, clientes, empleados y servicios has creado según los límites de tu plan.',
        side: 'top',
      }
    },
    {
      popover: {
        title: '¡Listo para empezar! ',
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
        router.push('/dashboard-usuario/perfil');
        return;
      }

      if (user.negocio?.estadoSuscripcion === 'VENCIDA') {
        router.push('/dashboard-usuario/perfil?expired=true');
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

  const loadCitasHoy = useCallback(async () => {
    if (!isUsuario(user)) {
      setCitasHoy([]);
      return;
    }

    setCitasLoading(true);
    try {
      const hoy = formatDateInput(new Date());
      const citas = await CitasService.getCitasPorFecha(hoy);
      const ordenadas = [...citas].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
      setCitasHoy(ordenadas);
    } catch (error) {
      console.error('Error al cargar las citas del día:', error);
      setCitasHoy([]);
    } finally {
      setCitasLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCitasHoy();
  }, [loadCitasHoy]);

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
    ACTIVA: 'bg-green-100 text-green-800 border border-green-200',
    VENCIDA: 'bg-red-100 text-red-800 border border-red-200',
    SIN_SUSCRIPCION: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    BLOQUEADA: 'bg-gray-100 text-gray-800 border border-gray-200',
    CANCELADA: 'bg-gray-100 text-gray-800 border border-gray-200',
  };

  const estadoTexto = {
    ACTIVA: 'Suscripción Activa',
    VENCIDA: 'Suscripción Vencida',
    SIN_SUSCRIPCION: 'Sin Suscripción',
    BLOQUEADA: 'Cuenta Bloqueada',
    CANCELADA: 'Suscripción Cancelada',
  };

  const getEstadoBadgeStyles = (estado: EstadoCita) => {
    switch (estado) {
      case EstadoCita.PENDIENTE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case EstadoCita.CONFIRMADA:
        return 'bg-green-100 text-green-800 border-green-200';
      case EstadoCita.COMPLETADA:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case EstadoCita.CANCELADA:
        return 'bg-red-100 text-red-800 border-red-200';
      case EstadoCita.NO_ASISTIO:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoLabel = (estado: EstadoCita) => {
    switch (estado) {
      case EstadoCita.PENDIENTE:
        return 'Pendiente';
      case EstadoCita.CONFIRMADA:
        return 'Confirmada';
      case EstadoCita.COMPLETADA:
        return 'Completada';
      case EstadoCita.CANCELADA:
        return 'Cancelada';
      case EstadoCita.NO_ASISTIO:
        return 'No asistió';
      default:
        return estado;
    }
  };

  const handleEstadoChange = async (citaId: string, nuevoEstado: EstadoCita) => {
    const citaActual = citasHoy.find((cita) => cita.id === citaId);
    if (!citaActual || citaActual.estado === nuevoEstado) {
      return;
    }

    setChangingStatusCitaId(citaId);
    try {
      const citaActualizada = await CitasService.cambiarEstado(citaId, nuevoEstado);
      const citaConRelaciones = {
        ...citaActual,
        ...citaActualizada,
        estado: citaActualizada?.estado ?? nuevoEstado,
      };

      setCitasHoy((prev) =>
        prev.map((cita) => (cita.id === citaId ? citaConRelaciones : cita))
      );
    } catch (error) {
      console.error('Error al actualizar el estado de la cita:', error);
    } finally {
      setChangingStatusCitaId(null);
    }
  };

  const estadosDisponibles: EstadoCita[] = [
    EstadoCita.PENDIENTE,
    EstadoCita.CONFIRMADA,
    EstadoCita.COMPLETADA,
    EstadoCita.CANCELADA,
    EstadoCita.NO_ASISTIO,
  ];

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

        {/* Resumen de Suscripción e Información del Negocio */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-6 sm:mb-8 overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-5 gap-3">
            <button
              onClick={() => setResumenOpen(!resumenOpen)}
              className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#0490C8] bg-opacity-10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Suscripción e Información del Negocio</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Estado actual y datos clave del negocio</p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${resumenOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => router.push('/dashboard-usuario/configuracion')}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[#0490C8] hover:text-[#023664] bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          </div>

          {resumenOpen && (
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100">
              <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
                <section className="flex-1 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Estado de Suscripción</p>
                        <span
                          className={`mt-1 inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-sm font-semibold ${
                            estadoColor[user.negocio?.estadoSuscripcion as keyof typeof estadoColor] ||
                            'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                        >
                          {estadoTexto[user.negocio?.estadoSuscripcion as keyof typeof estadoTexto] ||
                            user.negocio?.estadoSuscripcion}
                        </span>
                      </div>
                      {diasRestantes !== null && diasRestantes > 0 && (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {diasRestantes} {diasRestantes === 1 ? 'día restante' : 'días restantes'}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Días restantes</p>
                        {diasRestantes !== null && diasRestantes > 0 ? (
                          <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold text-gray-900">{diasRestantes}</span>
                            <span className="text-xs text-gray-600">{diasRestantes === 1 ? 'día' : 'días'}</span>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-gray-700">No disponible</p>
                        )}
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Vencimiento</p>
                        {user.negocio?.fechaVencimiento ? (
                          <div className="mt-2 space-y-1">
                            <p className="text-sm font-semibold text-gray-900">
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
                          <p className="mt-2 text-sm text-gray-700">No disponible</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="flex-1 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Información del Negocio</p>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Nombre</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900 truncate">{user.negocio?.nombre}</p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Teléfono</p>
                      <p className="mt-2 text-sm text-gray-900">{user.negocio?.telefono}</p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="mt-2 text-sm text-gray-900 break-all">{user.email}</p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">ID del Negocio</p>
                      <div className="mt-2 flex items-center gap-2">
                        <p className="text-xs text-gray-900 break-all flex-1">{user.negocio?.id}</p>
                        <button
                          onClick={() => navigator.clipboard.writeText(user.negocio?.id || '')}
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
                </section>
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

        {/* Citas de Hoy */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-6 sm:mb-8 overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Citas de Hoy</h2>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200">
                {citasHoy.length} {citasHoy.length === 1 ? 'cita' : 'citas'}
              </span>
              {citasHoy.length > 4 && (
                <span className="text-[11px] text-gray-500">Desplázate para ver citas adicionales</span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100">
            {citasLoading ? (
              <div className="p-4 sm:p-5">
                <div className="space-y-3 animate-pulse">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-1.5 h-16 rounded-full bg-gray-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-100 rounded" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : citasHoy.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-500">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">No hay citas programadas hoy</h3>
                <p className="text-xs text-gray-500">Tu agenda está libre por ahora.</p>
              </div>
            ) : (
              <div className="p-4 sm:p-5">
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {citasHoy.map((cita) => (
                    <div
                      key={cita.id}
                      className="flex rounded-2xl border border-gray-200 hover:border-gray-300 transition-all bg-white shadow-sm"
                    >
                      <div
                        className="w-1.5 flex-shrink-0 rounded-l-2xl"
                        style={{ backgroundColor: cita.servicio?.color || '#0490C8' }}
                      />
                      <div className="flex-1 p-3 sm:p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-900">
                            <span>{cita.horaInicio}</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>{cita.horaFin}</span>
                          </div>
                          <div className="relative">
                            <select
                              value={cita.estado}
                              onChange={(e) => handleEstadoChange(cita.id, e.target.value as EstadoCita)}
                              disabled={changingStatusCitaId === cita.id}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all appearance-none pr-6 ${
                                getEstadoBadgeStyles(cita.estado)
                              } ${
                                changingStatusCitaId === cita.id
                                  ? 'opacity-60 cursor-wait'
                                  : 'cursor-pointer hover:border-gray-300'
                              }`}
                            >
                              {estadosDisponibles.map((estado) => (
                                <option key={estado} value={estado} className="text-gray-900">
                                  {getEstadoLabel(estado)}
                                </option>
                              ))}
                            </select>
                            <svg
                              className="w-3 h-3 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            {changingStatusCitaId === cita.id && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3.5 h-3.5 border-[1.5px] border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {cita.cliente?.nombre || 'Cliente sin nombre'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 flex flex-wrap items-center gap-1">
                            <span>{cita.servicio?.nombre || 'Servicio sin nombre'}</span>
                            {cita.empleado?.nombre && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span>{cita.empleado.nombre}</span>
                              </>
                            )}
                            {cita.sucursal?.nombre && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span>{cita.sucursal.nombre}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
            <div id="usage-dashboard" className="px-5 sm:px-6 pb-5 sm:pb-6 pt-4 sm:pt-5 border-t border-gray-100">
              <UsageDashboard variant="embedded" />
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

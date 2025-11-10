'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import EditarPerfilModal from '@/components/perfil/EditarPerfilModal';
import CambiarPasswordModal from '@/components/perfil/CambiarPasswordModal';
import api from '@/services/api';
import planesService from '@/services/planes.service';
import { Plan } from '@/interfaces';

function PerfilPageContent() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUsuario = (user: any): user is any => user && 'negocio' in user;

  // Estados para activar código
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

  // Estados para modales de edición
  const [isEditarPerfilOpen, setIsEditarPerfilOpen] = useState(false);
  const [isCambiarPasswordOpen, setIsCambiarPasswordOpen] = useState(false);

  // Estados para planes dinámicos
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);

  // Detectar si viene de una suscripción vencida
  useEffect(() => {
    const expired = searchParams.get('expired') === 'true';
    const estadoVencido = user && isUsuario(user) && (user as any).negocio?.estadoSuscripcion === 'VENCIDA';
    setSuscripcionVencida(expired || !!estadoVencido);
  }, [searchParams, user]);

  // Cargar planes disponibles desde el backend
  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = async () => {
    try {
      setLoadingPlanes(true);
      const response = await planesService.getPlanesDisponibles();
      setPlanes(response.data);
    } catch (error) {
      console.error('Error al cargar planes:', error);
    } finally {
      setLoadingPlanes(false);
    }
  };

  if (!isUsuario(user) || !user) return null;

  const usuarioData = user as any;

  // Calcular días restantes
  const calcularDiasRestantes = () => {
    if (!usuarioData.negocio?.fechaVencimiento) return null;
    const fechaVenc = new Date(usuarioData.negocio.fechaVencimiento);
    const ahora = new Date();
    const diff = fechaVenc.getTime() - ahora.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const diasRestantes = calcularDiasRestantes();

  // Mapeo de estados a colores y textos
  const estadoConfig = {
    ACTIVA: {
      color: 'bg-green-100 text-green-800 border-green-200',
      texto: 'Activa',
      icono: '✓'
    },
    VENCIDA: {
      color: 'bg-red-100 text-red-800 border-red-200',
      texto: 'Vencida',
      icono: '⚠'
    },
    SIN_SUSCRIPCION: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      texto: 'Sin Suscripción',
      icono: '!'
    }
  };

  const estadoActual = usuarioData.negocio?.estadoSuscripcion || 'SIN_SUSCRIPCION';
  const estadoInfo = estadoConfig[estadoActual as keyof typeof estadoConfig] || estadoConfig.SIN_SUSCRIPCION;

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
          enCola?: boolean;
          planActual?: string;
          planPendiente?: string;
          fechaActivacionPendiente?: string;
        };
      }>('/suscripciones/activar-codigo', { codigo: codigo.trim() });

      setSuccess(response.message);

      if (response.data.enCola) {
        setPlanEnCola({
          planPendiente: response.data.planPendiente || '',
          fechaActivacion: response.data.fechaActivacionPendiente || '',
          planActual: response.data.planActual || '',
        });
      }

      await refreshUser();
      setCodigo('');

      // Limpiar mensajes después de 5 segundos
      setTimeout(() => {
        setSuccess('');
        setPlanEnCola(null);
      }, 5000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al activar código');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0490C8] bg-opacity-10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mi Cuenta</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Gestiona tu información y suscripción</p>
            </div>
          </div>
        </div>

        {/* Grid 2 columnas: Datos Usuario + Plan Actual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Columna Izquierda: Información de la Cuenta */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Datos del Usuario
              </h3>
              <button
                onClick={() => setIsEditarPerfilOpen(true)}
                className="text-[#0490C8] hover:text-[#037aa8] text-sm font-medium flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</label>
                <p className="text-sm text-gray-900 mt-1 font-medium">{usuarioData.nombre}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                <p className="text-sm text-gray-900 mt-1">{usuarioData.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rol</label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {usuarioData.rol === 'ADMIN_NEGOCIO' ? 'Administrador' : usuarioData.rol}
                  </span>
                </div>
              </div>
              
              {/* Botón para cambiar contraseña */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => setIsCambiarPasswordOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0490C8] transition duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Cambiar Contraseña
                </button>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Plan Actual */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Suscripción Actual
            </h3>
            <div className="space-y-4">
              {/* Estado */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${estadoInfo.color}`}>
                    <span>{estadoInfo.icono}</span>
                    {estadoInfo.texto}
                  </span>
                </div>
              </div>

              {/* Plan */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Plan</label>
                <div className="mt-1 flex items-center gap-2">
                  {usuarioData.negocio?.planActual ? (
                    <>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        usuarioData.negocio.planActual.includes('PLUS') ? 'bg-[#0490C8]' : 'bg-gray-800'
                      }`}>
                        <span className="text-white text-[10px] font-bold">
                          {usuarioData.negocio.planActual.includes('PLUS') ? 'PRO+' : 
                           usuarioData.negocio.planActual.includes('PRO') ? 'PRO' : 
                           usuarioData.negocio.planActual}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900 font-medium">
                        {usuarioData.negocio.planActual.replace('_', ' ')}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Sin plan activo</span>
                  )}
                </div>
              </div>

              {/* Fecha de Vencimiento */}
              {usuarioData.negocio?.fechaVencimiento && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vence el</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(usuarioData.negocio.fechaVencimiento).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* Días Restantes */}
              {diasRestantes !== null && usuarioData.negocio?.estadoSuscripcion === 'ACTIVA' && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Días Restantes</label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                      diasRestantes <= 7 ? 'bg-red-50 text-red-700' :
                      diasRestantes <= 30 ? 'bg-yellow-50 text-yellow-700' :
                      'bg-green-50 text-green-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold">{diasRestantes} {diasRestantes === 1 ? 'día' : 'días'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-full space-y-6">

          {/* Sección de Activar Código */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">
                {usuarioData.negocio?.estadoSuscripcion === 'ACTIVA' 
                  ? 'Renovar o Cambiar Plan' 
                  : 'Activar Código'}
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {usuarioData.negocio?.estadoSuscripcion === 'ACTIVA'
                ? 'Ingresa un código para renovar tu suscripción o cambiar de plan'
                : 'Activa tu suscripción con un código de activación'}
            </p>

            {/* 🚨 Banner de Suscripción Vencida */}
            {suscripcionVencida && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Tu suscripción ha vencido
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        Para continuar usando todas las funcionalidades de CitaYA, activa un nuevo código o renueva tu plan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Banner informativo si ya tiene suscripción activa */}
            {usuarioData.negocio?.estadoSuscripcion === 'ACTIVA' && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-blue-800">
                  Ya tienes una suscripción activa. Puedes ingresar un nuevo código para renovar o cambiar tu plan.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition duration-150 text-center text-base font-mono"
                  disabled={isSubmitting}
                  maxLength={20}
                />
                <p className="mt-2 text-xs text-gray-500 text-center">
                  El código te fue proporcionado por el administrador
                </p>
              </div>

              {/* Mensajes */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <svg className="h-4 w-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-red-700">{error}</span>
                </div>
              )}

              {success && !planEnCola && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-green-800">{success}</span>
                </div>
              )}

              {/* Mensaje especial para plan en cola */}
              {success && planEnCola && (
                <div className="p-3 bg-blue-50 rounded-lg space-y-1">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-blue-800 font-semibold">Plan programado: {planEnCola.planPendiente}</span>
                  </div>
                  <p className="text-xs text-blue-700 pl-6">
                    Actual: {planEnCola.planActual} | Activa el: {new Date(planEnCola.fechaActivacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
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
            </form>
          </div>

          {/* Info sobre planes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Planes Disponibles
            </h3>
            
            {loadingPlanes ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#0490C8]"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Plan PRO - Datos dinámicos */}
                  {(() => {
                    const planPro = planes.find(p => p.id.startsWith('PRO_') && !p.id.startsWith('PRO_PLUS'));
                    if (!planPro) return null;

                    return (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">PRO</span>
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-gray-900">Plan PRO</h4>
                            <p className="text-xs text-gray-600">Para negocios en crecimiento</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          {planPro.limiteSucursales && planPro.limiteSucursales !== 'ilimitado' && (
                            <div className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-gray-700">Hasta {planPro.limiteSucursales} sucursales</span>
                            </div>
                          )}
                          {planPro.limiteEmpleados && planPro.limiteEmpleados !== 'ilimitado' && (
                            <div className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-gray-700">Hasta {planPro.limiteEmpleados} empleados</span>
                            </div>
                          )}
                          {planPro.limiteServicios && planPro.limiteServicios !== 'ilimitado' && (
                            <div className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-gray-700">Hasta {planPro.limiteServicios} servicios</span>
                            </div>
                          )}
                          {planPro.limiteClientes && planPro.limiteClientes !== 'ilimitado' && (
                            <div className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-gray-700">Hasta {planPro.limiteClientes} clientes</span>
                            </div>
                          )}
                          {(!planPro.limiteCitasMes || planPro.limiteCitasMes === 'ilimitado') && (
                            <div className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-gray-700">Citas ilimitadas al mes</span>
                            </div>
                          )}
                          {planPro.limiteWhatsAppMes && planPro.limiteWhatsAppMes !== 'ilimitado' && (
                            <div className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-gray-700">{planPro.limiteWhatsAppMes} mensajes WhatsApp/mes</span>
                            </div>
                          )}
                          {planPro.reportesAvanzados && (
                            <div className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-gray-700">Reportes avanzados incluidos</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Plan PRO PLUS - Datos dinámicos */}
                  {(() => {
                    const planProPlus = planes.find(p => p.id.startsWith('PRO_PLUS'));
                    if (!planProPlus) return null;

                    return (
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-[#0490C8]">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0490C8] flex items-center justify-center">
                            <span className="text-white text-sm font-bold">PRO+</span>
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-gray-900">Plan PRO PLUS</h4>
                            <p className="text-xs text-[#0490C8] font-medium">Para negocios profesionales</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-[#0490C8] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-gray-700 font-semibold">¡Todo Ilimitado!</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-[#0490C8] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-gray-700">Sucursales ilimitadas</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-[#0490C8] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-gray-700">Empleados ilimitados</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-[#0490C8] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-gray-700">Servicios ilimitados</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-[#0490C8] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-gray-700">Clientes ilimitados</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-[#0490C8] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-gray-700">WhatsApp y emails ilimitados</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-[#0490C8] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-gray-700">Reportes avanzados y exportación</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-[#0490C8] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-gray-700">Soporte prioritario 24/7</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}

            {/* Nota sobre acumulación */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Acumulación Inteligente</p>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    • Los códigos de <span className="font-medium">igual o mayor nivel</span> se suman automáticamente al tiempo restante<br/>
                    • Los planes <span className="font-medium">inferiores</span> se guardan en cola y se activan automáticamente al vencer el plan actual<br/>
                    • Solo puedes tener <span className="font-medium">1 plan en cola</span> a la vez
                  </p>
                </div>
              </div>
            </div>

            {/* CTA para contactar */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                ¿Necesitas más información? Contacta al administrador para obtener tu código de activación
              </p>
            </div>
          </div>
        </div>

        {/* Modales */}
        <EditarPerfilModal
          isOpen={isEditarPerfilOpen}
          onClose={() => setIsEditarPerfilOpen(false)}
          currentNombre={usuarioData.nombre}
          currentEmail={usuarioData.email}
          onSuccess={async () => {
            await refreshUser();
          }}
        />

        <CambiarPasswordModal
          isOpen={isCambiarPasswordOpen}
          onClose={() => setIsCambiarPasswordOpen(false)}
          onSuccess={() => {
            // Opcional: podrías cerrar sesión o mostrar un mensaje
          }}
        />
      </div>
    </DashboardLayout>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <PerfilPageContent />
    </Suspense>
  );
}

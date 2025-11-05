'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import whatsappService, { WhatsAppStatusResponse } from '@/services/whatsapp.service';
import negocioService from '@/services/negocio.service';

export default function WhatsAppPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [estado, setEstado] = useState<WhatsAppStatusResponse | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  const [formMensajes, setFormMensajes] = useState({
    mensajeRecordatorio: '',
    mensajeReagendamiento: '',
  });

  useEffect(() => {
    if (user) {
      cargarEstado();
      cargarConfiguracionNegocio();
    }
  }, [user]);

  const cargarConfiguracionNegocio = async () => {
    try {
      const data = await negocioService.obtenerNegocio();
      setFormMensajes({
        mensajeRecordatorio: data.mensajeRecordatorio || '',
        mensajeReagendamiento: data.mensajeReagendamiento || '',
      });
    } catch (err: any) {
      console.error('Error al cargar configuración:', err);
    }
  };

  // Auto-ocultar mensajes después de 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-refresh del estado cada 10 segundos cuando hay QR activo
  useEffect(() => {
    if (qrCode && !estado?.connected) {
      const interval = setInterval(() => {
        cargarEstado();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [qrCode, estado?.connected]);

  const cargarEstado = async () => {
    try {
      setLoading(true);
      const data = await whatsappService.obtenerEstado();
      setEstado(data);
      
      // Si ya está conectado, limpiar QR
      if (data.connected) {
        setQrCode(null);
        if (success === '') {
          // Solo mostrar éxito si no hay otro mensaje
          setSuccess('WhatsApp conectado correctamente');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el estado');
    } finally {
      setLoading(false);
    }
  };

  const handleVincular = async () => {
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      
      const data = await whatsappService.vincular();
      setQrCode(data.qrCode);
      setSuccess('Escanea el código QR con tu WhatsApp');
      
      // Recargar estado
      await cargarEstado();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al vincular WhatsApp');
    } finally {
      setProcessing(false);
    }
  };

  const handleObtenerNuevoQR = async () => {
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      
      const data = await whatsappService.obtenerQR();
      setQrCode(data.qrCode);
      setSuccess('Nuevo código QR generado');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener QR');
    } finally {
      setProcessing(false);
    }
  };

  const handleDesvincular = async () => {
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      
      await whatsappService.desvincular();
      setQrCode(null);
      setSuccess('WhatsApp desvinculado correctamente');
      setShowConfirmDisconnect(false);
      
      // Recargar estado
      await cargarEstado();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al desvincular WhatsApp');
    } finally {
      setProcessing(false);
    }
  };

  const handleGuardarMensajes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await negocioService.actualizarMensajesWhatsApp({
        mensajeRecordatorio: formMensajes.mensajeRecordatorio,
        mensajeReagendamiento: formMensajes.mensajeReagendamiento,
      });
      
      setSuccess('Mensajes de WhatsApp actualizados correctamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar los mensajes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-[#0490C8] mx-auto"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">Cargando configuración de WhatsApp...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Configuración de WhatsApp
          </h1>
          <p className="mt-1 text-sm text-gray-600">Vincula tu WhatsApp Business para enviar notificaciones automáticas</p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800 font-medium flex-1">{error}</p>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-800 font-medium flex-1">{success}</p>
              <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Card Principal Unificado */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header con Estado de Conexión */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    {estado?.connected ? 'WhatsApp Conectado' : 'WhatsApp No Conectado'}
                    {estado?.connected && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        Activo
                      </span>
                    )}
                  </h2>
                  <div className="mt-1.5 space-y-0.5">
                    {estado?.phoneNumber && (
                      <p className="text-xs text-gray-600 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {estado.phoneNumber}
                      </p>
                    )}
                    {estado?.configuredAt && (
                      <p className="text-xs text-gray-500">
                        Vinculado el {new Date(estado.configuredAt).toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {estado?.connected ? (
                  <button
                    onClick={() => setShowConfirmDisconnect(true)}
                    disabled={processing}
                    className="px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Desvincular
                  </button>
                ) : (
                  <button
                    onClick={handleVincular}
                    disabled={processing}
                    className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Vincular WhatsApp
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Código QR */}
          {qrCode && !estado?.connected && (
            <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
              <div className="max-w-md mx-auto text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Escanea el código QR</h3>
                <div className="bg-white p-6 rounded-2xl shadow-lg inline-block mb-4">
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp" 
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <div className="space-y-3 text-sm text-gray-700 mb-4">
                  <p className="flex items-center justify-center gap-2">
                    <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    Abre WhatsApp en tu teléfono
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    Ve a <strong>Configuración → Dispositivos vinculados</strong>
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    Toca <strong>Vincular dispositivo</strong> y escanea este código
                  </p>
                </div>
                <button
                  onClick={handleObtenerNuevoQR}
                  disabled={processing}
                  className="text-sm text-[#0490C8] hover:text-[#037ab0] font-semibold flex items-center gap-2 mx-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generar nuevo código QR
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  El estado se actualiza automáticamente cada 10 segundos
                </p>
              </div>
            </div>
          )}

          {/* Beneficios - Solo si no está conectado */}
          {!qrCode && !estado?.connected && (
            <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Beneficios de vincular WhatsApp</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Confirmación automática</p>
                    <p className="text-xs text-gray-600">WhatsApp al agendar</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Recordatorios</p>
                    <p className="text-xs text-gray-600">Antes de cada cita</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Menos ausencias</p>
                    <p className="text-xs text-gray-600">Clientes informados</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">100% automático</p>
                    <p className="text-xs text-gray-600">Sin intervención manual</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info de seguridad - Más sutil */}
          {!estado?.connected && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center gap-2 justify-center text-xs text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Conexión segura con cifrado de extremo a extremo</span>
              </div>
            </div>
          )}

          {/* Configuración de Mensajes - Integrada en el mismo card */}
          {estado?.connected && (
            <>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0490C8] rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900">Personaliza tus Mensajes</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Configura los mensajes automáticos que se enviarán a tus clientes
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleGuardarMensajes} className="p-6 space-y-4 bg-white">
                {/* Sección de variables - dropdown colapsable */}
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowVariables(!showVariables)}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg 
                        className={`w-4 h-4 text-gray-600 transition-transform ${showVariables ? 'rotate-90' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <h3 className="text-sm font-bold text-gray-900">Variables disponibles</h3>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {showVariables ? 'Ocultar' : 'Mostrar'}
                    </span>
                  </button>
                  
                  {showVariables && (
                    <div className="px-4 pb-4 border-t border-gray-200 bg-white">
                      <p className="text-xs text-gray-600 mb-3 mt-3">
                        Usa estas variables en tus mensajes. <span className="font-semibold text-gray-900">Se reemplazan automáticamente</span> con los datos reales de cada cita.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                        <div className="flex items-start gap-2">
                          <code className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono flex-shrink-0">{'{cliente}'}</code>
                          <p className="text-xs text-gray-600 mt-0.5">Nombre completo del cliente</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono flex-shrink-0">{'{fecha}'}</code>
                          <p className="text-xs text-gray-600 mt-0.5">Fecha de la cita (Ej: Lunes 5 de Noviembre, 2025)</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono flex-shrink-0">{'{hora_inicio}'}</code>
                          <p className="text-xs text-gray-600 mt-0.5">Hora de inicio (Ej: 10:00)</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono flex-shrink-0">{'{hora_fin}'}</code>
                          <p className="text-xs text-gray-600 mt-0.5">Hora de finalización (Ej: 11:00)</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono flex-shrink-0">{'{servicio}'}</code>
                          <p className="text-xs text-gray-600 mt-0.5">Nombre del servicio contratado</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono flex-shrink-0">{'{empleado}'}</code>
                          <p className="text-xs text-gray-600 mt-0.5">Nombre del profesional asignado</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono flex-shrink-0">{'{sucursal}'}</code>
                          <p className="text-xs text-gray-600 mt-0.5">Nombre de la sucursal</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono flex-shrink-0">{'{direccion}'}</code>
                          <p className="text-xs text-gray-600 mt-0.5">Dirección completa de la sucursal</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono flex-shrink-0">{'{ciudad}'}</code>
                          <p className="text-xs text-gray-600 mt-0.5">Ciudad de la sucursal</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono flex-shrink-0">{'{telefono_sucursal}'}</code>
                          <p className="text-xs text-gray-600 mt-0.5">Teléfono de contacto</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono flex-shrink-0">{'{maps}'}</code>
                          <p className="text-xs text-gray-600 mt-0.5">Enlace a Google Maps</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono flex-shrink-0">{'{negocio}'}</code>
                          <p className="text-xs text-gray-600 mt-0.5">Nombre de tu negocio</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono flex-shrink-0">{'{precio}'}</code>
                          <p className="text-xs text-gray-600 mt-0.5">Precio del servicio</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Grid de 2 columnas para los mensajes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Mensaje al agendar */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mensaje al agendar cita
                    </label>
                    <textarea
                      value={formMensajes.mensajeRecordatorio}
                      onChange={(e) => setFormMensajes({ ...formMensajes, mensajeRecordatorio: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent font-mono text-sm transition-all text-gray-900 placeholder-gray-400 bg-white"
                      rows={7}
                      placeholder="Hola {cliente}, tu cita ha sido agendada para el {fecha} a las {hora_inicio} en {negocio}. ¡Te esperamos!"
                    />
                    {/* Botones de plantillas */}
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-600 font-medium mr-1">Plantillas:</span>
                      <button
                        type="button"
                        onClick={() => setFormMensajes({
                          ...formMensajes,
                          mensajeRecordatorio: '¡Hola {cliente}! 👋\n\nTu cita ha sido confirmada:\n\n📅 {fecha}\n⏰ {hora_inicio} - {hora_fin}\n💇 {servicio}\n👤 {empleado}\n📍 {sucursal}\n\n¡Te esperamos!'
                        })}
                        className="text-xs px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-all"
                      >
                        Simple
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormMensajes({
                          ...formMensajes,
                          mensajeRecordatorio: '✨ ¡Hola {cliente}!\n\nTu cita está confirmada en {negocio}:\n\n� Fecha: {fecha}\n⏰ Horario: {hora_inicio} a {hora_fin}\n💇 Servicio: {servicio}\n👤 Profesional: {empleado}\n📍 Ubicación: {sucursal}\n{direccion}, {ciudad}\n\n📞 Contacto: {telefono_sucursal}\n🗺️ Ver mapa: {maps}\n\n¡Nos vemos pronto! 😊'
                        })}
                        className="text-xs px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-all"
                      >
                        Completa
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormMensajes({
                          ...formMensajes,
                          mensajeRecordatorio: 'Hola {cliente},\n\nConfirmamos tu cita:\n• Servicio: {servicio}\n• Fecha: {fecha}\n• Hora: {hora_inicio}\n• Con: {empleado}\n• Lugar: {sucursal}\n\n{negocio}\n{telefono_sucursal}'
                        })}
                        className="text-xs px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-all"
                      >
                        Profesional
                      </button>
                    </div>
                  </div>

                  {/* Mensaje de recordatorio */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mensaje de Recordatorio
                    </label>
                    <textarea
                      value={formMensajes.mensajeReagendamiento}
                      onChange={(e) => setFormMensajes({ ...formMensajes, mensajeReagendamiento: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent font-mono text-sm transition-all text-gray-900 placeholder-gray-400 bg-white"
                      rows={7}
                      placeholder="Hola {cliente}, te recordamos tu cita para el {fecha} a las {hora_inicio} en {negocio}. ¡Te esperamos!"
                    />
                    {/* Botones de plantillas */}
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-600 font-medium mr-1">Plantillas:</span>
                      <button
                        type="button"
                        onClick={() => setFormMensajes({
                          ...formMensajes,
                          mensajeReagendamiento: '⏰ Recordatorio {negocio}\n\nHola {cliente},\n\nTe recordamos tu cita:\n📅 {fecha}\n⏰ {hora_inicio}\n💇 {servicio}\n👤 {empleado}\n\n¡Te esperamos!'
                        })}
                        className="text-xs px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-all"
                      >
                        Simple
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormMensajes({
                          ...formMensajes,
                          mensajeReagendamiento: '⏰ ¡Hola {cliente}!\n\nTe recordamos tu cita de mañana:\n\n� {fecha}\n⏰ {hora_inicio} - {hora_fin}\n💇 {servicio}\n👤 {empleado}\n📍 {sucursal} - {direccion}\n\n🗺️ Ubicación: {maps}\n📞 {telefono_sucursal}\n\n¡Nos vemos pronto en {negocio}! ✨'
                        })}
                        className="text-xs px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-all"
                      >
                        Con Mapa
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormMensajes({
                          ...formMensajes,
                          mensajeReagendamiento: 'Recordatorio de cita - {negocio}\n\nHola {cliente}, mañana tienes cita:\n\n• Servicio: {servicio}\n• Hora: {hora_inicio}\n• Profesional: {empleado}\n• Lugar: {sucursal}\n\nSi necesitas cambios, llámanos: {telefono_sucursal}'
                        })}
                        className="text-xs px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-all"
                      >
                        Profesional
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-[#0490C8] text-white font-semibold rounded-xl hover:bg-[#037ab0] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Modal de confirmación de desvinculación */}
        {showConfirmDisconnect && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¿Desvincular WhatsApp?</h3>
                <p className="text-sm text-gray-600">
                  Esto desconectará tu cuenta de WhatsApp y detendrá el envío de notificaciones automáticas a tus clientes.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDisconnect(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 disabled:opacity-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDesvincular}
                  disabled={processing}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Desvinculando...
                    </>
                  ) : (
                    'Sí, desvincular'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

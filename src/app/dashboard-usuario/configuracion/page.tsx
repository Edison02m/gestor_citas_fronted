'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import negocioService, { NegocioResponse } from '@/services/negocio.service';

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [negocio, setNegocio] = useState<NegocioResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'basico' | 'agenda' | 'notificaciones' | 'mensajes'>('basico');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formularios
  const [formBasico, setFormBasico] = useState({
    nombre: '',
    telefono: '',
    descripcion: '',
  });

  const [formAgenda, setFormAgenda] = useState({
    linkPublico: '',
    agendaPublica: false,
  });

  const [formNotificaciones, setFormNotificaciones] = useState({
    notificacionesWhatsApp: false,
    notificacionesEmail: false,
    recordatorio1: '',
    recordatorio2: '',
  });

  const [formMensajes, setFormMensajes] = useState({
    mensajeRecordatorio: '',
    mensajeReagendamiento: '',
  });

  useEffect(() => {
    if (user) {
      cargarNegocio();
    }
  }, [user]);

  // Auto-ocultar mensajes después de 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const cargarNegocio = async () => {
    try {
      setLoading(true);
      const data = await negocioService.obtenerNegocio();
      setNegocio(data);

      // Cargar formularios
      setFormBasico({
        nombre: data.nombre,
        telefono: data.telefono,
        descripcion: data.descripcion || '',
      });

      setFormAgenda({
        linkPublico: data.linkPublico || '',
        agendaPublica: data.agendaPublica,
      });

      setFormNotificaciones({
        notificacionesWhatsApp: data.notificacionesWhatsApp,
        notificacionesEmail: data.notificacionesEmail,
        recordatorio1: data.recordatorio1?.toString() || '',
        recordatorio2: data.recordatorio2?.toString() || '',
      });

      setFormMensajes({
        mensajeRecordatorio: data.mensajeRecordatorio || '',
        mensajeReagendamiento: data.mensajeReagendamiento || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el negocio');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarBasico = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const data = await negocioService.actualizarNegocio({
        nombre: formBasico.nombre,
        telefono: formBasico.telefono,
        descripcion: formBasico.descripcion || null,
      });

      setNegocio(data);
      setSuccess('Información básica actualizada correctamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const data = await negocioService.actualizarAgendaPublica({
        linkPublico: formAgenda.linkPublico || null,
        agendaPublica: formAgenda.agendaPublica,
      });

      setNegocio(data);
      setSuccess('Agenda pública actualizada correctamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerarLink = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const { linkPublico } = await negocioService.generarLinkPublico();
      setFormAgenda(prev => ({ ...prev, linkPublico }));
      setSuccess('Link público generado automáticamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar link');
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarNotificaciones = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const data = await negocioService.actualizarNotificaciones({
        notificacionesWhatsApp: formNotificaciones.notificacionesWhatsApp,
        notificacionesEmail: formNotificaciones.notificacionesEmail,
        recordatorio1: formNotificaciones.recordatorio1 ? parseInt(formNotificaciones.recordatorio1) : null,
        recordatorio2: formNotificaciones.recordatorio2 ? parseInt(formNotificaciones.recordatorio2) : null,
      });

      setNegocio(data);
      setSuccess('Notificaciones actualizadas correctamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarMensajes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const data = await negocioService.actualizarMensajesWhatsApp({
        mensajeRecordatorio: formMensajes.mensajeRecordatorio,
        mensajeReagendamiento: formMensajes.mensajeReagendamiento,
      });

      setNegocio(data);
      setSuccess('Mensajes de WhatsApp actualizados correctamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const convertirMinutosATexto = (minutos: number): string => {
    if (minutos < 60) return `${minutos} minutos`;
    if (minutos < 1440) return `${Math.floor(minutos / 60)} horas`;
    return `${Math.floor(minutos / 1440)} días`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-[#0490C8] mx-auto"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">Cargando configuración...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configuración del Negocio</h1>
          <p className="mt-1 text-sm text-gray-600">Administra la información y configuración de tu negocio</p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800 font-medium flex-1">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600 transition-colors"
                title="Cerrar"
              >
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
              <button
                onClick={() => setSuccess('')}
                className="text-green-400 hover:text-green-600 transition-colors"
                title="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              <button
                onClick={() => setActiveTab('basico')}
                className={`px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === 'basico'
                    ? 'border-b-2 border-[#0490C8] text-[#0490C8]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Información Básica
                </div>
              </button>
              <button
                onClick={() => setActiveTab('agenda')}
                className={`px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === 'agenda'
                    ? 'border-b-2 border-[#0490C8] text-[#0490C8]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Agenda Pública
                </div>
              </button>
              <button
                onClick={() => setActiveTab('notificaciones')}
                className={`px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === 'notificaciones'
                    ? 'border-b-2 border-[#0490C8] text-[#0490C8]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notificaciones
                </div>
              </button>
              <button
                onClick={() => setActiveTab('mensajes')}
                className={`px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === 'mensajes'
                    ? 'border-b-2 border-[#0490C8] text-[#0490C8]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Mensajes WhatsApp
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Información Básica */}
            {activeTab === 'basico' && (
              <form onSubmit={handleGuardarBasico} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Negocio *
                  </label>
                  <input
                    type="text"
                    value={formBasico.nombre}
                    onChange={(e) => setFormBasico({ ...formBasico, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formBasico.telefono}
                    onChange={(e) => setFormBasico({ ...formBasico, telefono: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formBasico.descripcion}
                    onChange={(e) => setFormBasico({ ...formBasico, descripcion: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    rows={4}
                    placeholder="Describe tu negocio..."
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#0490C8] text-white font-semibold rounded-xl hover:bg-[#037ab0] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Agenda Pública */}
            {activeTab === 'agenda' && (
              <form onSubmit={handleGuardarAgenda} className="space-y-5">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="agendaPublica"
                    checked={formAgenda.agendaPublica}
                    onChange={(e) => setFormAgenda({ ...formAgenda, agendaPublica: e.target.checked })}
                    className="h-5 w-5 text-[#0490C8] focus:ring-[#0490C8] border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="agendaPublica" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                    Activar agenda pública (permite que clientes agenden sin cuenta)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Link Público Personalizado
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formAgenda.linkPublico}
                      onChange={(e) => setFormAgenda({ ...formAgenda, linkPublico: e.target.value })}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="mi-negocio"
                    />
                    <button
                      type="button"
                      onClick={handleGenerarLink}
                      disabled={saving}
                      className="px-4 py-2.5 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 disabled:bg-gray-400 transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Auto-generar
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Tu agenda pública: <span className="font-mono text-[#0490C8]">https://citaya.com/agenda/{formAgenda.linkPublico || 'tu-link'}</span>
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#0490C8] text-white font-semibold rounded-xl hover:bg-[#037ab0] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Notificaciones */}
            {activeTab === 'notificaciones' && (
              <form onSubmit={handleGuardarNotificaciones} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4">Canales de Notificación</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <input
                        type="checkbox"
                        id="notifWhatsApp"
                        checked={formNotificaciones.notificacionesWhatsApp}
                        onChange={(e) => setFormNotificaciones({ ...formNotificaciones, notificacionesWhatsApp: e.target.checked })}
                        className="h-5 w-5 text-[#0490C8] focus:ring-[#0490C8] border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="notifWhatsApp" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Notificaciones por WhatsApp
                      </label>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <input
                        type="checkbox"
                        id="notifEmail"
                        checked={formNotificaciones.notificacionesEmail}
                        onChange={(e) => setFormNotificaciones({ ...formNotificaciones, notificacionesEmail: e.target.checked })}
                        className="h-5 w-5 text-[#0490C8] focus:ring-[#0490C8] border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="notifEmail" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Notificaciones por Email
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4">Recordatorios Automáticos</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                          <p className="font-semibold mb-1">Ejemplos de conversión:</p>
                          <ul className="space-y-1 text-blue-700">
                            <li>• 60 minutos = 1 hora</li>
                            <li>• 1440 minutos = 24 horas (1 día)</li>
                            <li>• 2880 minutos = 48 horas (2 días)</li>
                            <li>• 10080 minutos = 7 días (máximo)</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Recordatorio 1 (en minutos)
                      </label>
                      <input
                        type="number"
                        value={formNotificaciones.recordatorio1}
                        onChange={(e) => setFormNotificaciones({ ...formNotificaciones, recordatorio1: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="1440"
                        min="0"
                        max="10080"
                      />
                      {formNotificaciones.recordatorio1 && (
                        <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          = <span className="font-medium text-[#0490C8]">{convertirMinutosATexto(parseInt(formNotificaciones.recordatorio1))}</span> antes
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Recordatorio 2 (en minutos, opcional)
                      </label>
                      <input
                        type="number"
                        value={formNotificaciones.recordatorio2}
                        onChange={(e) => setFormNotificaciones({ ...formNotificaciones, recordatorio2: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="60"
                        min="0"
                        max="10080"
                      />
                      {formNotificaciones.recordatorio2 && (
                        <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          = <span className="font-medium text-[#0490C8]">{convertirMinutosATexto(parseInt(formNotificaciones.recordatorio2))}</span> antes
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#0490C8] text-white font-semibold rounded-xl hover:bg-[#037ab0] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Mensajes WhatsApp */}
            {activeTab === 'mensajes' && (
              <form onSubmit={handleGuardarMensajes} className="space-y-5">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Variables disponibles:</p>
                      <p className="text-yellow-700">
                        <code className="bg-yellow-100 px-1.5 py-0.5 rounded">{'{cliente}'}</code>,{' '}
                        <code className="bg-yellow-100 px-1.5 py-0.5 rounded">{'{fecha}'}</code>,{' '}
                        <code className="bg-yellow-100 px-1.5 py-0.5 rounded">{'{hora}'}</code>,{' '}
                        <code className="bg-yellow-100 px-1.5 py-0.5 rounded">{'{negocio}'}</code>
                      </p>
                      <p className="mt-1 text-yellow-700">
                        Los mensajes deben incluir al menos: {'{cliente}'}, {'{fecha}'} y {'{hora}'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mensaje de Recordatorio
                  </label>
                  <textarea
                    value={formMensajes.mensajeRecordatorio}
                    onChange={(e) => setFormMensajes({ ...formMensajes, mensajeRecordatorio: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent font-mono text-sm transition-all text-gray-900 placeholder-gray-400"
                    rows={6}
                    placeholder="Hola {cliente}, te recordamos tu cita el {fecha} a las {hora} en {negocio}. ¡Te esperamos!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mensaje de Reagendamiento
                  </label>
                  <textarea
                    value={formMensajes.mensajeReagendamiento}
                    onChange={(e) => setFormMensajes({ ...formMensajes, mensajeReagendamiento: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent font-mono text-sm transition-all text-gray-900 placeholder-gray-400"
                    rows={6}
                    placeholder="Hola {cliente}, tu cita ha sido reagendada para el {fecha} a las {hora} en {negocio}."
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#0490C8] text-white font-semibold rounded-xl hover:bg-[#037ab0] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

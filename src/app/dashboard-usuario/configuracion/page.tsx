'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import negocioService, { NegocioResponse } from '@/services/negocio.service';
import ImageKitUploader from '@/components/dashboard/ImageKitUploader';
import ImageKitService from '@/services/imagekit.service';

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [negocio, setNegocio] = useState<NegocioResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'basico' | 'agenda' | 'notificaciones'>('basico');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [codigoPais, setCodigoPais] = useState('+593'); // Ecuador por defecto
  const [showCodigoPaisDropdown, setShowCodigoPaisDropdown] = useState(false);

  // Lista de códigos de países más comunes
  const codigosPaises = [
    { codigo: '+593', pais: 'Ecuador', bandera: '🇪🇨' },
    { codigo: '+54', pais: 'Argentina', bandera: '🇦🇷' },
    { codigo: '+591', pais: 'Bolivia', bandera: '🇧🇴' },
    { codigo: '+55', pais: 'Brasil', bandera: '🇧🇷' },
    { codigo: '+56', pais: 'Chile', bandera: '🇨🇱' },
    { codigo: '+57', pais: 'Colombia', bandera: '🇨🇴' },
    { codigo: '+506', pais: 'Costa Rica', bandera: '🇨🇷' },
    { codigo: '+53', pais: 'Cuba', bandera: '🇨🇺' },
    { codigo: '+34', pais: 'España', bandera: '🇪🇸' },
    { codigo: '+1', pais: 'Estados Unidos', bandera: '🇺🇸' },
    { codigo: '+502', pais: 'Guatemala', bandera: '🇬🇹' },
    { codigo: '+504', pais: 'Honduras', bandera: '🇭🇳' },
    { codigo: '+52', pais: 'México', bandera: '🇲🇽' },
    { codigo: '+505', pais: 'Nicaragua', bandera: '🇳🇮' },
    { codigo: '+507', pais: 'Panamá', bandera: '🇵🇦' },
    { codigo: '+595', pais: 'Paraguay', bandera: '🇵🇾' },
    { codigo: '+51', pais: 'Perú', bandera: '🇵🇪' },
    { codigo: '+1', pais: 'Puerto Rico', bandera: '🇵🇷' },
    { codigo: '+598', pais: 'Uruguay', bandera: '🇺🇾' },
    { codigo: '+58', pais: 'Venezuela', bandera: '🇻🇪' },
  ];

  // Formularios
  const [formBasico, setFormBasico] = useState({
    nombre: '',
    telefono: '',
    descripcion: '',
  });

  const [formAgenda, setFormAgenda] = useState({
    linkPublico: '',
    agendaPublica: false,
    mostrarPreciosPublico: true,
  });

  const [formNotificaciones, setFormNotificaciones] = useState({
    notificacionesWhatsApp: false,
    notificacionesEmail: false,
    recordatoriosAutomaticos: false,
    recordatorio1: '',
    recordatorio2: '',
  });

  // Estados para gestión del logo
  const [showDeleteLogoModal, setShowDeleteLogoModal] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (user) {
      cargarNegocio();
    }
  }, [user]);  useEffect(() => {
    if (user) {
      cargarNegocio();
    }
  }, [user]);

  // Cerrar dropdown de código de país al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.codigo-pais-dropdown-container')) {
        setShowCodigoPaisDropdown(false);
      }
    };
    
    if (showCodigoPaisDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showCodigoPaisDropdown]);

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

      // Extraer código de país del teléfono si existe
      let telefonoSinCodigo = data.telefono || '';
      let codigoPaisDetectado = '+593'; // Ecuador por defecto
      
      if (telefonoSinCodigo && telefonoSinCodigo.startsWith('+')) {
        // El teléfono tiene código de país, extraerlo
        const codigoEncontrado = codigosPaises.find(p => telefonoSinCodigo.startsWith(p.codigo));
        if (codigoEncontrado) {
          codigoPaisDetectado = codigoEncontrado.codigo;
          telefonoSinCodigo = telefonoSinCodigo.substring(codigoEncontrado.codigo.length);
        }
      }
      
      setCodigoPais(codigoPaisDetectado);

      // Cargar formularios
      setFormBasico({
        nombre: data.nombre,
        telefono: telefonoSinCodigo,
        descripcion: data.descripcion || '',
      });

      setFormAgenda({
        linkPublico: data.linkPublico || '',
        agendaPublica: data.agendaPublica,
        mostrarPreciosPublico: data.mostrarPreciosPublico ?? true,
      });

      setFormNotificaciones({
        notificacionesWhatsApp: data.notificacionesWhatsApp,
        notificacionesEmail: data.notificacionesEmail,
        recordatoriosAutomaticos: data.recordatoriosAutomaticos,
        recordatorio1: data.recordatorio1?.toString() || '',
        recordatorio2: data.recordatorio2?.toString() || '',
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

      // Combinar código de país con teléfono antes de enviar
      const telefonoCompleto = `${codigoPais}${formBasico.telefono}`;

      const data = await negocioService.actualizarNegocio({
        nombre: formBasico.nombre,
        telefono: telefonoCompleto,
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
        mostrarPreciosPublico: formAgenda.mostrarPreciosPublico,
      });

      setNegocio(data);
      setSuccess('Link de agendamiento actualizado correctamente');
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
        recordatoriosAutomaticos: formNotificaciones.recordatoriosAutomaticos,
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

  // Handlers para gestión del logo
  const handleLogoUploadSuccess = async (url: string) => {
    try {
      setUploadingLogo(true);
      setError('');
      setSuccess('');

      const data = await negocioService.actualizarLogo(url);
      setNegocio(data);
      setSuccess('Logo actualizado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    try {
      setDeletingLogo(true);
      setError('');
      setSuccess('');

      // Actualizar en la base de datos (vaciar el logo)
      const data = await negocioService.actualizarLogo('');
      setNegocio(data);
      setShowDeleteLogoModal(false);
      setSuccess('Logo eliminado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar el logo');
    } finally {
      setDeletingLogo(false);
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
        <div className="p-2 sm:p-4 lg:p-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-[#0490C8] mx-auto"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">Cargando configuración...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-2 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Configuración del Negocio</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">Administra la información y configuración de tu negocio</p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
            <div className="flex items-start gap-2 sm:gap-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs sm:text-sm text-red-800 font-medium flex-1">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600 transition-colors"
                title="Cerrar"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
            <div className="flex items-start gap-2 sm:gap-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs sm:text-sm text-green-800 font-medium flex-1">{success}</p>
              <button
                onClick={() => setSuccess('')}
                className="text-green-400 hover:text-green-600 transition-colors"
                title="Cerrar"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex -mb-px min-w-max sm:min-w-0">
              <button
                onClick={() => setActiveTab('basico')}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'basico'
                    ? 'border-b-2 border-[#0490C8] text-[#0490C8]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">Información Básica</span>
                  <span className="sm:hidden">Info</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('agenda')}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'agenda'
                    ? 'border-b-2 border-[#0490C8] text-[#0490C8]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="hidden sm:inline">Link de agendamiento</span>
                  <span className="sm:hidden">Agenda</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('notificaciones')}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'notificaciones'
                    ? 'border-b-2 border-[#0490C8] text-[#0490C8]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="hidden sm:inline">Notificaciones</span>
                  <span className="sm:hidden">Notif.</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-3 sm:p-6">
            {/* Tab: Información Básica */}
            {activeTab === 'basico' && (
              <form onSubmit={handleGuardarBasico} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Negocio *
                  </label>
                  <input
                    type="text"
                    value={formBasico.nombre}
                    onChange={(e) => setFormBasico({ ...formBasico, nombre: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <div className="flex gap-2">
                    {/* Selector de código de país */}
                    <div className="w-28 sm:w-32 relative codigo-pais-dropdown-container">
                      <button
                        type="button"
                        onClick={() => setShowCodigoPaisDropdown(!showCodigoPaisDropdown)}
                        className="w-full px-1.5 sm:px-2 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition-all flex items-center justify-between"
                      >
                        <span className="truncate text-xs sm:text-sm">
                          {codigosPaises.find(p => p.codigo === codigoPais)?.bandera} {codigoPais}
                        </span>
                        <svg className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform ${showCodigoPaisDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showCodigoPaisDropdown && (
                        <div className="absolute z-50 w-52 sm:w-56 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {codigosPaises.map((pais) => (
                            <button
                              key={`${pais.codigo}-${pais.pais}`}
                              type="button"
                              onClick={() => {
                                setCodigoPais(pais.codigo);
                                setShowCodigoPaisDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{pais.bandera}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-gray-900">{pais.pais}</div>
                                  <div className="text-[10px] text-gray-500">{pais.codigo}</div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Input de teléfono */}
                    <input
                      type="tel"
                      required
                      value={formBasico.telefono}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, ''); // Solo números
                        
                        // Si el primer caracter es 0, quitarlo
                        if (value.startsWith('0')) {
                          value = value.substring(1);
                        }
                        
                        // Limitar a 9 dígitos
                        if (value.length <= 9) {
                          setFormBasico({ ...formBasico, telefono: value });
                        }
                      }}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="999999999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formBasico.descripcion}
                    onChange={(e) => setFormBasico({ ...formBasico, descripcion: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    rows={4}
                    placeholder="Describe tu negocio..."
                  />
                </div>

                {/* Sección de Logo */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Logo del Negocio
                  </label>
                  
                  {negocio?.logo ? (
                    /* Si hay logo, mostrar preview con botones */
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <img
                          src={negocio.logo}
                          alt="Logo del negocio"
                          className="h-24 sm:h-32 w-auto rounded-lg shadow-md object-contain border border-gray-200"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => setNegocio({ ...negocio, logo: null })}
                          disabled={uploadingLogo}
                          className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Cambiar Logo
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteLogoModal(true)}
                          disabled={deletingLogo || uploadingLogo}
                          className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {deletingLogo ? 'Eliminando...' : 'Eliminar Logo'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Si no hay logo, mostrar uploader */
                    <ImageKitUploader
                      currentLogo={null}
                      onUploadSuccess={handleLogoUploadSuccess}
                      onError={(error) => setError(error)}
                    />
                  )}
                </div>

                <div className="flex justify-end pt-3 sm:pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0490C8] text-white text-sm font-semibold rounded-xl hover:bg-[#037ab0] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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

            {/* Tab: Link de agendamiento */}
            {activeTab === 'agenda' && (
              <form onSubmit={handleGuardarAgenda} className="space-y-4 sm:space-y-5">
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="agendaPublica"
                    checked={formAgenda.agendaPublica}
                    onChange={(e) => setFormAgenda({ ...formAgenda, agendaPublica: e.target.checked })}
                    className="h-4 w-4 sm:h-5 sm:w-5 text-[#0490C8] focus:ring-[#0490C8] border-gray-300 rounded cursor-pointer mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="agendaPublica" className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                      Permitir que clientes puedan agendar citas a través del enlace público
                    </label>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="mostrarPreciosPublico"
                    checked={formAgenda.mostrarPreciosPublico}
                    onChange={(e) => setFormAgenda({ ...formAgenda, mostrarPreciosPublico: e.target.checked })}
                    className="h-4 w-4 sm:h-5 sm:w-5 text-[#0490C8] focus:ring-[#0490C8] border-gray-300 rounded cursor-pointer mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="mostrarPreciosPublico" className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                      Mostrar precios de servicios en la agenda pública
                    </label>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                      Si desactivas esta opción, los clientes no verán los precios de los servicios al agendar citas
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Link Público Personalizado
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={formAgenda.linkPublico}
                      onChange={(e) => setFormAgenda({ ...formAgenda, linkPublico: e.target.value })}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="mi-negocio"
                    />
                    <button
                      type="button"
                      onClick={handleGenerarLink}
                      disabled={saving}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-700 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="hidden sm:inline">Auto-generar</span>
                      <span className="sm:hidden">Generar</span>
                    </button>
                  </div>
                  <p className="mt-2 text-[10px] sm:text-sm text-gray-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>Tu link de agendamiento:</span>
                    <span className="font-mono text-[#0490C8] break-all">https://citaya.com/agenda/{formAgenda.linkPublico || 'tu-link'}</span>
                  </p>
                </div>

                <div className="flex justify-end pt-3 sm:pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0490C8] text-white text-sm font-semibold rounded-xl hover:bg-[#037ab0] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
              <form onSubmit={handleGuardarNotificaciones} className="space-y-5 sm:space-y-6">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">Canales de Notificación</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <input
                        type="checkbox"
                        id="notifWhatsApp"
                        checked={formNotificaciones.notificacionesWhatsApp}
                        onChange={(e) => {
                          const whatsappEnabled = e.target.checked;
                          setFormNotificaciones({ 
                            ...formNotificaciones, 
                            notificacionesWhatsApp: whatsappEnabled,
                            // Si desactivamos WhatsApp, también desactivamos recordatorios automáticos
                            recordatoriosAutomaticos: whatsappEnabled ? formNotificaciones.recordatoriosAutomaticos : false
                          });
                        }}
                        className="h-5 w-5 text-[#0490C8] focus:ring-[#0490C8] border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="notifWhatsApp" className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-1.5 sm:gap-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <span className="hidden sm:inline">Notificaciones por WhatsApp</span>
                        <span className="sm:hidden">WhatsApp</span>
                      </label>
                    </div>
                    
                    {/* Recordatorios automáticos - sub-opción de WhatsApp */}
                    <div className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl ml-6 sm:ml-8 transition-colors ${
                      formNotificaciones.notificacionesWhatsApp ? 'bg-blue-50' : 'bg-gray-100'
                    }`}>
                      <input
                        type="checkbox"
                        id="recordatoriosAutomaticos"
                        checked={formNotificaciones.recordatoriosAutomaticos}
                        disabled={!formNotificaciones.notificacionesWhatsApp}
                        onChange={(e) => setFormNotificaciones({ 
                          ...formNotificaciones, 
                          recordatoriosAutomaticos: e.target.checked 
                        })}
                        className={`h-4 w-4 sm:h-5 sm:w-5 text-[#0490C8] focus:ring-[#0490C8] border-gray-300 rounded ${
                          formNotificaciones.notificacionesWhatsApp ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                        }`}
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor="recordatoriosAutomaticos" 
                          className={`text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 ${
                            formNotificaciones.notificacionesWhatsApp 
                              ? 'text-gray-700 cursor-pointer' 
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Enviar recordatorios automáticos
                        </label>
                        {!formNotificaciones.notificacionesWhatsApp && (
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 ml-6 sm:ml-7">
                            Debes activar notificaciones por WhatsApp primero
                          </p>
                        )}
                        {formNotificaciones.notificacionesWhatsApp && (
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-1 ml-6 sm:ml-7">
                            El sistema enviará recordatorios automáticos por WhatsApp según la configuración establecida
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <input
                        type="checkbox"
                        id="notifEmail"
                        checked={formNotificaciones.notificacionesEmail}
                        onChange={(e) => setFormNotificaciones({ ...formNotificaciones, notificacionesEmail: e.target.checked })}
                        className="h-4 w-4 sm:h-5 sm:w-5 text-[#0490C8] focus:ring-[#0490C8] border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="notifEmail" className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-1.5 sm:gap-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="hidden sm:inline">Notificaciones por Email</span>
                        <span className="sm:hidden">Email</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">Recordatorios Automáticos</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-xs sm:text-sm text-blue-800">
                          <p className="font-semibold mb-1">Ejemplos de conversión:</p>
                          <ul className="space-y-0.5 sm:space-y-1 text-blue-700 text-[10px] sm:text-xs">
                            <li>• 60 minutos = 1 hora</li>
                            <li>• 1440 minutos = 24 horas (1 día)</li>
                            <li>• 2880 minutos = 48 horas (2 días)</li>
                            <li>• 10080 minutos = 7 días (máximo)</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Recordatorio automático (en minutos)
                      </label>
                      <input
                        type="number"
                        value={formNotificaciones.recordatorio1}
                        onChange={(e) => setFormNotificaciones({ ...formNotificaciones, recordatorio1: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="1440"
                        min="0"
                        max="10080"
                      />
                      {formNotificaciones.recordatorio1 && (
                        <p className="mt-2 text-xs sm:text-sm text-gray-600 flex items-center gap-1.5 sm:gap-2">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          = <span className="font-medium text-[#0490C8]">{convertirMinutosATexto(parseInt(formNotificaciones.recordatorio1))}</span> antes
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 sm:pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0490C8] text-white text-sm font-semibold rounded-xl hover:bg-[#037ab0] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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

      {/* Modal de confirmación para eliminar logo */}
      {showDeleteLogoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-6 animate-fade-in">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Eliminar Logo</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">¿Estás seguro de que deseas eliminar el logo?</p>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              Esta acción no se puede deshacer. El logo será eliminado permanentemente.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteLogoModal(false)}
                disabled={deletingLogo}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteLogo}
                disabled={deletingLogo}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {deletingLogo ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

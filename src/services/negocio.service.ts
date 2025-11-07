// src/services/negocio.service.ts

import api from './api';

export interface NegocioResponse {
  id: string;
  nombre: string;
  telefono: string;
  logo: string | null;
  descripcion: string | null;
  usuarioId: string;
  linkPublico: string | null;
  agendaPublica: boolean;
  mostrarPreciosPublico: boolean;
  notificacionesWhatsApp: boolean;
  notificacionesEmail: boolean;
  recordatoriosAutomaticos: boolean;
  recordatorio1: number | null;
  recordatorio2: number | null;
  mensajeRecordatorio: string | null;
  mensajeReagendamiento: string | null;
  estadoSuscripcion: string;
  bloqueado: boolean;
  motivoBloqueo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNegocioDto {
  nombre?: string;
  telefono?: string;
  logo?: string | null;
  descripcion?: string | null;
}

export interface UpdateAgendaPublicaDto {
  linkPublico?: string | null;
  agendaPublica?: boolean;
  mostrarPreciosPublico?: boolean;
}

export interface UpdateNotificacionesDto {
  notificacionesWhatsApp?: boolean;
  notificacionesEmail?: boolean;
  recordatoriosAutomaticos?: boolean;
  recordatorio1?: number | null;
  recordatorio2?: number | null;
}

export interface UpdateMensajesWhatsAppDto {
  mensajeRecordatorio?: string;
  mensajeReagendamiento?: string;
}

export interface GenerarLinkPublicoResponse {
  linkPublico: string;
  urlCompleta: string;
}

class NegocioService {
  /**
   * Obtener información del negocio
   */
  async obtenerNegocio(): Promise<NegocioResponse> {
    const response = await api.get<{ success: boolean; data: NegocioResponse }>('/negocio');
    return response.data;
  }

  /**
   * Actualizar información básica del negocio
   */
  async actualizarNegocio(data: UpdateNegocioDto): Promise<NegocioResponse> {
    const response = await api.put<{ success: boolean; data: NegocioResponse }>('/negocio', data);
    return response.data;
  }

  /**
   * Actualizar agenda pública
   */
  async actualizarAgendaPublica(data: UpdateAgendaPublicaDto): Promise<NegocioResponse> {
    const response = await api.put<{ success: boolean; data: NegocioResponse }>('/negocio/agenda-publica', data);
    return response.data;
  }

  /**
   * Actualizar notificaciones y recordatorios
   */
  async actualizarNotificaciones(data: UpdateNotificacionesDto): Promise<NegocioResponse> {
    const response = await api.put<{ success: boolean; data: NegocioResponse }>('/negocio/notificaciones', data);
    return response.data;
  }

  /**
   * Actualizar mensajes de WhatsApp
   */
  async actualizarMensajesWhatsApp(data: UpdateMensajesWhatsAppDto): Promise<NegocioResponse> {
    const response = await api.put<{ success: boolean; data: NegocioResponse }>('/negocio/mensajes-whatsapp', data);
    return response.data;
  }

  /**
   * Generar link público automáticamente
   */
  async generarLinkPublico(): Promise<GenerarLinkPublicoResponse> {
    const response = await api.post<{ success: boolean; data: GenerarLinkPublicoResponse }>('/negocio/generar-link', {});
    return response.data;
  }
}

export default new NegocioService();

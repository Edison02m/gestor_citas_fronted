// src/services/whatsapp.service.ts

import api from './api';

export interface WhatsAppStatusResponse {
  connected: boolean;
  phoneNumber: string | null;
  instanceId: string | null;
  configuredAt: string | null;
}

export interface VincularWhatsAppResponse {
  success: boolean;
  message: string;
  instanceId: string;
  qrCode: string;
}

export interface QRCodeResponse {
  qrCode: string;
  message: string;
}

export interface DesvincularWhatsAppResponse {
  success: boolean;
  message: string;
}

export interface CheckNumberResponse {
  exists: boolean;
  jid?: string;
  number?: string;
}

class WhatsAppService {
  /**
   * Obtener estado de conexión de WhatsApp
   */
  async obtenerEstado(): Promise<WhatsAppStatusResponse> {
    const response = await api.get<{ success: boolean; data: WhatsAppStatusResponse }>('/whatsapp/estado');
    return response.data;
  }

  /**
   * Vincular cuenta de WhatsApp (genera QR code)
   */
  async vincular(): Promise<VincularWhatsAppResponse> {
    const response = await api.post<{ success: boolean; data: VincularWhatsAppResponse }>('/whatsapp/vincular', {});
    return response.data;
  }

  /**
   * Obtener nuevo código QR
   */
  async obtenerQR(): Promise<QRCodeResponse> {
    const response = await api.get<{ success: boolean; data: QRCodeResponse }>('/whatsapp/qr');
    return response.data;
  }

  /**
   * Desvincular cuenta de WhatsApp
   */
  async desvincular(): Promise<DesvincularWhatsAppResponse> {
    const response = await api.post<{ success: boolean; data: DesvincularWhatsAppResponse }>('/whatsapp/desvincular', {});
    return response.data;
  }

  /**
   * Verificar si un número tiene WhatsApp
   */
  async verificarNumero(phoneNumber: string): Promise<CheckNumberResponse> {
    const response = await api.post<{ success: boolean; data: CheckNumberResponse }>('/whatsapp/check-number', {
      phoneNumber,
    });
    return response.data;
  }
}

export default new WhatsAppService();

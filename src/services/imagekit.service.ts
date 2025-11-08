// frontend/src/services/imagekit.service.ts
import api from './api';

/**
 * Parámetros de autenticación de ImageKit
 */
export interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

/**
 * Servicio para integración con ImageKit en el frontend
 */
class ImageKitService {
  /**
   * Obtener parámetros de autenticación desde el backend
   * Estos parámetros son necesarios para que el cliente pueda subir archivos de forma segura
   */
  async getAuthParameters(): Promise<ImageKitAuthParams> {
    try {
      const response = await api.get<{ success: boolean; data: ImageKitAuthParams }>(
        '/imagekit/auth'
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener parámetros de autenticación:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener parámetros de autenticación'
      );
    }
  }

  /**
   * Actualizar logo del negocio en la base de datos
   * @param logoUrl - URL del logo subido a ImageKit (o string vacío para eliminar)
   */
  async actualizarLogo(logoUrl: string): Promise<void> {
    try {
      await api.patch('/negocio/logo', { logoUrl: logoUrl || '' });
    } catch (error: any) {
      console.error('Error al actualizar logo:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar logo');
    }
  }
}

// Exportar instancia única
export const imagekitService = new ImageKitService();
export default imagekitService;

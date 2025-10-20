// src/services/codigos.service.ts

import api from './api';
import {
  CodigoSuscripcion,
  CreateCodigoDto,
  GenerarCodigosDto,
  CodigoSuscripcionListResponse,
  EstadisticasCodigos,
  PlanSuscripcion,
} from '@/interfaces';

export interface CodigoFilters {
  plan?: PlanSuscripcion;
  usado?: boolean;
  disponible?: boolean;
  expirado?: boolean;
  search?: string;
}

const codigosService = {
  /**
   * Crear un código de suscripción
   */
  async crear(data: CreateCodigoDto): Promise<CodigoSuscripcion> {
    const response = await api.post<{ success: boolean; data: CodigoSuscripcion }>('/codigos-suscripcion', data);
    return response.data;
  },

  /**
   * Generar múltiples códigos
   */
  async generarMultiples(data: GenerarCodigosDto): Promise<CodigoSuscripcion[]> {
    const response = await api.post<{ success: boolean; data: CodigoSuscripcion[] }>(
      '/codigos-suscripcion/generar-multiples',
      data
    );
    return response.data;
  },

  /**
   * Listar códigos con filtros y paginación
   */
  async listar(
    filters?: CodigoFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<CodigoSuscripcionListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.plan) params.append('plan', filters.plan);
    if (filters?.usado !== undefined) params.append('usado', String(filters.usado));
    if (filters?.disponible) params.append('disponible', 'true');
    if (filters?.expirado) params.append('expirado', 'true');
    if (filters?.search) params.append('search', filters.search);
    params.append('page', String(page));
    params.append('limit', String(limit));

    const response = await api.get<{ success: boolean; data: CodigoSuscripcionListResponse }>(
      `/codigos-suscripcion?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Obtener estadísticas
   */
  async obtenerEstadisticas(): Promise<EstadisticasCodigos> {
    const response = await api.get<{ success: boolean; data: EstadisticasCodigos }>(
      '/codigos-suscripcion/estadisticas'
    );
    return response.data;
  },

  /**
   * Eliminar código
   */
  async eliminar(id: string): Promise<void> {
    await api.delete(`/codigos-suscripcion/${id}`);
  },
};

export default codigosService;

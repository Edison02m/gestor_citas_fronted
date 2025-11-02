// src/services/configuracion-planes.service.ts

import api from './api';

/**
 * Tipo de plan (debe coincidir con PlanSuscripcion del backend)
 */
export type PlanSuscripcionTipo = 'GRATIS' | 'PRO_MENSUAL' | 'PRO_ANUAL' | 'PRO_PLUS_MENSUAL' | 'PRO_PLUS_ANUAL' | 'PERSONALIZADO';

/**
 * Interfaz para configuración de plan
 */
export interface ConfiguracionPlan {
  id: string;
  plan: PlanSuscripcionTipo;
  nombre: string;
  descripcion: string | null;
  limiteSucursales: number | null;
  limiteEmpleados: number | null;
  limiteServicios: number | null;
  limiteClientes: number | null;
  limiteCitasMes: number | null;
  limiteWhatsAppMes: number | null;
  limiteEmailMes: number | null;
  reportesAvanzados: boolean;
  duracionDias: number;
  precio: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Datos para actualizar configuración de plan
 */
export interface ActualizarConfiguracionPlanDto {
  limiteSucursales: number | null;
  limiteEmpleados: number | null;
  limiteServicios: number | null;
  limiteClientes: number | null;
  limiteCitasMes: number | null;
  limiteWhatsAppMes: number | null;
  limiteEmailMes: number | null;
  reportesAvanzados: boolean;
  duracionDias: number;
  precio: number;
  nombre?: string;
  descripcion?: string;
}

/**
 * Estadísticas de uso de planes
 */
export interface EstadisticasPlanes {
  GRATIS: number;
  PRO: number;
  PRO_PLUS: number;
  PERSONALIZADO: number;
  total: number;
}

/**
 * Servicio para gestión de configuración de planes (Super Admin)
 */
class ConfiguracionPlanesService {
  /**
   * Obtener configuración de todos los planes
   */
  async obtenerConfiguracionPlanes(): Promise<ConfiguracionPlan[]> {
    try {
      const response = await api.get<{ data: ConfiguracionPlan[] }>(
        '/super-admin/planes/configuracion'
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener configuración de planes:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración de un plan específico
   */
  async obtenerConfiguracionPlan(planId: string): Promise<ConfiguracionPlan> {
    try {
      const response = await api.get<{ data: ConfiguracionPlan }>(
        `/super-admin/planes/configuracion/${planId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error al obtener configuración del plan ${planId}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar configuración de un plan
   */
  async actualizarConfiguracionPlan(
    planId: string,
    datos: ActualizarConfiguracionPlanDto
  ): Promise<ConfiguracionPlan> {
    try {
      const response = await api.put<{ data: ConfiguracionPlan }>(
        `/super-admin/planes/configuracion/${planId}`,
        datos
      );
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar configuración del plan ${planId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de uso de planes
   */
  async obtenerEstadisticasPlanes(): Promise<EstadisticasPlanes> {
    try {
      const response = await api.get<{ data: EstadisticasPlanes }>(
        '/super-admin/planes/estadisticas'
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de planes:', error);
      throw error;
    }
  }
}

export default new ConfiguracionPlanesService();

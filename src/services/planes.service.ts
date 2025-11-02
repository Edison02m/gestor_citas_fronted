import api from './api';
import {
  PlanesDisponiblesResponse,
  PlanActualResponse,
  ResumenUsoResponse,
  HistorialUsoResponse,
  CambiarPlanResponse,
  TipoPlan,
} from '@/interfaces';

/**
 * Servicio para gestión de planes y uso de recursos
 */
const planesService = {
  /**
   * Obtener todos los planes disponibles (público)
   */
  async getPlanesDisponibles() {
    try {
      const response = await api.get<PlanesDisponiblesResponse>('/planes');
      return response;
    } catch (error: any) {
      console.error('Error al obtener planes disponibles:', error);
      throw error;
    }
  },

  /**
   * Obtener el plan actual del negocio (autenticado)
   */
  async getPlanActual() {
    try {
      const response = await api.get<PlanActualResponse>('/negocio/plan-actual');
      return response;
    } catch (error: any) {
      console.error('Error al obtener plan actual:', error);
      throw error;
    }
  },

  /**
   * Obtener resumen de uso actual de recursos (autenticado)
   */
  async getResumenUso() {
    try {
      const response = await api.get<ResumenUsoResponse>('/negocio/uso');
      return response;
    } catch (error: any) {
      console.error('Error al obtener resumen de uso:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de uso de recursos (autenticado)
   * @param meses - Número de meses hacia atrás (default: 6)
   */
  async getHistorialUso(meses: number = 6) {
    try {
      const response = await api.get<HistorialUsoResponse>(
        `/negocio/uso/historial?meses=${meses}`
      );
      return response;
    } catch (error: any) {
      console.error('Error al obtener historial de uso:', error);
      throw error;
    }
  },

  /**
   * Cambiar el plan de suscripción (autenticado)
   * @param nuevoPlan - ID del nuevo plan
   */
  async cambiarPlan(nuevoPlan: TipoPlan) {
    try {
      const response = await api.post<CambiarPlanResponse>('/suscripcion/cambiar-plan', {
        nuevoPlan,
      });
      return response;
    } catch (error: any) {
      console.error('Error al cambiar plan:', error);
      throw error;
    }
  },
};

export default planesService;

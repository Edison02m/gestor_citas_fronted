// src/services/onboarding.service.ts

import api from './api';
import {
  OnboardingStatus,
  CreateSucursalDto,
  CreateServicioDto,
  CreateEmpleadoDto,
  Sucursal
} from '@/interfaces';

export class OnboardingService {
  /**
   * Obtener estado del onboarding
   */
  static async getStatus(): Promise<OnboardingStatus> {
    try {
      const response = await api.get<{ success: boolean; data: OnboardingStatus }>('/onboarding/status');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estado del onboarding');
    }
  }

  /**
   * Crear sucursal
   */
  static async createSucursal(data: CreateSucursalDto): Promise<Sucursal> {
    try {
      const response = await api.post<{ success: boolean; data: Sucursal }>('/onboarding/sucursales', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear sucursal');
    }
  }

  /**
   * Crear servicio
   */
  static async createServicio(data: CreateServicioDto): Promise<any> {
    try {
      const response = await api.post<{ success: boolean; data: any }>('/onboarding/servicios', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear servicio');
    }
  }

  /**
   * Crear empleado
   */
  static async createEmpleado(data: CreateEmpleadoDto): Promise<any> {
    try {
      const response = await api.post<{ success: boolean; data: any }>('/onboarding/empleados', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear empleado');
    }
  }

  /**
   * Completar onboarding
   */
  static async completar(): Promise<void> {
    try {
      await api.post('/onboarding/completar', {});
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al completar onboarding');
    }
  }

  /**
   * Obtener sucursales
   */
  static async getSucursales(): Promise<Sucursal[]> {
    try {
      const response = await api.get<{ success: boolean; data: Sucursal[] }>('/sucursales');
      // La API devuelve { success: true, data: [...] }
      // Pero api.get ya nos devuelve todo el objeto, así que accedemos a .data
      return (response as any).data || response;
    } catch (error: any) {
      console.error('Error completo al obtener sucursales:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener sucursales');
    }
  }
}

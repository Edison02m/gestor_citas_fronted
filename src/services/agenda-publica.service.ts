// src/services/agenda-publica.service.ts

import api from './api';
import {
  NegocioPublicoResponse,
  SucursalesPublicasResponse,
  ServiciosPublicosResponse,
  EmpleadosPublicosResponse,
  DisponibilidadResponse,
  DisponibilidadPublicaDto,
  CreateCitaPublicaDto,
  Cita,
} from '@/interfaces';

/**
 * Servicio para la Agenda Pública
 * Permite a clientes crear citas sin autenticación usando el link público del negocio
 */
class AgendaPublicaService {
  
  /**
   * Obtener información básica del negocio por su link público
   */
  async obtenerNegocioPublico(linkPublico: string): Promise<NegocioPublicoResponse> {
    return await api.get<NegocioPublicoResponse>(
      `/public-agenda/${linkPublico}/negocio`
    );
  }

  /**
   * Obtener sucursales activas del negocio
   */
  async obtenerSucursalesPublicas(linkPublico: string): Promise<SucursalesPublicasResponse> {
    return await api.get<SucursalesPublicasResponse>(
      `/public-agenda/${linkPublico}/sucursales`
    );
  }

  /**
   * Obtener servicios activos del negocio
   */
  async obtenerServiciosPublicos(linkPublico: string): Promise<ServiciosPublicosResponse> {
    return await api.get<ServiciosPublicosResponse>(
      `/public-agenda/${linkPublico}/servicios`
    );
  }

  /**
   * Obtener empleados activos de una sucursal específica
   */
  async obtenerEmpleadosPublicos(
    linkPublico: string,
    sucursalId: string
  ): Promise<EmpleadosPublicosResponse> {
    return await api.get<EmpleadosPublicosResponse>(
      `/public-agenda/${linkPublico}/empleados/${sucursalId}`
    );
  }

  /**
   * Obtener disponibilidad de horarios para un servicio en una fecha específica
   */
  async obtenerDisponibilidadPublica(
    linkPublico: string,
    dto: DisponibilidadPublicaDto
  ): Promise<DisponibilidadResponse> {
    return await api.post<DisponibilidadResponse>(
      `/public-agenda/${linkPublico}/disponibilidad`,
      dto
    );
  }

  /**
   * Crear una cita desde la agenda pública
   */
  async crearCitaPublica(
    linkPublico: string,
    dto: CreateCitaPublicaDto
  ): Promise<{ success: true; data: Cita }> {
    return await api.post<{ success: true; data: Cita }>(
      `/public-agenda/${linkPublico}/citas`,
      dto
    );
  }

  /**
   * Buscar cliente por cédula
   */
  async buscarClientePorCedula(
    linkPublico: string,
    cedula: string
  ): Promise<{ success: boolean; data: { existe: boolean; cliente?: any } }> {
    return await api.get<{ success: boolean; data: { existe: boolean; cliente?: any } }>(
      `/public-agenda/${linkPublico}/cliente/${cedula}`
    );
  }
}

export const agendaPublicaService = new AgendaPublicaService();

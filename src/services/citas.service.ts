import api from './api';
import { Cita, CreateCitaDto, UpdateCitaDto, FiltrosCitasDto, CitasListResponse, HorarioDisponible, EstadoCita } from '@/interfaces';

export class CitasService {
  private static readonly BASE_URL = '/citas';

  /**
   * Crear una nueva cita
   */
  static async createCita(data: CreateCitaDto): Promise<Cita> {
    // El backend devuelve: { success: true, data: Cita, message: string }
    const response = await api.post<{ success: true; data: Cita; message: string }>(
      this.BASE_URL,
      data
    );
    return response.data;
  }

  /**
   * Obtener lista de citas con filtros
   */
  static async getCitas(filtros?: FiltrosCitasDto): Promise<CitasListResponse> {
    const params = new URLSearchParams();
    
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros?.clienteId) params.append('clienteId', filtros.clienteId);
    if (filtros?.empleadoId) params.append('empleadoId', filtros.empleadoId);
    if (filtros?.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros?.servicioId) params.append('servicioId', filtros.servicioId);
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.canalOrigen) params.append('canalOrigen', filtros.canalOrigen);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.limit) params.append('limit', filtros.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.BASE_URL}?${queryString}` : this.BASE_URL;

    // El backend devuelve: { success: true, data: Cita[], pagination: {...} }
    const response = await api.get<CitasListResponse>(url);
    return response;
  }

  /**
   * Obtener una cita por ID
   */
  static async getCita(id: string): Promise<Cita> {
    // El backend devuelve: { success: true, data: Cita }
    const response = await api.get<{ success: true; data: Cita }>(
      `${this.BASE_URL}/${id}`
    );
    return response.data;
  }

  /**
   * Actualizar una cita
   */
  static async updateCita(id: string, data: UpdateCitaDto): Promise<Cita> {
    // El backend devuelve: { success: true, data: Cita, message: string }
    const response = await api.put<{ success: true; data: Cita; message: string }>(
      `${this.BASE_URL}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Eliminar una cita
   */
  static async deleteCita(id: string): Promise<void> {
    await api.delete(`${this.BASE_URL}/${id}`);
  }

  /**
   * Obtener citas por fecha específica
   */
  static async getCitasPorFecha(fecha: string, sucursalId?: string): Promise<Cita[]> {
    // El backend devuelve: { success: true, data: Cita[] }
    const url = sucursalId 
      ? `${this.BASE_URL}/fecha/${fecha}?sucursalId=${sucursalId}`
      : `${this.BASE_URL}/fecha/${fecha}`;
    
    const response = await api.get<{ success: true; data: Cita[] }>(url);
    return response.data;
  }

  /**
   * Cambiar estado de una cita (permite cambiar a cualquier estado)
   */
  static async cambiarEstado(id: string, estado: EstadoCita): Promise<Cita> {
    const response = await api.patch<{ success: true; data: Cita; message: string }>(
      `${this.BASE_URL}/${id}/estado`,
      { estado }
    );
    return response.data;
  }

  /**
   * Confirmar una cita
   */
  static async confirmarCita(id: string): Promise<Cita> {
    const response = await api.patch<{ success: true; data: Cita; message: string }>(
      `${this.BASE_URL}/${id}/confirmar`,
      {}
    );
    return response.data;
  }

  /**
   * Completar una cita
   */
  static async completarCita(id: string): Promise<Cita> {
    const response = await api.patch<{ success: true; data: Cita; message: string }>(
      `${this.BASE_URL}/${id}/completar`,
      {}
    );
    return response.data;
  }

  /**
   * Cancelar una cita
   */
  static async cancelarCita(id: string): Promise<Cita> {
    const response = await api.patch<{ success: true; data: Cita; message: string }>(
      `${this.BASE_URL}/${id}/cancelar`,
      {}
    );
    return response.data;
  }

  /**
   * Marcar como no asistió
   */
  static async marcarNoAsistio(id: string): Promise<Cita> {
    const response = await api.patch<{ success: true; data: Cita; message: string }>(
      `${this.BASE_URL}/${id}/no-asistio`,
      {}
    );
    return response.data;
  }

  /**
   * Obtener horarios disponibles para agendar cita
   */
  static async obtenerDisponibilidad(data: {
    empleadoId?: string;
    sucursalId: string;
    servicioId: string;
    fecha: string;
  }): Promise<HorarioDisponible[]> {
    const response = await api.post<{ success: true; data: HorarioDisponible[] }>(
      `${this.BASE_URL}/disponibilidad`,
      data
    );
    return response.data;
  }

  /**
   * Obtener estadísticas generales de citas
   */
  static async obtenerEstadisticas(filtros?: {
    fechaInicio?: string;
    fechaFin?: string;
    sucursalId?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros?.sucursalId) params.append('sucursalId', filtros.sucursalId);

    const queryString = params.toString();
    const url = queryString 
      ? `${this.BASE_URL}/estadisticas/general?${queryString}` 
      : `${this.BASE_URL}/estadisticas/general`;

    const response = await api.get<{ success: true; data: any }>(url);
    return response.data;
  }

  /**
   * Obtener próximas citas de un cliente
   */
  static async obtenerProximasCitasCliente(
    clienteId: string,
    limite?: number
  ): Promise<Cita[]> {
    const url = limite
      ? `${this.BASE_URL}/cliente/${clienteId}/proximas?limite=${limite}`
      : `${this.BASE_URL}/cliente/${clienteId}/proximas`;
    
    const response = await api.get<{ success: true; data: Cita[] }>(url);
    return response.data;
  }

  /**
   * Obtener historial de citas de un cliente
   */
  static async obtenerHistorialCliente(
    clienteId: string,
    page?: number,
    limit?: number
  ): Promise<CitasListResponse> {
    const params = new URLSearchParams();
    
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${this.BASE_URL}/cliente/${clienteId}/historial?${queryString}`
      : `${this.BASE_URL}/cliente/${clienteId}/historial`;
    
    const response = await api.get<CitasListResponse>(url);
    return response;
  }
}

export default CitasService;

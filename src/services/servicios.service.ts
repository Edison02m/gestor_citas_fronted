import api from './api';
import { 
  Servicio, 
  CreateServicioDto, 
  UpdateServicioDto, 
  AsignarSucursalesServicioDto,
  ToggleDisponibilidadDto 
} from '@/interfaces';

export class ServiciosService {
  private static readonly BASE_URL = '/servicios';

  /**
   * Obtener lista de todos los servicios
   */
  static async getServicios(): Promise<Servicio[]> {
    const response = await api.get<{ success: true; data: Servicio[] }>(this.BASE_URL);
    return response.data;
  }

  /**
   * Obtener un servicio específico
   */
  static async getServicio(id: string): Promise<Servicio> {
    const response = await api.get<{ success: true; data: Servicio }>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Crear un nuevo servicio
   */
  static async createServicio(data: CreateServicioDto): Promise<Servicio> {
    const response = await api.post<{ success: true; data: Servicio; message: string }>(
      this.BASE_URL,
      data
    );
    return response.data;
  }

  /**
   * Actualizar un servicio
   */
  static async updateServicio(id: string, data: UpdateServicioDto): Promise<Servicio> {
    const response = await api.put<{ success: true; data: Servicio; message: string }>(
      `${this.BASE_URL}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Eliminar un servicio
   */
  static async deleteServicio(id: string): Promise<void> {
    await api.delete<{ success: true; data: { success: boolean; message: string } }>(
      `${this.BASE_URL}/${id}`
    );
  }

  /**
   * Asignar sucursales a un servicio
   */
  static async asignarSucursales(id: string, data: AsignarSucursalesServicioDto): Promise<Servicio> {
    const response = await api.put<{ success: true; data: Servicio; message: string }>(
      `${this.BASE_URL}/${id}/sucursales`,
      data
    );
    return response.data;
  }

  /**
   * Toggle disponibilidad de servicio en una sucursal
   */
  static async toggleDisponibilidad(
    servicioId: string, 
    sucursalId: string, 
    data: ToggleDisponibilidadDto
  ): Promise<void> {
    await api.patch<{ success: true; data: { success: boolean; message: string } }>(
      `${this.BASE_URL}/${servicioId}/sucursales/${sucursalId}/disponibilidad`,
      data
    );
  }

  /**
   * Obtener servicios por sucursal
   */
  static async getServiciosPorSucursal(sucursalId: string): Promise<Servicio[]> {
    const response = await api.get<{ success: true; data: Servicio[] }>(
      `/sucursales/${sucursalId}/servicios`
    );
    return response.data;
  }

  /**
   * Buscar servicios por nombre o descripción
   */
  static async searchServicios(query: string): Promise<Servicio[]> {
    const servicios = await this.getServicios();
    
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return servicios;

    return servicios.filter((servicio: Servicio) => 
      servicio.nombre.toLowerCase().includes(searchTerm) ||
      servicio.descripcion.toLowerCase().includes(searchTerm)
    );
  }
}

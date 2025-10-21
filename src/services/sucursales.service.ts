import api from './api';
import { Sucursal, CrearSucursalDto, ActualizarSucursalDto, ActualizarHorariosDto } from '@/interfaces';

export class SucursalesService {
  private static readonly BASE_URL = '/sucursales';

  /**
   * Obtener lista de todas las sucursales
   */
  static async getSucursales(): Promise<Sucursal[]> {
    const response = await api.get<{ success: true; data: Sucursal[] }>(this.BASE_URL);
    return response.data;
  }

  /**
   * Obtener una sucursal específica
   */
  static async getSucursal(id: string): Promise<Sucursal> {
    const response = await api.get<{ success: true; data: Sucursal }>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Crear una nueva sucursal con horarios
   */
  static async createSucursal(data: CrearSucursalDto): Promise<Sucursal> {
    const response = await api.post<{ success: true; data: Sucursal; message: string }>(
      this.BASE_URL,
      data
    );
    return response.data;
  }

  /**
   * Actualizar datos generales de una sucursal
   */
  static async updateSucursal(id: string, data: ActualizarSucursalDto): Promise<Sucursal> {
    const response = await api.put<{ success: true; data: Sucursal; message: string }>(
      `${this.BASE_URL}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Actualizar solo los horarios de una sucursal
   */
  static async updateHorarios(id: string, data: ActualizarHorariosDto): Promise<Sucursal> {
    const response = await api.put<{ success: true; data: Sucursal; message: string }>(
      `${this.BASE_URL}/${id}/horarios`,
      data
    );
    return response.data;
  }

  /**
   * Eliminar una sucursal
   */
  static async deleteSucursal(id: string): Promise<void> {
    await api.delete(`${this.BASE_URL}/${id}`);
  }

  /**
   * Buscar sucursales por nombre, ciudad o dirección
   */
  static async searchSucursales(query: string): Promise<Sucursal[]> {
    const sucursales = await this.getSucursales();
    
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return sucursales;

    return sucursales.filter((sucursal: Sucursal) => 
      sucursal.nombre.toLowerCase().includes(searchTerm) ||
      sucursal.direccion.toLowerCase().includes(searchTerm) ||
      sucursal.ciudad?.toLowerCase().includes(searchTerm) ||
      sucursal.provincia?.toLowerCase().includes(searchTerm)
    );
  }
}

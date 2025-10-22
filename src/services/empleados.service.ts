import api from './api';
import {
  Empleado,
  EmpleadoDto,
  EmpleadoUpdateDto,
  EmpleadosListResponse,
  ActualizarHorariosEmpleadoDto,
  BloqueoEmpleadoDto,
  BloqueoEmpleado,
  EmpleadoSucursal,
  AsignarSucursalesDto
} from '@/interfaces';

export class EmpleadosService {
  private static readonly BASE_URL = '/empleados';

  /**
   * Obtener lista de empleados con paginación
   */
  static async getEmpleados(pagina: number = 1, limite: number = 10): Promise<EmpleadosListResponse> {
    const response = await api.get<EmpleadosListResponse>(
      `${this.BASE_URL}?pagina=${pagina}&limite=${limite}`
    );
    return response;
  }

  /**
   * Obtener todos los empleados sin paginación
   */
  static async getAllEmpleados(): Promise<Empleado[]> {
    const response = await api.get<{
      success: true;
      data: {
        empleados: Empleado[];
        total: number;
        pagina: number;
        totalPaginas: number;
      };
    }>(`${this.BASE_URL}?pagina=1&limite=1000`);
    
    return response.data.empleados;
  }

  /**
   * Obtener un empleado específico
   */
  static async getEmpleado(id: string): Promise<Empleado> {
    const response = await api.get<{ success: true; data: Empleado }>(
      `${this.BASE_URL}/${id}`
    );
    return response.data;
  }

  /**
   * Crear un nuevo empleado
   */
  static async createEmpleado(data: EmpleadoDto): Promise<Empleado> {
    const response = await api.post<{ success: true; data: Empleado; message: string }>(
      this.BASE_URL,
      data
    );
    return response.data;
  }

  /**
   * Actualizar un empleado
   */
  static async updateEmpleado(id: string, data: EmpleadoUpdateDto): Promise<Empleado> {
    const response = await api.put<{ success: true; data: Empleado; message: string }>(
      `${this.BASE_URL}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Eliminar un empleado
   */
  static async deleteEmpleado(id: string): Promise<void> {
    await api.delete(`${this.BASE_URL}/${id}`);
  }

  /**
   * Obtener horarios de un empleado
   */
  static async getHorarios(id: string): Promise<any[]> {
    const response = await api.get<{ success: true; data: any }>(
      `${this.BASE_URL}/${id}/horarios`
    );
    
    // El backend devuelve { success: true, data: [...] }
    // api.get() ya hace response.json(), entonces response = { success, data }
    // Por lo tanto response.data es el array de horarios
    const horarios = response.data || [];
    
    return Array.isArray(horarios) ? horarios : [];
  }

  /**
   * Actualizar horarios de un empleado
   * El backend espera un array directo de horarios, no un objeto wrapper
   * Response: { success: true, data: [horarios...], message: string }
   */
  static async updateHorarios(id: string, horarios: ActualizarHorariosEmpleadoDto['horarios']): Promise<any[]> {
    const response = await api.put<{ success: true; data: any[]; message: string }>(
      `${this.BASE_URL}/${id}/horarios`,
      horarios  // Enviar array directo
    );
    
    // Retornar el array de horarios actualizados
    return response.data;
  }

  /**
   * Obtener bloqueos de un empleado
   */
  static async getBloqueos(id: string, fechaDesde?: string): Promise<BloqueoEmpleado[]> {
    const url = fechaDesde
      ? `${this.BASE_URL}/${id}/bloqueos?fechaDesde=${fechaDesde}`
      : `${this.BASE_URL}/${id}/bloqueos`;
    
    const response = await api.get<{ success: true; data: BloqueoEmpleado[] }>(url);
    return response.data;
  }

  /**
   * Crear un bloqueo para un empleado
   */
  static async createBloqueo(id: string, data: BloqueoEmpleadoDto): Promise<BloqueoEmpleado> {
    const response = await api.post<{ success: true; data: BloqueoEmpleado; message: string }>(
      `${this.BASE_URL}/${id}/bloqueos`,
      data
    );
    return response.data;
  }

  /**
   * Eliminar un bloqueo de un empleado
   */
  static async deleteBloqueo(empleadoId: string, bloqueoId: string): Promise<void> {
    await api.delete(`${this.BASE_URL}/${empleadoId}/bloqueos/${bloqueoId}`);
  }

  /**
   * Obtener sucursales asignadas a un empleado
   */
  static async getSucursales(id: string): Promise<EmpleadoSucursal[]> {
    const response = await api.get<{ success: true; data: EmpleadoSucursal[] }>(
      `${this.BASE_URL}/${id}/sucursales`
    );
    return response.data;
  }

  /**
   * Asignar empleado a sucursales
   */
  static async asignarSucursales(id: string, data: AsignarSucursalesDto): Promise<EmpleadoSucursal[]> {
    const response = await api.post<{ success: true; data: EmpleadoSucursal[]; message: string }>(
      `${this.BASE_URL}/${id}/sucursales`,
      data
    );
    return response.data;
  }

  /**
   * Desasignar empleado de una sucursal
   */
  static async desasignarSucursal(empleadoId: string, sucursalId: string): Promise<void> {
    await api.delete(`${this.BASE_URL}/${empleadoId}/sucursales/${sucursalId}`);
  }
}

export default EmpleadosService;

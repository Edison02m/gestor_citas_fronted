import api from './api';
import { Cliente, CreateClienteDto, UpdateClienteDto, ClientesListResponse } from '@/interfaces';

export class ClientesService {
  private static readonly BASE_URL = '/clientes';

  /**
   * Obtener lista de clientes con paginación
   */
  static async getClientes(pagina: number = 1, limite: number = 50): Promise<ClientesListResponse['data']> {
    const response = await api.get<ClientesListResponse>(
      `${this.BASE_URL}?pagina=${pagina}&limite=${limite}`
    );
    return response.data;
  }

  /**
   * Crear un nuevo cliente
   */
  static async createCliente(data: CreateClienteDto): Promise<Cliente> {
    const response = await api.post<{ success: true; data: Cliente; message: string }>(
      this.BASE_URL,
      data
    );
    return response.data;
  }

  /**
   * Actualizar un cliente existente
   */
  static async updateCliente(id: string, data: UpdateClienteDto): Promise<Cliente> {
    const response = await api.put<{ success: true; data: Cliente; message: string }>(
      `${this.BASE_URL}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Eliminar un cliente
   */
  static async deleteCliente(id: string): Promise<void> {
    await api.delete(`${this.BASE_URL}/${id}`);
  }

  /**
   * Buscar clientes por nombre, cédula, teléfono o email
   */
  static async searchClientes(query: string): Promise<Cliente[]> {
    const { clientes } = await this.getClientes(1, 999);
    
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return clientes;

    return clientes.filter((cliente: Cliente) => 
      cliente.nombre.toLowerCase().includes(searchTerm) ||
      cliente.cedula.includes(searchTerm) ||
      cliente.telefono.includes(searchTerm) ||
      cliente.email?.toLowerCase().includes(searchTerm)
    );
  }
}

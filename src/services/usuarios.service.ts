// src/services/usuarios.service.ts

import api from './api';

export interface RegisterUsuarioDto {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
  logo?: string;
  descripcion?: string;
}

export interface UsuarioResponse {
  id: string;
  email: string;
  rol: string;
  primerLogin: boolean;
  activo: boolean;
  negocio?: {
    id: string;
    nombre: string;
    telefono: string;
    logo?: string;
    descripcion?: string;
    estadoSuscripcion: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class UsuariosService {
  /**
   * REGISTER - Registrar nuevo usuario
   */
  static async register(data: RegisterUsuarioDto): Promise<UsuarioResponse> {
    try {
      const response = await api.post<{
        success: boolean;
        data: UsuarioResponse;
        message: string;
      }>('/usuarios/register', data);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrar usuario');
    }
  }
}

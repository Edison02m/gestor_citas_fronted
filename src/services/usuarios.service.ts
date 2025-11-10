// src/services/usuarios.service.ts

import api from './api';

export interface RegisterUsuarioDto {
  email: string;
  password: string;
  nombre: string; // Nombre del usuario/administrador
  nombreNegocio: string; // Nombre del negocio
  telefono: string;
  logo?: string;
  descripcion?: string;
}

export interface UsuarioResponse {
  id: string;
  email: string;
  nombre: string; // Nombre del usuario
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

export interface ActualizarPerfilDto {
  nombre?: string;
  email?: string;
}

export interface CambiarPasswordDto {
  passwordActual: string;
  passwordNueva: string;
  passwordNuevaConfirm: string;
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

  /**
   * ACTUALIZAR PERFIL - Actualizar datos personales del usuario
   */
  static async actualizarPerfil(data: ActualizarPerfilDto): Promise<UsuarioResponse> {
    try {
      const response = await api.patch<{
        success: boolean;
        data: UsuarioResponse;
        message: string;
      }>('/usuarios/perfil', data);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
    }
  }

  /**
   * CAMBIAR PASSWORD - Cambiar contraseña del usuario
   */
  static async cambiarPassword(data: CambiarPasswordDto): Promise<void> {
    try {
      await api.patch<{
        success: boolean;
        message: string;
      }>('/usuarios/cambiar-password', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  }
}

import api from './api';
import { LoginRequest, LoginResponse, User } from '@/interfaces';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export class AuthService {
  /**
   * LOGIN - Autenticar usuario (SuperAdmin o Usuario)
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      // Guardar token y usuario en localStorage
      this.setToken(response.data.token);
      this.setUser(response.data.user);
      
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }

  /**
   * GET ME - Obtener información del usuario autenticado
   */
  static async getMe(): Promise<User> {
    try {
      const response = await api.get<{ success: boolean; data: User }>('/auth/me');
      this.setUser(response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener información del usuario');
    }
  }

  /**
   * LOGOUT - Cerrar sesión
   */
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  /**
   * Guardar token en localStorage
   */
  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  /**
   * Obtener token desde localStorage
   */
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  /**
   * Guardar usuario en localStorage
   */
  static setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Obtener usuario desde localStorage
   */
  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Verificar si es SuperAdmin
   */
  static isSuperAdmin(): boolean {
    const user = this.getUser();
    return user?.rol === 'SUPER_ADMIN';
  }

  /**
   * Verificar si es Usuario/Negocio
   */
  static isUsuario(): boolean {
    const user = this.getUser();
    return user?.rol === 'ADMIN_NEGOCIO';
  }
}

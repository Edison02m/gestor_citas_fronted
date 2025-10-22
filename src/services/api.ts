const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Obtener el token de autenticación
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Manejar errores de suscripción
 */
function handleSubscriptionError(error: any): void {
  if (error.code) {
    switch (error.code) {
      case 'SUBSCRIPTION_EXPIRED':
        // Redirigir a página de activación de código
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/activar-codigo?expired=true';
        }
        break;
      case 'NO_SUBSCRIPTION':
        // Redirigir a página de activación
        if (typeof window !== 'undefined') {
          window.location.href = '/activar-codigo';
        }
        break;
      case 'SUBSCRIPTION_BLOCKED':
      case 'SUBSCRIPTION_CANCELLED':
        // Cerrar sesión y redirigir al login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/auth?blocked=true';
        }
        break;
    }
  }
}

/**
 * Cliente HTTP con soporte para autenticación JWT
 */
const api = {
  async get<T>(endpoint: string): Promise<T> {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
      
      // 🔥 Interceptar errores de suscripción
      if (response.status === 403) {
        handleSubscriptionError(error);
      }
      
      throw { response: { data: error } };
    }

    return response.json();
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
      
      // 🔥 Interceptar errores de suscripción
      if (response.status === 403) {
        handleSubscriptionError(error);
      }
      
      throw { response: { data: error, status: response.status } };
    }

    return response.json();
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
      
      // 🔥 Interceptar errores de suscripción
      if (response.status === 403) {
        handleSubscriptionError(error);
      }
      
      throw { response: { data: error } };
    }

    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
      
      // 🔥 Interceptar errores de suscripción
      if (response.status === 403) {
        handleSubscriptionError(error);
      }
      
      throw { response: { data: error } };
    }

    return response.json();
  },

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
      
      // 🔥 Interceptar errores de suscripción
      if (response.status === 403) {
        handleSubscriptionError(error);
      }
      
      throw { response: { data: error } };
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
      throw { response: { data: error } };
    }

    return response.json();
  },
};

export default api;

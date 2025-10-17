'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { User, AuthContextType } from '@/interfaces';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiereCodigoActivacion, setRequiereCodigoActivacion] = useState(false);
  const router = useRouter();

  // Cargar usuario y token al iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedToken = AuthService.getToken();
        const savedUser = AuthService.getUser();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);

          // Opcional: Verificar que el token siga siendo válido
          try {
            const currentUser = await AuthService.getMe();
            setUser(currentUser);
          } catch (error) {
            // Token inválido, limpiar
            AuthService.logout();
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login({ email, password });
      
      setToken(response.data.token);
      setUser(response.data.user);
      setRequiereCodigoActivacion(response.data.requiereCodigoActivacion || false);

      // Redirigir según el tipo de usuario
      if (response.data.user.rol === 'SUPER_ADMIN') {
        // SuperAdmin va al dashboard principal
        router.push('/dashboard');
      } else {
        // Usuario/Negocio
        if (response.data.requiereCodigoActivacion) {
          // Necesita activar código primero
          router.push('/activar-codigo');
        } else {
          // Ya tiene suscripción activa
          router.push('/dashboard-usuario');
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const logout = () => {
    AuthService.logout();
    setToken(null);
    setUser(null);
    setRequiereCodigoActivacion(false);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getMe();
      setUser(currentUser);
      AuthService.setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!token && !!user,
    isLoading,
    requiereCodigoActivacion,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UsuariosService } from '@/services/usuarios.service';
import Image from 'next/image';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [registerStep, setRegisterStep] = useState(1); // Paso del registro (1, 2, 3)

  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Register state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    telefono: '',
    logo: '',
    descripcion: '',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mostrar mensaje de éxito si viene desde otro lugar
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
      setIsLogin(true);
    }
  }, [searchParams]);

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.rol === 'SUPER_ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard-usuario');
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Cambiar entre login y register con animación
  const toggleMode = () => {
    setIsAnimating(true);
    setError('');
    setSuccessMessage('');
    setRegisterStep(1); // Reset al paso 1 cuando cambiamos de modo
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimating(false);
    }, 300);
  };

  // Navegar entre pasos del registro (ahora solo 2 pasos)
  const nextStep = () => {
    if (registerStep < 2) setRegisterStep(registerStep + 1);
  };

  const prevStep = () => {
    if (registerStep > 1) setRegisterStep(registerStep - 1);
  };

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!loginData.email || !loginData.password) {
      setError('Por favor ingresa email y contraseña');
      setIsLoading(false);
      return;
    }

    try {
      await login(loginData.email, loginData.password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación Paso 1: Datos del negocio
    if (registerStep === 1) {
      if (!registerData.nombre || !registerData.telefono) {
        setError('Por favor completa todos los campos del negocio');
        return;
      }
      nextStep();
      return;
    }

    // Paso 2: Validación final y envío (Email y Contraseña)
    if (registerStep === 2) {
      setIsLoading(true);

      if (!registerData.email || !registerData.password) {
        setError('Email y contraseña son requeridos');
        setIsLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerData.email)) {
        setError('Email inválido');
        setIsLoading(false);
        return;
      }

      if (registerData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setIsLoading(false);
        return;
      }

      if (registerData.password !== registerData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        setIsLoading(false);
        return;
      }

      try {
        await UsuariosService.register({
          email: registerData.email,
          password: registerData.password,
          nombre: registerData.nombre,
          telefono: registerData.telefono,
          logo: registerData.logo || undefined,
          descripcion: registerData.descripcion || undefined,
        });

        setSuccessMessage('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
        setRegisterData({
          email: '',
          password: '',
          confirmPassword: '',
          nombre: '',
          telefono: '',
          logo: '',
          descripcion: '',
        });
        setRegisterStep(1);
        
        // Cambiar a login después de 1.5 segundos
        setTimeout(() => {
          toggleMode();
        }, 1500);
      } catch (err: any) {
        setError(err.message || 'Error al registrar usuario. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E6E6E6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0490C8] mx-auto"></div>
          <p className="mt-4 text-[#023664]">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6E6E6] px-4 py-8 relative overflow-hidden">
      {/* Decoración de fondo sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#59C7F3]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0490C8]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FAD105]/3 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Logo en móvil - Solo visible en mobile */}
        <div className="md:hidden mb-6 text-center">
          <img 
            src="/Assets/logo_citaYA.png" 
            alt="CitaYa Logo" 
            className="w-40 h-auto mx-auto"
          />
        </div>

        {/* Contenedor Principal - Isla */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E6E6E6]">
          <div className="flex flex-col md:flex-row md:h-[600px]">
            {/* Lado Izquierdo */}
            <div
              className={`w-full md:w-1/2 p-6 md:p-8 flex items-center justify-center transition-all duration-500 ease-in-out ${
                isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
              }`}
            >
              {isLogin ? (
                // FORMULARIO DE LOGIN
                <div className="w-full max-w-sm">
                  <h2 className="text-2xl font-bold text-[#023664] mb-2">Bienvenido</h2>
                  <p className="text-gray-600 mb-6">Inicia sesión en tu cuenta</p>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                      <label htmlFor="login-email" className="block text-sm font-medium text-[#023664] mb-2">
                        Email
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-[#E6E6E6] rounded-xl focus:outline-none focus:border-[#0490C8] text-gray-900 bg-white transition-colors"
                        placeholder="tu-email@ejemplo.com"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="login-password" className="block text-sm font-medium text-[#023664] mb-2">
                        Contraseña
                      </label>
                      <input
                        id="login-password"
                        type="password"
                        required
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-[#E6E6E6] rounded-xl focus:outline-none focus:border-[#0490C8] text-gray-900 bg-white transition-colors"
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                      <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                        {error}
                      </div>
                    )}
                    {successMessage && (
                      <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                        {successMessage}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#0490C8] hover:bg-[#023664] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                  </form>

                  {/* Link minimalista para registrarse */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      ¿No tienes cuenta?{' '}
                      <button
                        onClick={toggleMode}
                        disabled={isAnimating}
                        className="text-[#0490C8] hover:text-[#023664] font-semibold transition-colors disabled:opacity-50"
                      >
                        Regístrate aquí
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                // DECORACIÓN MEJORADA (cuando está en modo registro) - Solo desktop
                <div className="hidden md:block text-center">
                  <div className="mb-8">
                    <img 
                      src="/Assets/logo_citaYA.png" 
                      alt="CitaYa Logo" 
                      className="w-48 h-auto mx-auto"
                    />
                  </div>
                  <h2 className="text-3xl font-bold text-[#023664] mb-4">¡Únete ahora!</h2>
                  <p className="text-base text-gray-600 mb-8">
                    Comienza a gestionar tu negocio hoy
                  </p>
                  
                  {/* Beneficios del registro */}
                  <div className="space-y-3 max-w-xs mx-auto">
                    <div className="flex items-center p-4 bg-white border-2 border-[#E6E6E6] rounded-xl hover:border-[#FAD105] transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#FAD105] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#023664]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-sm font-medium text-[#023664]">Rápido y fácil</span>
                    </div>
                    
                    <div className="flex items-center p-4 bg-white border-2 border-[#E6E6E6] rounded-xl hover:border-[#0490C8] transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#0490C8] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-sm font-medium text-[#023664]">100% Seguro</span>
                    </div>
                    
                    <div className="flex items-center p-4 bg-white border-2 border-[#E6E6E6] rounded-xl hover:border-[#59C7F3] transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#59C7F3] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                      </div>
                      <span className="ml-3 text-sm font-medium text-[#023664]">Fácil de usar</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Línea Divisoria Vertical - Estilo Minimalista */}
            <div className="hidden md:flex flex-col items-center justify-center gap-4 px-4">
              <div className="w-0.5 h-40 bg-gradient-to-b from-transparent via-[#E6E6E6] to-transparent opacity-60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#E6E6E6] opacity-60"></div>
              <div className="w-0.5 h-40 bg-gradient-to-b from-transparent via-[#E6E6E6] to-transparent opacity-60"></div>
            </div>

            {/* Lado Derecho */}
            <div
              className={`w-full md:w-1/2 p-6 md:p-8 flex items-center justify-center transition-all duration-500 ease-in-out bg-white ${isAnimating ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'}`}
            >
              {isLogin ? (
                // DECORACIÓN MEJORADA (cuando está en modo login) - Solo desktop
                <div className="hidden md:block text-center">
                  <div className="mb-8">
                    <img 
                      src="/Assets/logo_citaYA.png" 
                      alt="CitaYa Logo" 
                      className="w-48 h-auto mx-auto"
                    />
                  </div>
                  <h2 className="text-3xl font-bold text-[#023664] mb-4">¡Bienvenido de nuevo!</h2>
                  <p className="text-base text-gray-600 mb-8">
                    Gestiona tu negocio de manera profesional
                  </p>
                  
                  {/* Características destacadas */}
                  <div className="space-y-3 max-w-xs mx-auto">
                    <div className="flex items-center p-4 bg-white border-2 border-[#E6E6E6] rounded-xl hover:border-[#0490C8] transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#0490C8] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-sm font-medium text-[#023664]">Control total de citas</span>
                    </div>
                    
                    <div className="flex items-center p-4 bg-white border-2 border-[#E6E6E6] rounded-xl hover:border-[#59C7F3] transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#59C7F3] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-sm font-medium text-[#023664]">Gestión de clientes</span>
                    </div>
                    
                    <div className="flex items-center p-4 bg-white border-2 border-[#E6E6E6] rounded-xl hover:border-[#FAD105] transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#FAD105] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#023664]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-sm font-medium text-[#023664]">Reportes detallados</span>
                    </div>
                  </div>
                </div>
              ) : (
                // FORMULARIO DE REGISTRO CON 2 PASOS
                <div className="w-full max-w-sm">
                  {/* Indicador de Progreso - Solo 2 pasos */}
                  <div className="mb-4 md:mb-6">
                    <div className="flex items-center justify-center gap-2 md:gap-4">
                      <div className={`flex items-center ${registerStep >= 1 ? 'text-[#0490C8]' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${registerStep >= 1 ? 'bg-[#0490C8] text-white' : 'bg-[#E6E6E6] text-gray-500'}`}>
                          {registerStep > 1 ? '✓' : '1'}
                        </div>
                        <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium">Negocio</span>
                      </div>
                      <div className={`flex-1 h-1 max-w-[60px] md:max-w-[80px] rounded ${registerStep >= 2 ? 'bg-[#0490C8]' : 'bg-[#E6E6E6]'}`}></div>
                      <div className={`flex items-center ${registerStep >= 2 ? 'text-[#0490C8]' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${registerStep >= 2 ? 'bg-[#0490C8] text-white' : 'bg-[#E6E6E6] text-gray-500'}`}>
                          2
                        </div>
                        <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium">Seguridad</span>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-[#023664] mb-2">
                    {registerStep === 1 && 'Cuéntanos sobre tu negocio'}
                    {registerStep === 2 && 'Información de Acceso'}
                  </h2>
            

                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    {/* PASO 1: Datos del Negocio */}
                    {registerStep === 1 && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-[#023664] mb-1">
                            Nombre del Negocio *
                          </label>
                          <input
                            type="text"
                            required
                            value={registerData.nombre}
                            onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-[#E6E6E6] rounded-xl focus:outline-none focus:border-[#0490C8] text-gray-900 bg-white transition-colors"
                            placeholder="Ej: Barbería Elite"
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#023664] mb-1">Teléfono *</label>
                          <input
                            type="tel"
                            required
                            value={registerData.telefono}
                            onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-[#E6E6E6] rounded-xl focus:outline-none focus:border-[#0490C8] text-gray-900 bg-white transition-colors"
                            placeholder="+593999888777"
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#023664] mb-1">Logo (opcional)</label>
                          <input
                            type="url"
                            value={registerData.logo}
                            onChange={(e) => setRegisterData({ ...registerData, logo: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-[#E6E6E6] rounded-xl focus:outline-none focus:border-[#0490C8] text-gray-900 bg-white transition-colors"
                            placeholder="URL del logo"
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#023664] mb-1">
                            Descripción (opcional)
                          </label>
                          <textarea
                            rows={1}
                            value={registerData.descripcion}
                            onChange={(e) => setRegisterData({ ...registerData, descripcion: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-[#E6E6E6] rounded-xl focus:outline-none focus:border-[#0490C8] text-gray-900 bg-white resize-none transition-colors"
                            placeholder="Describe tu negocio..."
                            disabled={isLoading}
                          />
                        </div>
                      </>
                    )}

                    {/* PASO 2: Email y Contraseña */}
                    {registerStep === 2 && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-[#023664] mb-1">Email *</label>
                          <input
                            type="email"
                            required
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-[#E6E6E6] rounded-xl focus:outline-none focus:border-[#0490C8] text-gray-900 bg-white transition-colors"
                            placeholder="tu-email@ejemplo.com"
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#023664] mb-1">Contraseña *</label>
                          <input
                            type="password"
                            required
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-[#E6E6E6] rounded-xl focus:outline-none focus:border-[#0490C8] text-gray-900 bg-white transition-colors"
                            placeholder="Mínimo 6 caracteres"
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#023664] mb-1">
                            Confirmar Contraseña *
                          </label>
                          <input
                            type="password"
                            required
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-[#E6E6E6] rounded-xl focus:outline-none focus:border-[#0490C8] text-gray-900 bg-white transition-colors"
                            placeholder="Repite tu contraseña"
                            disabled={isLoading}
                          />
                        </div>
                      </>
                    )}

                    {/* Error/Success Messages */}
                    {error && (
                      <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                        {error}
                      </div>
                    )}
                    {successMessage && (
                      <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                        {successMessage}
                      </div>
                    )}

                    {/* Botones de Navegación */}
                    <div className="flex gap-3 pt-2">
                      {registerStep > 1 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          disabled={isLoading}
                          className="flex-1 border-2 border-[#E6E6E6] text-[#023664] hover:border-[#0490C8] hover:bg-[#F5F5F5] font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
                        >
                          ← Atrás
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`${registerStep === 1 ? 'w-full' : 'flex-1'} bg-[#0490C8] hover:bg-[#023664] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg`}
                      >
                        {isLoading ? 'Procesando...' : registerStep === 2 ? '✓ Crear Cuenta' : 'Siguiente →'}
                      </button>
                    </div>

                    {/* Link minimalista Ya tengo cuenta */}
                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-500">
                        ¿Ya tienes cuenta?{' '}
                        <button
                          type="button"
                          onClick={toggleMode}
                          disabled={isAnimating || isLoading}
                          className="text-[#0490C8] hover:text-[#023664] font-semibold transition-colors disabled:opacity-50"
                        >
                          Inicia sesión aquí
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[#023664]/70 text-sm">
            © 2025 Gestor de Citas. Sistema profesional de gestión de citas.
          </p>
        </div>
      </div>
    </div>
  );
}

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
  const [isScrolled, setIsScrolled] = useState(false);

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
    nombre: '', // Nombre del usuario
    nombreNegocio: '', // Nombre del negocio
    telefono: '',
    logo: '',
    descripcion: '',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Detectar scroll para cambiar el navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Detectar modo inicial (login o register)
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    }
  }, [searchParams]);

  // Mostrar mensaje de éxito si viene desde otro lugar
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
      setIsLogin(true);
    }
  }, [searchParams]);

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

  // Navegar entre pasos del registro (ahora 3 pasos)
  const nextStep = () => {
    if (registerStep < 3) setRegisterStep(registerStep + 1);
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

    // Validación Paso 1: Información Personal
    if (registerStep === 1) {
      if (!registerData.nombre || !registerData.telefono) {
        setError('Por favor completa todos los campos requeridos');
        return;
      }
      if (registerData.nombre.length < 2) {
        setError('El nombre debe tener al menos 2 caracteres');
        return;
      }
      nextStep();
      return;
    }

    // Validación Paso 2: Información del Negocio
    if (registerStep === 2) {
      if (!registerData.nombreNegocio) {
        setError('El nombre del negocio es requerido');
        return;
      }
      nextStep();
      return;
    }

    // Paso 3: Validación final y envío (Email y Contraseña)
    if (registerStep === 3) {
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
        // Registrar usuario
        await UsuariosService.register({
          email: registerData.email,
          password: registerData.password,
          nombre: registerData.nombre,
          nombreNegocio: registerData.nombreNegocio,
          telefono: registerData.telefono,
          logo: registerData.logo || undefined,
          descripcion: registerData.descripcion || undefined,
        });

        setSuccessMessage('¡Cuenta creada exitosamente! Iniciando sesión...');
        
        // Auto-login: Iniciar sesión automáticamente con las credenciales
        try {
          await login(registerData.email, registerData.password);
          // El useEffect se encargará de redirigir al dashboard correspondiente
        } catch (loginErr: any) {
          // Si falla el auto-login, mostrar mensaje para que inicie sesión manualmente
          setSuccessMessage('¡Cuenta creada! Por favor, inicia sesión.');
          setRegisterData({
            email: '',
            password: '',
            confirmPassword: '',
            nombre: '',
            nombreNegocio: '',
            telefono: '',
            logo: '',
            descripcion: '',
          });
          setRegisterStep(1);
          setTimeout(() => {
            toggleMode();
          }, 2000);
        }
      } catch (err: any) {
        setError(err.message || 'Error al registrar usuario. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Restablecer opacidad al cargar la página
  useEffect(() => {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.3s ease-in';
  }, []);

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0490C8] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Navbar Superior - Estilo Landing */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200' 
          : 'bg-white border-b border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Clickeable para volver al inicio */}
            <button
              onClick={() => {
                document.body.style.transition = 'opacity 0.3s ease-out';
                document.body.style.opacity = '0.95';
                setTimeout(() => router.push('/'), 200);
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/Assets/logo_citaYA.png" 
                alt="CitaYa Logo" 
                className="h-10 w-auto"
              />
            </button>

            {/* Botón de regreso al inicio */}
            <button
              onClick={() => {
                document.body.style.transition = 'opacity 0.3s ease-out';
                document.body.style.opacity = '0.95';
                setTimeout(() => router.push('/'), 200);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#0490C8] hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Volver al inicio</span>
              <span className="sm:hidden">Inicio</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenedor principal con padding top para compensar el navbar */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 pt-24">
        <div className="w-full max-w-md">

        {/* Contenedor Principal - Diseño Centrado */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-10 shadow-sm">
          <div
            className={`transition-all duration-500 ease-in-out ${
              isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {isLogin ? (
              // FORMULARIO DE LOGIN CENTRADO
              <div className="w-full">
                {/* Ícono/Ilustración arriba */}
                <div className="text-center mb-8">
                  <div className="mb-4">
                    <svg className="w-12 h-12 mx-auto text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h2>
                  <p className="text-sm text-gray-600">
                    La forma más simple de gestionar tu negocio
                  </p>
                </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                      <label htmlFor="login-email" className="block text-sm font-medium text-gray-900 mb-2">
                        Email
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 bg-white transition-all"
                        placeholder="tu-email@ejemplo.com"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="login-password" className="block text-sm font-medium text-gray-900 mb-2">
                        Contraseña
                      </label>
                      <div className="relative">
                        <input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          required
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 bg-white transition-all"
                          placeholder="••••••••"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showLoginPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                        {error}
                      </div>
                    )}
                    {successMessage && (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm">
                        {successMessage}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#0490C8] hover:bg-[#023664] text-white font-semibold py-3 px-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                  </form>                {/* Link para registrarse */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
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
              // FORMULARIO DE REGISTRO CENTRADO
              <div className="w-full">
                {/* Ícono/Ilustración arriba */}
                <div className="text-center mb-6">
                  <div className="mb-4">
                    <svg className="w-12 h-12 mx-auto text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Únete ahora!</h2>
                  <p className="text-sm text-gray-600">
                    Comienza a gestionar tu negocio hoy
                  </p>
                </div>

                {/* Indicador de Progreso - 3 Pasos */}
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2">
                    {/* Paso 1 */}
                    <div className={`flex items-center ${registerStep >= 1 ? 'text-[#0490C8]' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${registerStep >= 1 ? 'bg-[#0490C8] text-white' : 'bg-gray-200 text-gray-500'} transition-all`}>
                        {registerStep > 1 ? '✓' : '1'}
                      </div>
                      <span className="ml-1.5 text-xs font-medium hidden sm:inline">Personal</span>
                    </div>
                    
                    {/* Línea conectora 1-2 */}
                    <div className={`flex-1 h-0.5 max-w-[40px] rounded-full ${registerStep >= 2 ? 'bg-[#0490C8]' : 'bg-gray-200'} transition-all`}></div>
                    
                    {/* Paso 2 */}
                    <div className={`flex items-center ${registerStep >= 2 ? 'text-[#0490C8]' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${registerStep >= 2 ? 'bg-[#0490C8] text-white' : 'bg-gray-200 text-gray-500'} transition-all`}>
                        {registerStep > 2 ? '✓' : '2'}
                      </div>
                      <span className="ml-1.5 text-xs font-medium hidden sm:inline">Negocio</span>
                    </div>
                    
                    {/* Línea conectora 2-3 */}
                    <div className={`flex-1 h-0.5 max-w-[40px] rounded-full ${registerStep >= 3 ? 'bg-[#0490C8]' : 'bg-gray-200'} transition-all`}></div>
                    
                    {/* Paso 3 */}
                    <div className={`flex items-center ${registerStep >= 3 ? 'text-[#0490C8]' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${registerStep >= 3 ? 'bg-[#0490C8] text-white' : 'bg-gray-200 text-gray-500'} transition-all`}>
                        3
                      </div>
                      <span className="ml-1.5 text-xs font-medium hidden sm:inline">Cuenta</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* PASO 1: Información Personal */}
                  {registerStep === 1 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Tu nombre completo *
                        </label>
                        <input
                          type="text"
                          required
                          minLength={2}
                          value={registerData.nombre}
                          onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 bg-white transition-all"
                          placeholder="Ej: Juan Pérez"
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Teléfono de contacto *
                        </label>
                        <input
                          type="tel"
                          required
                          value={registerData.telefono}
                          onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 bg-white transition-all"
                          placeholder="+593 999 888 777"
                          disabled={isLoading}
                        />
                      </div>
                    </>
                  )}

                  {/* PASO 2: Información del Negocio */}
                  {registerStep === 2 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Nombre del negocio *
                        </label>
                        <input
                          type="text"
                          required
                          value={registerData.nombreNegocio}
                          onChange={(e) => setRegisterData({ ...registerData, nombreNegocio: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 bg-white transition-all"
                          placeholder="Ej: Barbería Elite"
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Logo del negocio (opcional)
                        </label>
                        <input
                          type="url"
                          value={registerData.logo}
                          onChange={(e) => setRegisterData({ ...registerData, logo: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 bg-white transition-all"
                          placeholder="https://ejemplo.com/logo.png"
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Descripción breve (opcional)
                        </label>
                        <textarea
                          rows={2}
                          value={registerData.descripcion}
                          onChange={(e) => setRegisterData({ ...registerData, descripcion: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 bg-white resize-none transition-all"
                          placeholder="Describe brevemente tu negocio..."
                          disabled={isLoading}
                        />
                      </div>
                    </>
                  )}

                  {/* PASO 3: Credenciales de Acceso */}
                  {registerStep === 3 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 bg-white transition-all"
                          placeholder="tu-email@ejemplo.com"
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Contraseña *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 bg-white transition-all"
                            placeholder="Mínimo 6 caracteres"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Confirmar Contraseña *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 bg-white transition-all"
                            placeholder="Repite tu contraseña"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Error/Success Messages */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                      {error}
                    </div>
                  )}
                  {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm">
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
                        className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-2xl transition-all disabled:opacity-50"
                      >
                        ← Atrás
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`${registerStep === 1 ? 'w-full' : 'flex-1'} bg-[#0490C8] hover:bg-[#023664] text-white font-semibold py-3 px-4 rounded-2xl transition-all disabled:opacity-50 shadow-sm hover:shadow-md`}
                    >
                      {isLoading ? 'Procesando...' : registerStep === 3 ? 'Crear Cuenta' : 'Siguiente →'}
                    </button>
                  </div>

                  {/* Link Ya tengo cuenta */}
                  <div className="mt-5 text-center">
                    <p className="text-sm text-gray-600">
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

        {/* Footer minimalista */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            © 2025 CitaYA. Sistema profesional de gestión de citas.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}

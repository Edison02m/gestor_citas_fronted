'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Head from 'next/head';
import { 
  Calendar, Clock, Users, Zap, Shield, 
  TrendingUp, ArrowRight, BarChart3,
  Bell, Lock, Smartphone, CheckCircle2,
  Building2, Briefcase, ChevronDown, FileText,
  Settings, UserCheck, MapPin, DollarSign, PieChart, Activity,
  Layers,
  Menu, X, Sparkles, Grid3x3, Play, Star
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState(0);
  const [showPage, setShowPage] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  
  useEffect(() => {
    // Restablecer opacidad al cargar
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.3s ease-in';
    
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        setShowPage(true);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveModule((prev) => (prev + 1) % 7);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Detectar scroll para navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    // Animación suave antes de navegar
    document.body.style.transition = 'opacity 0.3s ease-out';
    document.body.style.opacity = '0.95';
    setTimeout(() => {
      router.push('/auth?mode=register');
    }, 200);
  };

  const handleLogin = () => {
    // Animación suave antes de navegar
    document.body.style.transition = 'opacity 0.3s ease-out';
    document.body.style.opacity = '0.95';
    setTimeout(() => {
      router.push('/auth');
    }, 200);
  };

  const modules = [
    { 
      name: 'Sistema de Agendamiento de Citas', 
      icon: Calendar, 
      color: '#0490C8',
      features: ['Calendario interactivo', 'Drag & drop', 'Múltiples vistas', 'Recordatorios automáticos']
    },
    { 
      name: 'Clientes', 
      icon: Users, 
      color: '#59C7F3',
      features: ['Perfiles completos', 'Historial de citas', 'Búsqueda inteligente', 'Notas personalizadas']
    },
    { 
      name: 'Empleados', 
      icon: Briefcase, 
      color: '#023664',
      features: ['Horarios flexibles', 'Control de vacaciones', 'Asignación múltiple', 'Identificación visual']
    },
    { 
      name: 'Sucursales', 
      icon: Building2, 
      color: '#0490C8',
      features: ['Múltiples ubicaciones', 'Horarios por día', 'Google Maps', 'Gestión centralizada']
    },
    { 
      name: 'Servicios', 
      icon: Settings, 
      color: '#59C7F3',
      features: ['Catálogo completo', 'Precios dinámicos', 'Extras configurables', 'Duración automática']
    },
    { 
      name: 'Agenda Visual', 
      icon: Activity, 
      color: '#023664',
      features: ['Vista día/semana/mes', 'Filtros avanzados', 'Edición rápida', 'Código de colores']
    },
    { 
      name: 'Reportes', 
      icon: BarChart3, 
      color: '#0490C8',
      features: ['Análisis financiero', 'Métricas de desempeño', 'Exportación PDF/Excel', 'Dashboards']
    }
  ];

  if (isLoading || !showPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#023664] via-[#0490C8] to-[#59C7F3]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#FAD105] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      {/* Navbar Superior Flotante */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Image 
                src="/Assets/logo_citaYA.png" 
                alt="CitaYA Logo" 
                width={128} 
                height={48}
                className="h-10 w-auto"
                priority
              />
            </motion.div>

            {/* Menu Desktop */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Opción Inicio - Solo visible cuando se hace scroll */}
              {isScrolled && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group flex items-center gap-2 text-sm font-medium transition-colors relative text-gray-700 hover:text-[#0490C8]"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Layers className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span>Inicio</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0490C8] group-hover:w-full transition-all duration-300" />
                </motion.button>
              )}
              
              {/* Opciones principales - Siempre visibles */}
              {[
                { name: 'Características', href: '#features', icon: Sparkles, scroll: true },
                { name: 'Módulos', href: '#modules', icon: Grid3x3, scroll: true },
                { name: 'Precios', href: '/planes', icon: DollarSign, scroll: false },
              ].map((item, i) => (
                <motion.button
                  key={i}
                  onClick={() => {
                    if (item.scroll) {
                      const element = document.querySelector(item.href);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    } else {
                      router.push(item.href);
                    }
                  }}
                  className={`group flex items-center gap-2 text-sm font-medium transition-colors relative ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-[#0490C8]' 
                      : 'text-gray-700 hover:text-[#0490C8]'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span>{item.name}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0490C8] group-hover:w-full transition-all duration-300" />
                </motion.button>
              ))}
            </div>

            {/* CTA Buttons Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <motion.button
                onClick={handleLogin}
                className="px-5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#0490C8] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Iniciar Sesión
              </motion.button>
              
              <motion.button
                onClick={handleGetStarted}
                className="group relative px-5 py-2 rounded-lg overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-[#0490C8]" />
                <div className="absolute inset-0 bg-[#023664] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2 text-white text-sm font-medium">
                  <span>Comenzar Gratis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            </div>

            {/* Hamburger Menu Mobile */}
            <motion.button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMenuOpen ? 1 : 0, 
            height: isMenuOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden bg-white border-t border-gray-200"
        >
          <div className="px-4 py-5 space-y-3">
            {/* Opción Inicio - Solo visible cuando se hace scroll */}
            {isScrolled && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => {
                  setIsMenuOpen(false);
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 300);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#0490C8]/10 text-[#023664] font-semibold transition-colors text-left"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Layers className="w-4 h-4 text-[#0490C8]" />
                <span>Inicio</span>
              </motion.button>
            )}
            
            {[
              { name: 'Características', href: '#features', icon: Sparkles, scroll: true },
              { name: 'Módulos', href: '#modules', icon: Grid3x3, scroll: true },
              { name: 'Precios', href: '/planes', icon: DollarSign, scroll: false },
            ].map((item, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  setIsMenuOpen(false);
                  setTimeout(() => {
                    if (item.scroll) {
                      const element = document.querySelector(item.href);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    } else {
                      router.push(item.href);
                    }
                  }, 300);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#0490C8]/10 text-[#023664] font-semibold transition-colors text-left"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-4 h-4 text-[#0490C8]" />
                <span>{item.name}</span>
              </motion.button>
            ))}
            
            <div className="pt-4 space-y-3 border-t border-[#023664]/10">
              <motion.button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogin();
                }}
                className="w-full px-6 py-3 rounded-xl font-semibold text-[#023664] hover:bg-[#E6E6E6] transition-colors text-left"
                whileTap={{ scale: 0.95 }}
              >
                Iniciar Sesión
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleGetStarted();
                }}
                className="w-full px-6 py-3 rounded-xl bg-[#0490C8] text-white font-semibold flex items-center justify-center gap-2"
                whileTap={{ scale: 0.95 }}
              >
                <span>Comenzar Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.nav>

      {/* Hero Section - Diseño Minimalista */}
      <section ref={heroRef} className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-16">
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-16">
          
          {/* Lado Izquierdo - Contenido */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-5 relative z-10"
          >
            {/* Badge minimalista */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200"
            >
              <span className="text-xs font-medium text-gray-600">Agendador y Gestor de Citas Profesional</span>
            </motion.div>

            {/* Título con enfoque en beneficio */}
            <div className="space-y-3">
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Reduce hasta un 60%
                <br />
                <span className="text-[#0490C8]">las inasistencias</span>
                <br />
                <span className="text-gray-900 text-3xl sm:text-4xl lg:text-5xl">en tu negocio</span>
              </motion.h1>

              <motion.p 
                className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <span className="font-semibold text-gray-900">Agendador de citas completo</span> con recordatorios automáticos por WhatsApp. Gestiona citas, clientes, empleados y reportes desde un solo lugar.
              </motion.p>
            </div>

            {/* CTA Buttons minimalistas */}
            <motion.div 
              className="flex flex-wrap gap-3 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.button
                onClick={handleGetStarted}
                className="group relative px-6 py-2.5 rounded-lg overflow-hidden bg-[#0490C8] hover:bg-[#023664] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative flex items-center gap-2 text-white font-semibold text-sm">
                  <span>Comenzar Gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>

              <motion.button
                onClick={() => document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-gray-700 font-semibold text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Explorar Módulos
              </motion.button>
            </motion.div>

            {/* Stats minimalistas */}
            <motion.div 
              className="flex flex-wrap gap-5 pt-4 border-t border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              {[
                { value: '7+', label: 'Módulos' },
                { value: '100+', label: 'Funcionalidades' },
                { value: '24/7', label: 'Disponible' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Lado Derecho - Visualización minimalista */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative w-full max-w-md mx-auto space-y-4">
              {/* Card 1 - Próxima cita */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-5 rounded-xl bg-white border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Próxima Cita</div>
                    <div className="font-semibold text-gray-900">María López</div>
                  </div>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">10:30 AM</span>
                  <span className="px-2 py-1 rounded-full bg-[#0490C8]/10 text-[#0490C8] text-xs font-medium">
                    Confirmada
                  </span>
                </div>
              </motion.div>

              {/* Card 2 - Estadísticas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-5 rounded-xl bg-white border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-gray-500">Clientes Hoy</div>
                  <div className="text-2xl font-bold text-gray-900">24</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Confirmadas</span>
                    <span className="font-semibold text-gray-900">18</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">En espera</span>
                    <span className="font-semibold text-gray-900">4</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Nuevas</span>
                    <span className="font-semibold text-gray-900">2</span>
                  </div>
                </div>
              </motion.div>

              {/* Card 3 - Progreso */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="p-5 rounded-xl bg-white border border-gray-200"
              >
                <div className="text-xs text-gray-500 mb-3">Progreso de Hoy</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completadas</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0490C8] rounded-full" style={{ width: '63%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-900">63%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Por atender</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-400 rounded-full" style={{ width: '37%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-900">37%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator minimalista */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </section>

      {/* Sección "Cómo Funciona" - Proceso Simple - DISEÑO SOBRIO */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 mb-5"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-xs font-medium text-gray-700">Gestor de Citas Simple</span>
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              ¿Cómo funciona nuestro agendador?
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Configura tu sistema de agendamiento de citas en 3 pasos simples
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="flex flex-col text-left">
                <div className="flex items-start gap-4 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">01</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Crea tu cuenta gratis
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Regístrate en 30 segundos. Sin tarjeta de crédito, sin compromisos.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Paso 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="flex flex-col text-left">
                <div className="flex items-start gap-4 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">02</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Configura tu negocio
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Agrega servicios, empleados y horarios. Todo en menos de 5 minutos.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Paso 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="flex flex-col text-left">
                <div className="flex items-start gap-4 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">03</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Listo para usar
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Comienza a agendar citas y envía recordatorios automáticos.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA secundario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <motion.button
              onClick={handleGetStarted}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-[#0490C8] text-[#0490C8] font-bold hover:bg-[#0490C8] hover:text-white transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Comenzar ahora gratis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Sección Problema → Solución */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Deja de perder dinero por <span className="text-[#0490C8]">inasistencias</span>
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Un gestor de citas eficiente es la diferencia entre perder dinero o maximizar tu agenda
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Problemas */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 mb-4">
                <span className="text-sm font-bold text-red-600">Sin CitaYA</span>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 p-5 rounded-xl bg-white border border-gray-200">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <X className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">40-60% de inasistencias</h3>
                    <p className="text-sm text-gray-600">Clientes olvidan sus citas y pierdes tiempo e ingresos</p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 rounded-xl bg-white border border-gray-200">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <X className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Agendas desorganizadas</h3>
                    <p className="text-sm text-gray-600">Cuadernos, Excel o WhatsApp que generan confusión y dobles citas</p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 rounded-xl bg-white border border-gray-200">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <X className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Llamadas constantes</h3>
                    <p className="text-sm text-gray-600">Pierdes horas recordando citas manualmente a cada cliente</p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 rounded-xl bg-white border border-gray-200">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <X className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Sin datos claros</h3>
                    <p className="text-sm text-gray-600">No sabes qué servicios venden más ni cómo está tu negocio realmente</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Soluciones */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-4">
                <span className="text-sm font-bold text-[#0490C8]">Con CitaYA</span>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 p-5 rounded-xl bg-gradient-to-br from-[#0490C8]/5 to-[#023664]/5 border border-[#0490C8]/20">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0490C8] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Recordatorios automáticos</h3>
                    <p className="text-sm text-gray-600">WhatsApp envía recordatorios y reduce inasistencias hasta 70%</p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 rounded-xl bg-gradient-to-br from-[#0490C8]/5 to-[#023664]/5 border border-[#0490C8]/20">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0490C8] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Agenda centralizada</h3>
                    <p className="text-sm text-gray-600">Todo en un solo lugar: citas, clientes, empleados y servicios organizados</p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 rounded-xl bg-gradient-to-br from-[#0490C8]/5 to-[#023664]/5 border border-[#0490C8]/20">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0490C8] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Agenda pública 24/7</h3>
                    <p className="text-sm text-gray-600">Tus clientes agendan solos cuando quieran, sin que tengas que atender</p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 rounded-xl bg-gradient-to-br from-[#0490C8]/5 to-[#023664]/5 border border-[#0490C8]/20">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0490C8] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Reportes completos</h3>
                    <p className="text-sm text-gray-600">Ingresos, clientes top, servicios más vendidos - todo visible en tiempo real</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Layout Bento Box */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 mb-5"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-xs font-medium text-gray-700">Sistema de Agendamiento de Citas</span>
            </motion.div>
            
            <h2 className="text-4xl sm:text-5xl font-black mb-5 text-gray-900">
              Agendador de citas completo
              <br />
              <span className="text-[#0490C8]">para tu negocio</span>
            </h2>
            
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Sistema profesional de gestión y agendamiento de citas con todas las herramientas que necesitas
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-auto">
            {/* Feature 1 - Grande */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.01 }}
              className="md:col-span-2 md:row-span-2 p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0490C8]/30 relative overflow-hidden group cursor-pointer transition-all h-full"
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-black text-[#023664]">
                    Agendamiento Completo de Citas
                  </h3>
                  <Calendar className="w-6 h-6 text-[#0490C8] opacity-40 flex-shrink-0 ml-3" />
                </div>
                
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Control total de tu agenda. Previene conflictos de horarios, valida disponibilidad y optimiza tu tiempo automáticamente.
                </p>

                {/* Vista de agenda semanal interactiva */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  {/* Header de días */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {[
                      { day: 'LUN', date: '15' },
                      { day: 'MAR', date: '16' },
                      { day: 'MIÉ', date: '17' },
                      { day: 'JUE', date: '18' },
                      { day: 'VIE', date: '19' },
                      { day: 'SÁB', date: '20' },
                      { day: 'DOM', date: '21' }
                    ].map((item, i) => (
                      <div key={i} className="text-center">
                        <div className="text-[10px] text-gray-500 font-semibold">{item.day}</div>
                        <div className={`text-xs font-bold ${
                          i === 2 ? 'text-[#0490C8]' : 'text-gray-700'
                        }`}>{item.date}</div>
                      </div>
                    ))}
                  </div>

                  {/* Grid de horarios con citas */}
                  <div className="space-y-1">
                    {/* Fila 1 - 9:00 AM */}
                    <div className="grid grid-cols-7 gap-1">
                      <div className="col-span-1 bg-white rounded p-1.5 border border-gray-200">
                        <div className="text-[9px] text-gray-500 mb-0.5">9:00</div>
                        <div className="text-[8px] font-semibold text-gray-700 truncate">Juan P.</div>
                      </div>
                      <div className="bg-white/50 rounded border border-dashed border-gray-200"></div>
                      <motion.div 
                        className="col-span-2 bg-[#0490C8] rounded p-1.5 relative overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-[9px] text-white/80 mb-0.5">9:00-10:30</div>
                        <div className="text-[8px] font-bold text-white truncate">María López</div>
                        <div className="text-[7px] text-white/70 truncate">Corte + Color</div>
                      </motion.div>
                      <div className="bg-white rounded p-1.5 border border-gray-200">
                        <div className="text-[9px] text-gray-500 mb-0.5">9:00</div>
                        <div className="text-[8px] font-semibold text-gray-700 truncate">Ana G.</div>
                      </div>
                      <div className="bg-gray-100 rounded"></div>
                      <div className="bg-gray-100 rounded"></div>
                    </div>

                    {/* Fila 2 - 10:00 AM */}
                    <div className="grid grid-cols-7 gap-1">
                      <div className="bg-white/50 rounded border border-dashed border-gray-200"></div>
                      <motion.div 
                        className="col-span-1 bg-[#59C7F3] rounded p-1.5"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-[9px] text-white/80 mb-0.5">10:00</div>
                        <div className="text-[8px] font-bold text-white truncate">Carlos R.</div>
                      </motion.div>
                      <div className="bg-white/50 rounded border border-dashed border-gray-200"></div>
                      <motion.div 
                        className="col-span-1 bg-[#023664] rounded p-1.5"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-[9px] text-white/80 mb-0.5">10:00</div>
                        <div className="text-[8px] font-bold text-white truncate">Luis M.</div>
                      </motion.div>
                      <div className="bg-white rounded p-1.5 border border-gray-200">
                        <div className="text-[9px] text-gray-500 mb-0.5">10:30</div>
                        <div className="text-[8px] font-semibold text-gray-700 truncate">Sofia T.</div>
                      </div>
                      <div className="bg-gray-100 rounded"></div>
                      <div className="bg-gray-100 rounded"></div>
                    </div>

                    {/* Fila 3 - 11:00 AM */}
                    <div className="grid grid-cols-7 gap-1">
                      <motion.div 
                        className="col-span-1 bg-[#59C7F3] rounded p-1.5"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-[9px] text-white/80 mb-0.5">11:00</div>
                        <div className="text-[8px] font-bold text-white truncate">Pedro S.</div>
                      </motion.div>
                      <div className="bg-white/50 rounded border border-dashed border-gray-200"></div>
                      <div className="col-span-2 bg-white rounded p-1.5 border border-gray-200">
                        <div className="text-[9px] text-gray-500 mb-0.5">11:00</div>
                        <div className="text-[8px] font-semibold text-gray-700 truncate">Andrea V.</div>
                      </div>
                      <div className="bg-white/50 rounded border border-dashed border-gray-200"></div>
                      <div className="bg-gray-100 rounded"></div>
                      <div className="bg-gray-100 rounded"></div>
                    </div>

                    {/* Fila 4 - 12:00 PM */}
                    <div className="grid grid-cols-7 gap-1">
                      <div className="bg-white/50 rounded border border-dashed border-gray-200"></div>
                      <motion.div 
                        className="col-span-2 bg-[#0490C8] rounded p-1.5"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-[9px] text-white/80 mb-0.5">12:00-13:00</div>
                        <div className="text-[8px] font-bold text-white truncate">Laura K.</div>
                        <div className="text-[7px] text-white/70 truncate">Manicure</div>
                      </motion.div>
                      <div className="bg-white rounded p-1.5 border border-gray-200">
                        <div className="text-[9px] text-gray-500 mb-0.5">12:00</div>
                        <div className="text-[8px] font-semibold text-gray-700 truncate">Diego F.</div>
                      </div>
                      <div className="col-span-1 bg-[#023664] rounded p-1.5">
                        <div className="text-[9px] text-white/80 mb-0.5">12:00</div>
                        <div className="text-[8px] font-bold text-white truncate">Lucía H.</div>
                      </div>
                      <div className="bg-gray-100 rounded"></div>
                      <div className="bg-gray-100 rounded"></div>
                    </div>
                  </div>

                  {/* Leyenda */}
                  <div className="flex items-center justify-center gap-3 mt-3 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm bg-[#0490C8]"></div>
                      <span className="text-[9px] text-gray-600">Confirmada</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm bg-[#59C7F3]"></div>
                      <span className="text-[9px] text-gray-600">Pendiente</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm bg-[#023664]"></div>
                      <span className="text-[9px] text-gray-600">En curso</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0490C8]/30 transition-all cursor-pointer group h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#023664]">
                  Gestión de Empleados
                </h3>
                <Briefcase className="w-5 h-5 text-[#0490C8] opacity-40" />
              </div>
              
              <p className="text-gray-600 text-xs mb-4">
                Control completo de horarios, descansos y vacaciones
              </p>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0490C8]" />
                  <span>Horarios personalizados por día</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0490C8]" />
                  <span>Bloques de descanso</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0490C8]" />
                  <span>Vacaciones y días libres</span>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0490C8]/30 transition-all relative overflow-hidden cursor-pointer group h-full flex flex-col"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-[#023664]">
                    Múltiples Sucursales
                  </h3>
                  <MapPin className="w-5 h-5 text-[#0490C8] opacity-40" />
                </div>
                
                <p className="text-gray-600 text-xs mb-4">
                  Gestiona todas tus ubicaciones desde un solo lugar
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0490C8]" />
                    <span>Horarios independientes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0490C8]" />
                    <span>Google Maps integrado</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0490C8]" />
                    <span>Empleados por sucursal</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="md:col-span-2 p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0490C8]/30 transition-all cursor-pointer group h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-[#023664]">
                  Gestión de Clientes
                </h3>
                <Users className="w-5 h-5 text-[#023664] opacity-40" />
              </div>
              
              <p className="text-gray-600 text-xs mb-4">
                Perfiles completos con historial de citas y notas personalizadas
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-center">
                  <UserCheck className="w-5 h-5 text-[#0490C8] mx-auto mb-1" />
                  <div className="text-xs font-semibold text-gray-700">Perfil Completo</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-center">
                  <Clock className="w-5 h-5 text-[#59C7F3] mx-auto mb-1" />
                  <div className="text-xs font-semibold text-gray-700">Historial</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-center">
                  <FileText className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-gray-700">Notas</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-center">
                  <Smartphone className="w-5 h-5 text-[#0490C8] mx-auto mb-1" />
                  <div className="text-xs font-semibold text-gray-700">WhatsApp</div>
                </div>
              </div>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-[#59C7F3] relative overflow-hidden cursor-pointer h-full flex flex-col"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-white">
                    Agenda Visual Inteligente
                  </h3>
                  <Calendar className="w-5 h-5 text-white opacity-60" />
                </div>
                
                <p className="text-white/90 text-xs mb-4">
                  3 vistas de calendario con drag & drop
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-white/90">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Vista Día / Semana / Mes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/90">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Filtros avanzados</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/90">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Código de colores</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0490C8]/30 transition-all cursor-pointer group h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#023664]">
                  Reportes Completos
                </h3>
                <PieChart className="w-5 h-5 text-[#0490C8] opacity-40" />
              </div>
              
              <p className="text-gray-600 text-xs mb-4">
                Análisis de ingresos, clientes y desempeño
              </p>

              <div className="space-y-1.5">
                <div className="text-xs text-gray-600">• Exportar a PDF/Excel</div>
                <div className="text-xs text-gray-600">• Gráficos interactivos</div>
                <div className="text-xs text-gray-600">• Métricas en tiempo real</div>
                <div className="text-xs text-gray-600">• Comparativas por período</div>
              </div>
            </motion.div>

            {/* Feature 7 - WhatsApp Destacado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="md:col-span-2 p-6 rounded-2xl bg-[#0490C8] relative overflow-hidden cursor-pointer h-full flex flex-col"
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-black text-white">
                    Notificaciones por WhatsApp
                  </h3>
                  <Smartphone className="w-5 h-5 text-white opacity-60" />
                </div>
                
                <p className="text-white/90 text-xs mb-4">
                  Reduce inasistencias hasta un 60% con recordatorios automáticos personalizados
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-white/95">
                    <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Recordatorios automáticos</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/95">
                    <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Mensajes personalizados</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/95">
                    <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Horarios configurables</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/95">
                    <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Confirmación de citas</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section id="modules" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden scroll-mt-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0490C8]/20 mb-5"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-xs font-medium text-[#0490C8]">Sistema de Agendamiento Completo</span>
            </motion.div>
            
            <h2 className="text-4xl font-black mb-5 text-gray-900">
              Más módulos para gestionar
              <br />
              <span className="text-[#0490C8]">tu agenda de citas</span>
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas en un solo agendador profesional
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Sistema de Agendamiento de Citas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0490C8]/30 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#023664]">
                  Sistema de Agendamiento de Citas
                </h3>
                <Calendar className="w-5 h-5 text-[#023664] opacity-40" />
              </div>
              
              <p className="text-xs text-gray-600 leading-relaxed">
                5 estados de cita (pendiente, confirmada, completada, cancelada, no-asistió), validación automática de horarios y canal de origen
              </p>
            </motion.div>

            {/* Gestión de Servicios */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0490C8]/30 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#023664]">
                  Gestión de Servicios
                </h3>
                <Settings className="w-5 h-5 text-[#0490C8] opacity-40" />
              </div>
              
              <p className="text-xs text-gray-600 leading-relaxed">
                Catálogo completo con fotos, precios configurables, duración estimada y extras opcionales por sucursal
              </p>
            </motion.div>

            {/* Horarios y Disponibilidad */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0490C8]/30 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#023664]">
                  Horarios Inteligentes
                </h3>
                <Clock className="w-5 h-5 text-[#59C7F3] opacity-40" />
              </div>
              
              <p className="text-xs text-gray-600 leading-relaxed">
                Horarios por día, bloques de descanso, vacaciones y días libres configurables
              </p>
            </motion.div>

            {/* Autenticación y Seguridad */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0490C8]/30 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#023664]">
                  Seguridad Total
                </h3>
                <Shield className="w-5 h-5 text-[#023664] opacity-40" />
              </div>
              
              <p className="text-xs text-gray-600 leading-relaxed">
                Verificación de email, contraseñas seguras, recuperación de cuenta y sesión persistente
              </p>
            </motion.div>

            {/* Notificaciones WhatsApp */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0490C8]/30 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#023664]">
                  Notificaciones WhatsApp
                </h3>
                <Smartphone className="w-5 h-5 text-[#0490C8] opacity-40" />
              </div>
              
              <p className="text-xs text-gray-600 leading-relaxed">
                Recordatorios automáticos, mensajes personalizados, horarios configurables y confirmación de citas
              </p>
            </motion.div>

            {/* Análisis Financiero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0490C8]/30 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#023664]">
                  Análisis Financiero
                </h3>
                <DollarSign className="w-5 h-5 text-[#59C7F3] opacity-40" />
              </div>
              
              <p className="text-xs text-gray-600 leading-relaxed">
                Ingresos totales, ticket promedio, comparativas con período anterior e ingresos por empleado y servicio
              </p>
            </motion.div>

            {/* Métricas de Clientes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0490C8]/30 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#023664]">
                  Métricas de Clientes
                </h3>
                <Users className="w-5 h-5 text-[#023664] opacity-40" />
              </div>
              
              <p className="text-xs text-gray-600 leading-relaxed">
                Ranking de mejores clientes, historial completo de citas, servicio favorito e ingresos generados por cliente
              </p>
            </motion.div>

            {/* Desempeño de Empleados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0490C8]/30 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#023664]">
                  Desempeño de Empleados
                </h3>
                <TrendingUp className="w-5 h-5 text-[#0490C8] opacity-40" />
              </div>
              
              <p className="text-xs text-gray-600 leading-relaxed">
                Total de citas atendidas, horas trabajadas, ingresos generados, citas por día y servicio más realizado
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sección Testimonios */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Historias de éxito
            </h2>
            <p className="text-base text-gray-600">
              Negocios que han transformado su gestión con CitaYA
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonio 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-white border border-gray-200"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                "Desde que usamos CitaYA, las inasistencias bajaron un 70%. Los recordatorios por WhatsApp son increíbles, los clientes ya no olvidan sus citas."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0490C8] to-[#023664] flex items-center justify-center text-white font-bold">
                  MC
                </div>
                <div>
                  <p className="font-bold text-gray-900">María Castro</p>
                  <p className="text-xs text-gray-600">Dueña, Salón Elegancia</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonio 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl bg-white border border-gray-200"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                "Los reportes me permiten ver exactamente qué servicios generan más ingresos y qué empleados son más productivos. Ahora tomo decisiones basadas en datos."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0490C8] to-[#023664] flex items-center justify-center text-white font-bold">
                  JR
                </div>
                <div>
                  <p className="font-bold text-gray-900">Jorge Ramírez</p>
                  <p className="text-xs text-gray-600">Director, Clínica Dental Sonrisa</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonio 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl bg-white border border-gray-200"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                "Manejo 3 sucursales y antes era un caos. Ahora con CitaYA veo todo desde un solo lugar. La agenda pública es genial, los clientes agendan solos."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0490C8] to-[#023664] flex items-center justify-center text-white font-bold">
                  AL
                </div>
                <div>
                  <p className="font-bold text-gray-900">Ana López</p>
                  <p className="text-xs text-gray-600">Propietaria, Spa & Wellness</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sección FAQ - Preguntas Frecuentes */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Preguntas frecuentes
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FAQ 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-gray-50 border border-gray-200"
            >
              <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#0490C8] mt-0.5 flex-shrink-0" />
                ¿Cómo funcionan los recordatorios?
              </h3>
              <p className="text-sm text-gray-600">
                CitaYA envía automáticamente mensajes por WhatsApp antes de cada cita. Tú configuras cuándo y cómo.
              </p>
            </motion.div>

            {/* FAQ 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl bg-gray-50 border border-gray-200"
            >
              <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#0490C8] mt-0.5 flex-shrink-0" />
                ¿Puedo cancelar cuando quiera?
              </h3>
              <p className="text-sm text-gray-600">
                Sí, sin compromiso. Cancelas desde tu panel cuando lo desees. Sin contratos ni penalizaciones.
              </p>
            </motion.div>

            {/* FAQ 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl bg-gray-50 border border-gray-200"
            >
              <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#0490C8] mt-0.5 flex-shrink-0" />
                ¿Qué incluye la prueba gratis?
              </h3>
              <p className="text-sm text-gray-600">
                14 días con acceso completo a todas las funcionalidades. Sin tarjeta de crédito, sin limitaciones.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sección de Precios y CTA - DISEÑO SOBRIO Y PROFESIONAL */}
      <section id="pricing" className="relative py-20 px-4 sm:px-6 lg:px-8 scroll-mt-16 bg-gradient-to-br from-[#023664] to-[#0490C8]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge destacado - SOBRIO */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <Zap className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">
                Oferta especial: 14 días gratis
              </span>
            </motion.div>

            {/* Título potente */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight"
            >
              Comienza a reducir
              <br />
              inasistencias <span className="text-white/90">hoy mismo</span>
            </motion.h2>

            {/* Descripción convincente */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-lg text-white/90 mb-8 max-w-2xl mx-auto"
            >
              Únete a cientos de negocios que ya optimizaron su sistema de agendamiento de citas y aumentaron sus ingresos con nuestro agendador profesional
            </motion.p>

            {/* Beneficios rápidos - SOBRIO */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="grid sm:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto"
            >
              <div className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-sm font-medium">Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-sm font-medium">Configuración en 5 minutos</span>
              </div>
              <div className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-sm font-medium">Cancela cuando quieras</span>
              </div>
            </motion.div>

            {/* CTA Buttons principales */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            >
              <motion.button
                onClick={handleGetStarted}
                className="group relative px-8 py-4 rounded-xl overflow-hidden inline-flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative text-[#0490C8] font-black text-lg">
                  Comenzar Gratis - 14 Días
                </div>
                <ArrowRight className="relative w-5 h-5 text-[#0490C8] group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                onClick={() => router.push('/planes')}
                className="px-8 py-4 rounded-xl border-2 border-white text-white font-bold hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ver Planes y Precios
              </motion.button>
            </motion.div>

            {/* Garantía y seguridad */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Shield className="w-4 h-4" />
                <span>Garantía de satisfacción - Cancela cuando quieras</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-xs">
                <Lock className="w-3.5 h-3.5" />
                <span>Tus datos están 100% seguros y encriptados</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer minimalista y real */}
      <footer className="relative bg-gray-50 pt-12 sm:pt-16 pb-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          {/* Sección principal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-12">
            {/* Columna de marca */}
            <div className="sm:col-span-2 md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 sm:mb-5">
                  <Image 
                    src="/Assets/logo_citaYA.png" 
                    alt="CitaYA Logo" 
                    width={140} 
                    height={50}
                    className="h-8 sm:h-10 w-auto"
                  />
                </div>
                <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-sm max-w-md">
                  Sistema completo de agendamiento de citas con recordatorios automáticos por WhatsApp. 
                  Reduce inasistencias y optimiza tu agenda.
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0490C8]" />
                  <span>Tus datos están seguros</span>
                </div>
              </motion.div>
            </div>

            {/* Columna de Navegación */}
            <div>
              <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm">
                Navegación
              </h4>
              <ul className="space-y-2 sm:space-y-2.5">
                <li>
                  <motion.button
                    onClick={() => {
                      const element = document.getElementById('features');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-gray-600 hover:text-[#0490C8] text-[10px] sm:text-xs transition-colors text-left"
                    whileHover={{ x: 5 }}
                  >
                    Características
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    onClick={() => {
                      const element = document.getElementById('modules');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-gray-600 hover:text-[#0490C8] text-[10px] sm:text-xs transition-colors text-left"
                    whileHover={{ x: 5 }}
                  >
                    Módulos
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    onClick={() => router.push('/planes')}
                    className="text-gray-600 hover:text-[#0490C8] text-[10px] sm:text-xs transition-colors text-left"
                    whileHover={{ x: 5 }}
                  >
                    Planes y Precios
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    onClick={() => router.push('/auth')}
                    className="text-gray-600 hover:text-[#0490C8] text-[10px] sm:text-xs transition-colors text-left"
                    whileHover={{ x: 5 }}
                  >
                    Iniciar Sesión
                  </motion.button>
                </li>
              </ul>
            </div>

            {/* Columna de Soporte */}
            <div>
              <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm">
                Soporte
              </h4>
              <ul className="space-y-2 sm:space-y-2.5">
                <li>
                  <motion.button
                    onClick={() => {
                      const element = document.getElementById('pricing');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-gray-600 hover:text-[#0490C8] text-[10px] sm:text-xs transition-colors text-left"
                    whileHover={{ x: 5 }}
                  >
                    Preguntas Frecuentes
                  </motion.button>
                </li>
                <li>
                  <a
                    href="mailto:citayaapp@gmail.com"
                    className="text-gray-600 hover:text-[#0490C8] text-[10px] sm:text-xs transition-colors block"
                  >
                    Contacto
                  </a>
                </li>
                <li>
                  <motion.button
                    onClick={handleGetStarted}
                    className="text-gray-600 hover:text-[#0490C8] text-[10px] sm:text-xs transition-colors text-left"
                    whileHover={{ x: 5 }}
                  >
                    Comenzar Gratis
                  </motion.button>
                </li>
              </ul>
            </div>
          </div>

          {/* Redes Sociales - Diseño minimalista */}
          <div className="mb-8 sm:mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h4 className="font-bold text-gray-900 mb-5 text-sm">
                Conéctate con nosotros
              </h4>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* WhatsApp */}
                <motion.a
                  href="https://wa.me/593993527322"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 px-5 py-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#25D366] rounded-xl transition-all"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366] transition-colors">
                    <svg className="w-4 h-4 text-[#25D366] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-semibold text-gray-900">WhatsApp</span>
                    <span className="text-[10px] text-gray-500">+593 99 352 7322</span>
                  </div>
                </motion.a>

                {/* Email */}
                <motion.a
                  href="mailto:citayaapp@gmail.com"
                  className="group flex items-center gap-2.5 px-5 py-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#0490C8] rounded-xl transition-all"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0490C8]/10 flex items-center justify-center group-hover:bg-[#0490C8] transition-colors">
                    <svg className="w-4 h-4 text-[#0490C8] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-semibold text-gray-900">Email</span>
                    <span className="text-[10px] text-gray-500">citayaapp@gmail.com</span>
                  </div>
                </motion.a>

                {/* Instagram */}
                <motion.a
                  href="https://www.instagram.com/citaya.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 px-5 py-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-pink-500 rounded-xl transition-all"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 flex items-center justify-center group-hover:from-purple-500 group-hover:via-pink-500 group-hover:to-orange-500 transition-all">
                    <svg className="w-4 h-4 text-pink-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-semibold text-gray-900">Instagram</span>
                    <span className="text-[10px] text-gray-500">@citaya.app</span>
                  </div>
                </motion.a>

                {/* Facebook */}
                <motion.a
                  href="https://www.facebook.com/share/1FkrNyVV3e/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 px-5 py-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#1877F2] rounded-xl transition-all"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1877F2]/10 flex items-center justify-center group-hover:bg-[#1877F2] transition-colors">
                    <svg className="w-4 h-4 text-[#1877F2] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-semibold text-gray-900">Facebook</span>
                    <span className="text-[10px] text-gray-500">CitaYA</span>
                  </div>
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Línea divisoria */}
          <div className="mb-4 sm:mb-6 border-t border-gray-200"></div>

          {/* Sección inferior */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-[10px] sm:text-xs text-gray-600">
                © 2025 <span className="font-semibold text-gray-900">CitaYA</span>. Todos los derechos reservados.
              </p>
            </div>

            {/* Links legales */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-600">
              <Link href="/terminos" className="hover:text-[#0490C8] transition-colors">
                Términos y Condiciones
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/privacidad" className="hover:text-[#0490C8] transition-colors">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

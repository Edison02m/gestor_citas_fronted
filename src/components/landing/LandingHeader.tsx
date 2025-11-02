'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Sparkles, Grid3x3, DollarSign, 
  ArrowRight, Menu, X 
} from 'lucide-react';

export default function LandingHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detectar scroll para cambiar estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (href: string, scroll?: boolean) => {
    if (scroll && pathname === '/') {
      // Si estamos en home y es scroll, hacer scroll suave
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (scroll && pathname !== '/') {
      // Si no estamos en home pero quieren hacer scroll, ir a home primero
      router.push(`/${href}`);
    } else {
      // Navegación normal
      router.push(href);
    }
    setIsMenuOpen(false);
  };

  const handleGetStarted = () => {
    document.body.style.transition = 'opacity 0.3s ease-out';
    document.body.style.opacity = '0.95';
    setTimeout(() => {
      router.push('/auth?mode=register');
    }, 200);
  };

  const handleLogin = () => {
    document.body.style.transition = 'opacity 0.3s ease-out';
    document.body.style.opacity = '0.95';
    setTimeout(() => {
      router.push('/auth');
    }, 200);
  };

  const menuItems = [
    { name: 'Características', href: '#features', icon: Sparkles, scroll: true },
    { name: 'Módulos', href: '#modules', icon: Grid3x3, scroll: true },
    { name: 'Precios', href: '/planes', icon: DollarSign, scroll: false },
  ];

  return (
    <>
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
              onClick={() => router.push('/')}
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
              {/* Opción Inicio - Solo visible cuando NO estamos en home O cuando se hace scroll */}
              {(pathname !== '/' || isScrolled) && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => router.push('/')}
                  className="group flex items-center gap-2 text-sm font-medium transition-colors relative text-gray-700 hover:text-[#0490C8]"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Layers className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span>Inicio</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0490C8] group-hover:w-full transition-all duration-300" />
                </motion.button>
              )}
              
              {/* Opciones principales */}
              {menuItems.map((item, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleNavigation(item.href, item.scroll)}
                  className={`group flex items-center gap-2 text-sm font-medium transition-colors relative ${
                    pathname === item.href
                      ? 'text-[#0490C8] font-semibold'
                      : 'text-gray-700 hover:text-[#0490C8]'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span>{item.name}</span>
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#0490C8] transition-all duration-300 ${
                    pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </motion.button>
              ))}
            </div>

            {/* CTA Buttons Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {!isAuthenticated ? (
                <>
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
                </>
              ) : (
                <motion.button
                  onClick={() => router.push('/dashboard-usuario')}
                  className="group relative px-5 py-2 rounded-lg overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-[#0490C8]" />
                  <div className="absolute inset-0 bg-[#023664] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-2 text-white text-sm font-medium">
                    <span>Ir al Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </motion.button>
              )}
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
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-16 right-0 bottom-0 w-72 bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6 space-y-1">
                {/* Opción Inicio en móvil */}
                {pathname !== '/' && (
                  <motion.button
                    onClick={() => handleNavigation('/', false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Layers className="w-5 h-5 text-[#0490C8]" />
                    <span className="font-medium">Inicio</span>
                  </motion.button>
                )}

                {/* Opciones del menú */}
                {menuItems.map((item, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleNavigation(item.href, item.scroll)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-[#0490C8]/10 text-[#0490C8]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </motion.button>
                ))}

                {/* Separador */}
                <div className="pt-4 pb-2">
                  <div className="border-t border-gray-200" />
                </div>

                {/* CTA Buttons Mobile */}
                {!isAuthenticated ? (
                  <>
                    <motion.button
                      onClick={handleLogin}
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#0490C8] text-[#0490C8] font-medium hover:bg-[#0490C8]/5 transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      Iniciar Sesión
                    </motion.button>
                    
                    <motion.button
                      onClick={handleGetStarted}
                      className="w-full px-4 py-3 rounded-lg bg-[#0490C8] text-white font-medium hover:bg-[#023664] transition-colors flex items-center justify-center gap-2"
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Comenzar Gratis</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    onClick={() => {
                      router.push('/dashboard-usuario');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-[#0490C8] text-white font-medium hover:bg-[#023664] transition-colors flex items-center justify-center gap-2"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Ir al Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

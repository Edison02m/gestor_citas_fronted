
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}

const menuItems = [
  {
    name: 'Inicio',
    path: '/dashboard-usuario',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    name: 'Citas',
    path: '/dashboard-usuario/citas',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    name: 'Servicios',
    path: '/dashboard-usuario/servicios',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    name: 'Sucursales',
    path: '/dashboard-usuario/sucursales',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    name: 'Empleados',
    path: '/dashboard-usuario/empleados',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    name: 'Clientes',
    path: '/dashboard-usuario/clientes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  {
    name: 'Configuración',
    path: '/dashboard-usuario/configuracion',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    name: 'Perfil',
    path: '/dashboard-usuario/perfil',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    name: 'Activar Código',
    path: '/activar-codigo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    badge: '🔑'
  }
];

export default function Sidebar({ isOpen, onClose, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isUsuario = (user: any): user is any => {
    return user && 'negocio' in user;
  };

  const negocioNombre = isUsuario(user) ? (user as any).negocio?.nombre : 'Dashboard';

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose(); // Cerrar sidebar en móvil al navegar
  };

  return (
    <>
      {/* Sidebar - Desktop: siempre visible, Mobile: slide from left */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-white border-r border-gray-200
          transform transition-all duration-300 ease-in-out
          lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'w-64 lg:w-64'}
          flex flex-col
        `}
      >
        {/* Header con nombre del negocio */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          {/* Layout móvil: horizontal con botón cerrar */}
          <div className={`flex items-center justify-between lg:hidden`}>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {negocioNombre}
              </h1>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>

            {/* Botón cerrar en móvil */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Layout desktop: vertical centrado o colapsado */}
          <div className={`hidden lg:flex lg:flex-col ${isCollapsed ? 'lg:items-center' : 'lg:items-center lg:text-center lg:space-y-3'}`}>
            {/* Logo centrado arriba */}
            <div className="flex justify-center">
              <img
                src="/Assets/logo_citaYA.png"
                alt="CitaYa Logo"
                className={`w-auto transition-all duration-300 ${isCollapsed ? 'h-6' : 'h-8'}`}
              />
            </div>

            {/* Información del negocio abajo - oculta cuando está colapsado */}
            {!isCollapsed && (
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {negocioNombre}
                </h1>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Menú */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            // Para "Inicio", solo activar si la ruta es EXACTAMENTE /dashboard-usuario
            // Para los demás, activar si la ruta coincide o empieza con la ruta del item
            const isActive = item.path === '/dashboard-usuario' 
              ? pathname === item.path 
              : pathname === item.path || pathname?.startsWith(item.path + '/');
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                  isCollapsed 
                    ? 'lg:justify-center lg:px-3 lg:py-3 px-3 sm:px-4 py-2.5 sm:py-3' 
                    : 'px-3 sm:px-4 py-2.5 sm:py-3'
                } ${
                  isActive
                    ? 'bg-[#0490C8] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                {item.icon}
                <span className={`${isCollapsed ? 'lg:hidden' : ''} flex-1 text-left`}>{item.name}</span>
                {(item as any).badge && !isCollapsed && (
                  <span className="text-lg">{(item as any).badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer con botón de cerrar sesión */}
        <div className="p-3 sm:p-4 border-t border-gray-200">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all ${
              isCollapsed 
                ? 'lg:justify-center lg:px-3 lg:py-3 px-3 sm:px-4 py-2.5 sm:py-3' 
                : 'px-3 sm:px-4 py-2.5 sm:py-3'
            }`}
            title={isCollapsed ? 'Cerrar Sesión' : undefined}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}

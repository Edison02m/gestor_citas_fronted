'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  // No mostrar breadcrumbs en home
  if (pathname === '/') return null;

  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' }
  ];

  // Mapeo de rutas a nombres legibles
  const routeNames: Record<string, string> = {
    'auth': 'Autenticación',
    'login': 'Iniciar Sesión',
    'register': 'Registrarse',
    'dashboard': 'Panel de Control',
    'dashboard-usuario': 'Mi Panel',
    'citas': 'Citas',
    'clientes': 'Clientes',
    'empleados': 'Empleados',
    'sucursales': 'Sucursales',
    'servicios': 'Servicios',
    'reportes': 'Reportes',
    'configuracion': 'Configuración',
    'perfil': 'Mi Perfil',
    'planes': 'Planes y Precios',
    'agenda': 'Agenda Pública',
    'recuperar-contrasena': 'Recuperar Contraseña',
    'restablecer-contrasena': 'Restablecer Contraseña',
    'onboarding': 'Configuración Inicial',
    'activar-codigo': 'Activar Código'
  };

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({
      label,
      href: currentPath
    });
  });

  // Structured Data para breadcrumbs
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@id': `https://citaya.site${crumb.href}`,
        name: crumb.label
      }
    }))
  };

  return (
    <>
      {/* Schema markup para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* UI visible */}
      <nav 
        aria-label="breadcrumb" 
        className="mb-4 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg"
      >
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return (
              <li key={crumb.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                )}
                
                {isLast ? (
                  <span className="text-gray-900 dark:text-white font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    {index === 0 && <Home className="w-4 h-4" />}
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

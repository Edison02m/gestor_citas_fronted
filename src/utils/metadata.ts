import { Metadata } from 'next';

interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  canonicalUrl?: string;
}

export function generatePageMetadata({
  title,
  description,
  keywords = [],
  image = '/Assets/logo_citaYA.png',
  canonicalUrl
}: PageMetadata): Metadata {
  const fullTitle = `${title} | CitaYA`;
  const baseUrl = 'https://citaya.site';
  const imageUrl = `${baseUrl}${image}`;
  const url = canonicalUrl ? `${baseUrl}${canonicalUrl}` : baseUrl;

  return {
    title: fullTitle,
    description,
    keywords: [...keywords, 'CitaYA', 'sistema de agendamiento de citas', 'agenda online'],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'CitaYA',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: '@CitaYA',
    },
  };
}

// Metadata predefinida para páginas comunes
export const pageMetadata = {
  login: {
    title: 'Iniciar Sesión - Accede a tu cuenta',
    description: 'Accede a tu cuenta de CitaYA para gestionar las citas de tu negocio. Sistema seguro y fácil de usar.',
    keywords: ['login', 'iniciar sesión', 'acceder', 'cuenta CitaYA'],
    canonicalUrl: '/auth/login'
  },
  register: {
    title: 'Registrarse Gratis - Prueba CitaYA',
    description: 'Crea tu cuenta gratis en CitaYA y comienza a gestionar las citas de tu negocio hoy mismo. Sin tarjeta de crédito.',
    keywords: ['registro', 'crear cuenta', 'gratis', 'prueba gratis', 'sign up'],
    canonicalUrl: '/auth/register'
  },
  planes: {
    title: 'Planes y Precios - Elige el mejor para ti',
    description: 'Descubre nuestros planes de CitaYA. Desde plan gratuito hasta empresarial. Funcionalidades premium para tu negocio.',
    keywords: ['planes', 'precios', 'pricing', 'tarifas', 'suscripción', 'pago'],
    canonicalUrl: '/planes'
  },
  dashboard: {
    title: 'Panel de Control - Gestiona tu negocio',
    description: 'Panel de control de CitaYA. Visualiza estadísticas, próximas citas y gestiona tu negocio desde un solo lugar.',
    keywords: ['dashboard', 'panel', 'control', 'estadísticas', 'resumen'],
    canonicalUrl: '/dashboard'
  },
  citas: {
    title: 'Sistema de Agendamiento de Citas - Calendario inteligente',
    description: 'Gestiona todas las citas de tu negocio con nuestro calendario inteligente. Drag & drop, recordatorios automáticos y más.',
    keywords: ['citas', 'calendario', 'agenda', 'appointments', 'bookings'],
    canonicalUrl: '/dashboard-usuario/citas'
  },
  clientes: {
    title: 'Gestión de Clientes - Base de datos completa',
    description: 'Administra la información de tus clientes. Historial de citas, contacto, notas personalizadas y más.',
    keywords: ['clientes', 'customers', 'contactos', 'base de datos'],
    canonicalUrl: '/dashboard-usuario/clientes'
  },
  empleados: {
    title: 'Gestión de Empleados - Organiza tu equipo',
    description: 'Gestiona los horarios, servicios y disponibilidad de tus empleados. Control de vacaciones y asignaciones.',
    keywords: ['empleados', 'staff', 'equipo', 'trabajadores', 'horarios'],
    canonicalUrl: '/dashboard-usuario/empleados'
  },
  servicios: {
    title: 'Catálogo de Servicios - Configura tus ofertas',
    description: 'Administra el catálogo de servicios de tu negocio. Precios, duración, categorías y descripciones.',
    keywords: ['servicios', 'catálogo', 'precios', 'ofertas', 'productos'],
    canonicalUrl: '/dashboard-usuario/servicios'
  },
  sucursales: {
    title: 'Múltiples Sucursales - Gestión centralizada',
    description: 'Administra múltiples ubicaciones de tu negocio desde una sola cuenta. Horarios personalizados por sucursal.',
    keywords: ['sucursales', 'ubicaciones', 'branches', 'locales', 'tiendas'],
    canonicalUrl: '/dashboard-usuario/sucursales'
  },
  reportes: {
    title: 'Reportes y Estadísticas - Análisis de negocio',
    description: 'Visualiza reportes detallados de tu negocio. Ingresos, citas, clientes frecuentes y más métricas importantes.',
    keywords: ['reportes', 'estadísticas', 'analytics', 'métricas', 'análisis'],
    canonicalUrl: '/dashboard-usuario/reportes'
  },
  configuracion: {
    title: 'Configuración - Personaliza tu negocio',
    description: 'Configura los detalles de tu negocio. Logo, información de contacto, redes sociales y preferencias.',
    keywords: ['configuración', 'settings', 'ajustes', 'personalización'],
    canonicalUrl: '/dashboard-usuario/configuracion'
  },
  perfil: {
    title: 'Mi Perfil - Datos personales',
    description: 'Gestiona tu información personal y preferencias de cuenta en CitaYA.',
    keywords: ['perfil', 'profile', 'cuenta', 'usuario', 'datos personales'],
    canonicalUrl: '/dashboard-usuario/perfil'
  },
  agendaPublica: {
    title: 'Agenda tu Cita - Reserva online',
    description: 'Agenda tu cita de forma rápida y sencilla. Selecciona servicio, empleado, fecha y hora disponible.',
    keywords: ['agendar', 'reservar', 'booking', 'cita online', 'agenda pública'],
    canonicalUrl: '/agenda'
  }
};

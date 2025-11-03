'use client';

interface UsageCardProps {
  nombre: string;
  tipo: string;
  usado: number;
  limite: number | 'ilimitado';
  porcentaje: number;
}

/**
 * Componente para mostrar el uso de un recurso individual
 */
export default function UsageCard({ nombre, tipo, usado, limite, porcentaje }: UsageCardProps) {
  
  // Determinar el color basado en el porcentaje
  const getColorClasses = () => {
    if (limite === 'ilimitado') {
      return {
        bg: 'bg-gray-50',
        iconBg: 'bg-gray-100',
        text: 'text-gray-900',
        icon: 'text-gray-600',
        progress: 'bg-[#0490C8]',
        progressBg: 'bg-gray-100',
      };
    }

    if (porcentaje >= 90) {
      return {
        bg: 'bg-white',
        iconBg: 'bg-red-50',
        text: 'text-gray-900',
        icon: 'text-red-600',
        progress: 'bg-red-500',
        progressBg: 'bg-gray-100',
      };
    }

    if (porcentaje >= 70) {
      return {
        bg: 'bg-white',
        iconBg: 'bg-yellow-50',
        text: 'text-gray-900',
        icon: 'text-yellow-600',
        progress: 'bg-yellow-500',
        progressBg: 'bg-gray-100',
      };
    }

    return {
      bg: 'bg-white',
      iconBg: 'bg-gray-50',
      text: 'text-gray-900',
      icon: 'text-gray-600',
      progress: 'bg-[#0490C8]',
      progressBg: 'bg-gray-100',
    };
  };

  const colors = getColorClasses();

  // Iconos SVG según el tipo
  const getIcon = () => {
    switch (tipo) {
      case 'sucursales':
        return (
          <svg className={`w-5 h-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'empleados':
        return (
          <svg className={`w-5 h-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'servicios':
        return (
          <svg className={`w-5 h-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
          </svg>
        );
      case 'clientes':
        return (
          <svg className={`w-5 h-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'citas':
        return (
          <svg className={`w-5 h-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'whatsapp':
        return (
          <svg className={`w-5 h-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'emails':
        return (
          <svg className={`w-5 h-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${colors.bg} rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Icono */}
          <div className={`${colors.iconBg} rounded-xl p-2.5 flex-shrink-0`}>
            {getIcon()}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {nombre}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {usado} {limite === 'ilimitado' ? 'usados' : `de ${limite}`}
            </p>
          </div>
        </div>

        {/* Badge de porcentaje o ilimitado */}
        {limite === 'ilimitado' ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
            ∞
          </span>
        ) : (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
            porcentaje >= 90 ? 'bg-red-50 text-red-700' :
            porcentaje >= 70 ? 'bg-yellow-50 text-yellow-700' :
            'bg-gray-50 text-gray-700'
          }`}>
            {porcentaje}%
          </span>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="space-y-2">
        <div className={`w-full ${colors.progressBg} rounded-full h-2 overflow-hidden`}>
          <div
            className={`${colors.progress} h-full rounded-full transition-all duration-500 ease-out`}
            style={{ width: limite === 'ilimitado' ? '100%' : `${Math.min(porcentaje, 100)}%` }}
          />
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs">
          {limite === 'ilimitado' ? (
            <span className="text-gray-500">Uso ilimitado</span>
          ) : porcentaje >= 90 ? (
            <span className="text-red-600 font-medium">Cerca del límite</span>
          ) : (
            <span className="text-gray-500">Disponible</span>
          )}
          
          <span className="font-medium text-gray-900">
            {limite === 'ilimitado' ? '∞' : limite - usado}
          </span>
        </div>
      </div>
    </div>
  );
}

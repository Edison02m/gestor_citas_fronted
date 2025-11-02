'use client';

interface UsageCardProps {
  nombre: string;
  icon: string;
  usado: number;
  limite: number | 'ilimitado';
  porcentaje: number;
}

/**
 * Componente para mostrar el uso de un recurso individual
 */
export default function UsageCard({ nombre, icon, usado, limite, porcentaje }: UsageCardProps) {
  // Determinar el color basado en el porcentaje
  const getColorClasses = () => {
    if (limite === 'ilimitado') {
      return {
        bg: 'bg-[#59C7F3]/10',
        text: 'text-[#0490C8]',
        progress: 'bg-[#0490C8]',
        border: 'border-[#59C7F3]/30',
      };
    }

    if (porcentaje >= 90) {
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        progress: 'bg-red-500',
        border: 'border-red-200',
      };
    }

    if (porcentaje >= 70) {
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        progress: 'bg-yellow-500',
        border: 'border-yellow-200',
      };
    }

    return {
      bg: 'bg-green-50',
      text: 'text-green-700',
      progress: 'bg-green-500',
      border: 'border-green-200',
    };
  };

  const colors = getColorClasses();

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 ${colors.border} p-6 hover:shadow-md transition-all duration-200`}>
      {/* Header con icono y nombre */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${colors.bg} rounded-lg p-3`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm capitalize">
              {nombre}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {usado} de {limite === 'ilimitado' ? '∞' : limite}
            </p>
          </div>
        </div>

        {/* Badge de porcentaje */}
        {limite !== 'ilimitado' && (
          <div className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-sm font-bold`}>
            {porcentaje}%
          </div>
        )}

        {limite === 'ilimitado' && (
          <div className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-xs font-bold`}>
            ∞
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      {limite !== 'ilimitado' ? (
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`${colors.progress} h-full rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(porcentaje, 100)}%` }}
            />
          </div>

          {/* Advertencia si está cerca del límite */}
          {porcentaje >= 90 && (
            <p className="text-xs text-red-600 font-medium mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Cerca del límite
            </p>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="w-full bg-[#59C7F3]/20 rounded-full h-3 overflow-hidden">
            <div className="bg-[#0490C8] h-full rounded-full w-full animate-pulse" />
          </div>
          <p className="text-xs text-[#0490C8] font-medium mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Uso ilimitado
          </p>
        </div>
      )}

      {/* Información adicional de uso */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Disponible</span>
          <span className="font-semibold">
            {limite === 'ilimitado' ? '∞' : limite - usado}
          </span>
        </div>
      </div>
    </div>
  );
}

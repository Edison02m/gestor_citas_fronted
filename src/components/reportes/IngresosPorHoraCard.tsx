// frontend/src/components/reportes/IngresosPorHoraCard.tsx

import { IngresosPorHora } from '@/services/reportes.service';

interface IngresosPorHoraCardProps {
  data: IngresosPorHora[];
  loading?: boolean;
}

export default function IngresosPorHoraCard({ data, loading = false }: IngresosPorHoraCardProps) {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-2xl border border-gray-200 animate-pulse">
        <div className="h-5 bg-gray-100 rounded w-40 mb-4"></div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-xl">
              <div className="h-3 bg-gray-100 rounded w-16 mb-2"></div>
              <div className="h-6 bg-gray-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-base font-bold text-gray-900 mb-1">Sin datos de ingresos</p>
        <p className="text-xs text-gray-600">No hay datos suficientes para mostrar</p>
      </div>
    );
  }

  const ingreso = data[0]; // Tomamos el primer elemento del array

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'creciente': return 'text-green-600 bg-green-100';
      case 'decreciente': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'creciente': return '↗';
      case 'decreciente': return '↘';
      default: return '→';
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-0.5">Ingresos por Hora</h3>
          <p className="text-xs text-gray-600">Análisis de rentabilidad horaria</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getTendenciaColor(ingreso.tendencia)}`}>
          {getTendenciaIcon(ingreso.tendencia)} {ingreso.tendencia}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Ingreso por Hora */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full">
              $/Hora
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-0.5">${Math.round(ingreso.ingresoPorHora)}</p>
          <p className="text-xs text-gray-600">{ingreso.horasTrabajadas}h trabajadas</p>
        </div>

        {/* Ingreso Total */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full">
              Total
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-0.5">${Math.round(ingreso.ingresoTotal)}</p>
          <p className="text-xs text-gray-600">Período actual</p>
        </div>

        {/* Mejor Día */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full">
              Mejor
            </span>
          </div>
          <p className="text-base font-bold text-gray-900 mb-0.5">{ingreso.mejorDia.dia}</p>
          <p className="text-xs text-gray-600">${Math.round(ingreso.mejorDia.ingreso)}/h</p>
        </div>

        {/* Mejor Horario */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full">
              Pico
            </span>
          </div>
          <p className="text-base font-bold text-gray-900 mb-0.5">{ingreso.mejorHorario.hora}</p>
          <p className="text-xs text-gray-600">${Math.round(ingreso.mejorHorario.ingreso)}/h</p>
        </div>
      </div>
    </div>
  );
}

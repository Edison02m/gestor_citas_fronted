// frontend/src/components/reportes/RankingEmpleadosTable.tsx

import { RankingEmpleado } from '@/services/reportes.service';
import Image from 'next/image';

interface RankingEmpleadosTableProps {
  data: RankingEmpleado[];
  loading?: boolean;
}

export default function RankingEmpleadosTable({ data, loading = false }: RankingEmpleadosTableProps) {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-2xl border border-gray-200 animate-pulse">
        <div className="h-5 bg-gray-100 rounded w-40 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-24 mb-1.5"></div>
                <div className="h-2.5 bg-gray-200 rounded w-36"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-base font-bold text-gray-900 mb-1">Sin datos de empleados</p>
        <p className="text-xs text-gray-600">No hay datos suficientes para mostrar</p>
      </div>
    );
  }

  const getPosicionBadge = (posicion: number) => {
    switch (posicion) {
      case 1:
        return <span className="text-xl">🥇</span>;
      case 2:
        return <span className="text-xl">🥈</span>;
      case 3:
        return <span className="text-xl">🥉</span>;
      default:
        return <span className="text-xs font-bold text-gray-500">#{posicion}</span>;
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-0.5">Ranking de Empleados</h3>
          <p className="text-xs text-gray-600">Por completación e ingresos</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-600">Total</p>
          <p className="text-lg font-bold text-gray-900">{data.length}</p>
        </div>
      </div>

      <div className="space-y-2">
        {data.slice(0, 5).map((empleado) => (
          <div
            key={empleado.empleadoId}
            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
              empleado.posicion <= 3 
                ? 'bg-gray-50 border-gray-300' 
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Posición */}
            <div className="flex-shrink-0 w-10 text-center">
              {getPosicionBadge(empleado.posicion)}
            </div>

            {/* Foto y Datos */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {empleado.foto ? (
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image
                    src={empleado.foto}
                    alt={empleado.nombre}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {empleado.nombre.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{empleado.nombre}</p>
                <p className="text-[10px] text-gray-600">{empleado.cargo}</p>
              </div>
            </div>

            {/* Métricas */}
            <div className="hidden sm:flex gap-3 text-right">
              <div>
                <p className="text-[10px] text-gray-600">Complet.</p>
                <p className="text-xs font-bold text-gray-900">{Math.round(empleado.tasaCompletacion)}%</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600">$/Hora</p>
                <p className="text-xs font-bold text-gray-900">${Math.round(empleado.ingresoPorHora)}</p>
              </div>
            </div>

            {/* Score Total */}
            <div className="flex-shrink-0 px-2.5 py-1 bg-white rounded-lg border border-gray-300">
              <p className="text-[10px] text-gray-600">Score</p>
              <p className="text-base font-bold text-gray-900">{Math.round(empleado.puntuacionTotal)}</p>
            </div>
          </div>
        ))}
      </div>

      {data.length > 5 && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-center">
          <p className="text-[10px] text-gray-600">Mostrando top 5 de {data.length} empleados</p>
        </div>
      )}

      {/* Leyenda */}
      <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <span className="font-semibold text-gray-700">Score:</span>
          <span className="text-gray-600 ml-1">70% complet. + 30% ingresos</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Citas:</span>
          <span className="text-gray-600 ml-1">{data.reduce((sum, e) => sum + e.totalCitas, 0)} total</span>
        </div>
      </div>
    </div>
  );
}

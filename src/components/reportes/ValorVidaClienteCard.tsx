// frontend/src/components/reportes/ValorVidaClienteCard.tsx

import { ValorVidaCliente } from '@/services/reportes.service';

interface ValorVidaClienteCardProps {
  data: ValorVidaCliente;
  loading?: boolean;
}

export default function ValorVidaClienteCard({ data, loading = false }: ValorVidaClienteCardProps) {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-2xl border border-gray-200 animate-pulse">
        <div className="h-5 bg-gray-100 rounded w-40 mb-4"></div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-xl">
              <div className="h-3 bg-gray-100 rounded w-16 mb-2"></div>
              <div className="h-6 bg-gray-100 rounded w-full"></div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.clientesTotales === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p className="text-base font-bold text-gray-900 mb-1">Sin datos de clientes</p>
        <p className="text-xs text-gray-600">No hay datos suficientes para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-0.5">Valor de Vida del Cliente</h3>
          <p className="text-xs text-gray-600">CLV y análisis de clientes</p>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full">
              CLV
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-0.5">${Math.round(data.clv)}</p>
          <p className="text-xs text-gray-600">Por cliente</p>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full">
              Retención
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-0.5">{Math.round(data.tasaRetencion)}%</p>
          <p className="text-xs text-gray-600">{data.clientesRecurrentes} recurrentes</p>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full">
              Ticket
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-0.5">${Math.round(data.ticketPromedio)}</p>
          <p className="text-xs text-gray-600">Por cita</p>
        </div>
      </div>

      {/* Distribución de Clientes */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-gray-700">Clientes Nuevos</span>
            <span className="text-sm font-bold text-gray-900">{data.clientesNuevos}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gray-900 h-1.5 rounded-full transition-all"
              style={{ width: `${(data.clientesNuevos / data.clientesTotales) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-gray-700">Frecuencia Promedio</span>
            <span className="text-sm font-bold text-gray-900">{data.frecuenciaPromedio.toFixed(1)}</span>
          </div>
          <p className="text-xs text-gray-600">Citas por cliente</p>
        </div>
      </div>

      {/* Top Clientes */}
      {data.topClientes && data.topClientes.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-900 mb-2">Top Clientes</h4>
          <div className="space-y-1.5">
            {data.topClientes.slice(0, 5).map((cliente, index) => (
              <div
                key={cliente.clienteId}
                className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{cliente.nombre}</p>
                    <p className="text-[10px] text-gray-600">{cliente.totalCitas} citas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">${Math.round(cliente.totalGastado)}</p>
                  <p className="text-[10px] text-gray-600">${Math.round(cliente.totalGastado / cliente.totalCitas)}/cita</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight */}
      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="flex items-start gap-2">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
            <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 mb-1">Insight</p>
            <p className="text-xs text-gray-700">
              {data.tasaRetencion >= 60
                ? `Excelente retención! ${data.clientesRecurrentes} clientes han regresado.`
                : data.tasaRetencion >= 40
                ? `Retención moderada. Considera programas de fidelización para aumentar visitas recurrentes.`
                : `Oportunidad de mejora. Solo ${Math.round(data.tasaRetencion)}% de clientes regresaron. Implementa estrategias de retención.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

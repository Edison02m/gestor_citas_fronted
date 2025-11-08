// frontend/src/components/reportes/ClientesFrecuentes.tsx

import { ClienteFrecuente } from '@/services/reportes.service';
import { formatDate } from '@/utils/format';

interface ClientesFrecuentesProps {
  clientes: ClienteFrecuente[];
  loading?: boolean;
}

export default function ClientesFrecuentes({ clientes, loading = false }: ClientesFrecuentesProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="h-6 w-48 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 animate-pulse">
              <div className="h-12 w-12 bg-gray-100 rounded-xl flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-32"></div>
                <div className="h-3 bg-gray-100 rounded w-24"></div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-5 bg-gray-100 rounded w-16"></div>
                <div className="h-3 bg-gray-100 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No hay datos de clientes</h3>
        <p className="text-sm text-gray-600">Aún no hay suficiente información para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Clientes Frecuentes</h3>
        </div>
        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
          Top {clientes.length}
        </span>
      </div>

      {/* Lista de clientes */}
      <div className="space-y-3">
        {clientes.map((cliente, index) => (
          <div
            key={cliente.clienteId}
            className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            {/* Badge de posición */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
              index === 0 
                ? 'bg-gray-100 text-gray-700'
                : index === 1
                ? 'bg-gray-100 text-gray-600'
                : index === 2
                ? 'bg-gray-100 text-gray-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {index + 1}
            </div>

            {/* Información del cliente */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 text-sm truncate mb-2">{cliente.nombre}</h4>
              
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{cliente.telefono}</span>
                </div>
                {cliente.ultimaCita && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Última: {formatDate(cliente.ultimaCita)}</span>
                  </div>
                )}
              </div>

              {cliente.servicioFavorito && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                    ⭐ {cliente.servicioFavorito}
                  </span>
                </div>
              )}
            </div>

            {/* Estadísticas */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1.5 justify-end mb-1">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-lg font-bold text-gray-900">{cliente.totalCitas}</span>
              </div>
              <p className="text-sm text-gray-600">
                ${cliente.ingresoGenerado.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer con información adicional */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ordenados por frecuencia de visitas</span>
          </div>
        </div>
      </div>
    </div>
  );
}

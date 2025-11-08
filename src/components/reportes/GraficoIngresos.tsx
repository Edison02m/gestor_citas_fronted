// frontend/src/components/reportes/GraficoIngresos.tsx

import { DatoTemporal } from '@/services/reportes.service';

interface GraficoIngresosProps {
  datos: DatoTemporal[];
  loading?: boolean;
}

export default function GraficoIngresos({ datos, loading = false }: GraficoIngresosProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse"></div>
        </div>
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">No hay datos temporales</h3>
        <p className="text-xs text-gray-600">Selecciona un rango de fechas para ver los datos</p>
      </div>
    );
  }

  // Calcular valores máximos para escala
  const maxIngresos = Math.max(...datos.map(d => d.ingresos), 1);
  const maxCitas = Math.max(...datos.map(d => d.totalCitas), 1);

  // Calcular totales
  const totalIngresos = datos.reduce((sum, d) => sum + d.ingresos, 0);
  const totalCitas = datos.reduce((sum, d) => sum + d.totalCitas, 0);
  const totalCompletadas = datos.reduce((sum, d) => sum + d.citasCompletadas, 0);
  const totalCanceladas = datos.reduce((sum, d) => sum + d.citasCanceladas, 0);
  const totalOtras = totalCitas - totalCompletadas - totalCanceladas; // Pendientes y no asistió
  
  const promedioIngresos = totalIngresos / datos.length;
  const promedioCitas = totalCitas / datos.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900">Evolución Temporal</h3>
        </div>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
          {datos.length} días
        </span>
      </div>

      {/* Resumen compacto */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold mb-0.5">Total Ingresos</p>
          <p className="text-base font-bold text-gray-900">${totalIngresos.toLocaleString('es-EC', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold mb-0.5">Promedio/día</p>
          <p className="text-base font-bold text-gray-900">${promedioIngresos.toFixed(0)}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold mb-0.5">Completadas</p>
          <p className="text-base font-bold text-[#0490C8]">{totalCompletadas}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold mb-0.5">No Completadas</p>
          <p className="text-base font-bold text-gray-600">{totalCanceladas + totalOtras}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold mb-0.5">Total Citas</p>
          <p className="text-base font-bold text-gray-900">{totalCitas}</p>
        </div>
      </div>

      {/* Gráfico de barras - Solo Ingresos */}
      <div className="relative mb-6">
        {/* Título del gráfico */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-900">Ingresos por Día</h4>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-[#0490C8] rounded"></div>
            <span className="text-xs text-gray-600 font-semibold">Ingresos</span>
          </div>
        </div>

        {/* Contenedor del gráfico */}
        <div className="flex gap-3">
          {/* Eje Y - Escala */}
          <div className="flex flex-col justify-between h-48 py-1">
            {[100, 75, 50, 25, 0].map((percent) => (
              <div key={percent} className="flex items-center">
                <span className="text-xs text-gray-400 w-10 text-right">
                  ${((maxIngresos * percent) / 100).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          {/* Área de barras */}
          <div className="flex-1 relative">
            {/* Líneas de guía horizontales */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full border-b border-gray-100"></div>
              ))}
            </div>

            {/* Barras de ingresos */}
            <div className="relative h-48 flex items-end justify-between gap-1">
              {datos.map((dato, index) => {
                const altura = (dato.ingresos / maxIngresos) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    {/* Barra */}
                    <div
                      className="w-full bg-[#0490C8] rounded-t hover:bg-[#023664] transition-all cursor-pointer relative"
                      style={{ height: `${altura}%`, minHeight: dato.ingresos > 0 ? '3px' : '0' }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                        <div className="font-semibold">${dato.ingresos.toFixed(2)}</div>
                        <div className="text-gray-300 text-xs">{dato.citasCompletadas} citas completadas</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Etiquetas de fecha */}
        <div className="flex gap-3 mt-1.5">
          <div className="w-10"></div>
          <div className="flex-1 flex justify-between gap-1">
            {datos.map((dato, index) => (
              <div key={index} className="flex-1 text-xs text-gray-600 font-medium text-center truncate">
                {dato.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico de barras - Citas */}
      <div className="relative">
        {/* Título del gráfico */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-900">Citas por Día</h4>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-[#0490C8] rounded"></div>
              <span className="text-xs text-gray-600 font-semibold">Completadas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-gray-400 rounded"></div>
              <span className="text-xs text-gray-600 font-semibold">No Completadas</span>
            </div>
          </div>
        </div>

        {/* Contenedor del gráfico */}
        <div className="flex gap-3">
          {/* Eje Y - Escala */}
          <div className="flex flex-col justify-between h-40 py-1">
            {[100, 75, 50, 25, 0].map((percent) => (
              <div key={percent} className="flex items-center">
                <span className="text-xs text-gray-400 w-10 text-right">
                  {Math.round((maxCitas * percent) / 100)}
                </span>
              </div>
            ))}
          </div>

          {/* Área de barras */}
          <div className="flex-1 relative">
            {/* Líneas de guía horizontales */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full border-b border-gray-100"></div>
              ))}
            </div>

            {/* Barras de citas - Agrupadas por día */}
            <div className="relative h-40 flex items-end justify-between gap-2">
              {datos.map((dato, index) => {
                const alturaCompletadas = (dato.citasCompletadas / maxCitas) * 100;
                const citasNoCompletadas = dato.totalCitas - dato.citasCompletadas;
                const alturaNoCompletadas = (citasNoCompletadas / maxCitas) * 100;
                
                return (
                  <div key={index} className="flex-1 flex items-end justify-center gap-0.5 h-full">
                    {/* Barra de completadas */}
                    <div className="flex-1 flex flex-col items-center justify-end h-full group">
                      <div
                        className="w-full bg-[#0490C8] rounded-t hover:bg-[#023664] transition-all cursor-pointer relative"
                        style={{ height: `${alturaCompletadas}%`, minHeight: dato.citasCompletadas > 0 ? '3px' : '0' }}
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                          <div className="font-semibold">{dato.citasCompletadas} completadas</div>
                        </div>
                      </div>
                    </div>

                    {/* Barra de no completadas */}
                    <div className="flex-1 flex flex-col items-center justify-end h-full group">
                      <div
                        className="w-full bg-gray-400 rounded-t hover:bg-gray-500 transition-all cursor-pointer relative"
                        style={{ height: `${alturaNoCompletadas}%`, minHeight: citasNoCompletadas > 0 ? '3px' : '0' }}
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                          <div className="font-semibold">{citasNoCompletadas} no completadas</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Etiquetas de fecha */}
        <div className="flex gap-3 mt-1.5">
          <div className="w-10"></div>
          <div className="flex-1 flex justify-between gap-2">
            {datos.map((dato, index) => (
              <div key={index} className="flex-1 text-xs text-gray-600 font-medium text-center truncate">
                {dato.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Período seleccionado</span>
          </div>
        </div>
      </div>
    </div>
  );
}

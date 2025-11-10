// frontend/src/components/reportes/HorasPicoChart.tsx

import { HorasPico } from '@/services/reportes.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HorasPicoChartProps {
  data: HorasPico;
  loading?: boolean;
}

export default function HorasPicoChart({ data, loading = false }: HorasPicoChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
        <div className="h-5 bg-gray-100 rounded-xl w-40 mb-4"></div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="h-20 bg-gray-100 rounded-xl"></div>
          <div className="h-20 bg-gray-100 rounded-xl"></div>
        </div>
        <div className="h-40 bg-gray-100 rounded-xl mb-3"></div>
        <div className="h-40 bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  if (!data || !data.citasPorDia || data.citasPorDia.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Sin datos de horas pico</h3>
        <p className="text-xs text-gray-600">No hay suficientes datos para generar el análisis de demanda</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-0.5">Horas Pico</h3>
        <p className="text-xs text-gray-600">Análisis de demanda por día y hora</p>
      </div>

      {/* KPIs Principales - Diseño más sobrio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {/* Día Pico */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full">
              Día Pico
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-0.5">{data.diaMasConcurrido}</p>
          <p className="text-xs text-gray-600">{data.diaMasConcurridoCitas} citas</p>
        </div>

        {/* Hora Pico */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full">
              Hora Pico
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-0.5">{data.horaMasConcurrida}</p>
          <p className="text-xs text-gray-600">{data.horaMasConcurridaCitas} citas</p>
        </div>
      </div>

      {/* Gráfico de Citas por Día */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-gray-900">Citas por Día de la Semana</h4>
          <span className="text-[10px] text-gray-500 font-medium">Total: {data.citasPorDia.reduce((sum, d) => sum + d.citas, 0)}</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.citasPorDia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="dia" 
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '6px 10px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar 
                dataKey="citas" 
                fill="#0490C8" 
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Citas por Hora */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-gray-900">Citas por Hora del Día</h4>
          <span className="text-[10px] text-gray-500 font-medium">Total: {data.citasPorHora.reduce((sum, h) => sum + h.citas, 0)}</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.citasPorHora}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="hora" 
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '6px 10px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar 
                dataKey="citas" 
                fill="#023664" 
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recomendaciones - Diseño más limpio */}
      {data.recomendaciones && data.recomendaciones.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-900 mb-2">Recomendaciones</h4>
              <ul className="space-y-1.5">
                {data.recomendaciones.map((rec, index) => (
                  <li key={index} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

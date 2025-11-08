// frontend/src/components/reportes/DashboardStats.tsx

import { DashboardStats as DashboardStatsType } from '@/services/reportes.service';

interface DashboardStatsProps {
  stats: DashboardStatsType;
  loading?: boolean;
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'orange' | 'gray';
}

const colorVariants = {
  blue: {
    icon: 'bg-gray-100 text-[#0490C8]',
  },
  green: {
    icon: 'bg-gray-100 text-gray-600',
  },
  red: {
    icon: 'bg-gray-100 text-gray-600',
  },
  purple: {
    icon: 'bg-gray-100 text-gray-600',
  },
  yellow: {
    icon: 'bg-gray-100 text-gray-600',
  },
  orange: {
    icon: 'bg-gray-100 text-gray-600',
  },
  gray: {
    icon: 'bg-gray-100 text-gray-600',
  },
};

function KPICard({ title, value, subtitle, change, icon, color }: KPICardProps) {
  const colors = colorVariants[color];
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg ${colors.icon} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700`}>
            {change}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">{title}</p>
        <p className="text-xl font-bold text-gray-900 mb-0.5">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-600">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default function DashboardStatsComponent({ stats, loading = false }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="bg-white p-3 rounded-xl border border-gray-200 animate-pulse"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="h-9 w-9 bg-gray-100 rounded-lg"></div>
              <div className="h-5 w-14 bg-gray-100 rounded-full"></div>
            </div>
            <div className="h-3 bg-gray-100 rounded w-20 mb-1"></div>
            <div className="h-6 bg-gray-100 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-100 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  const { periodoActual, comparacionPeriodoAnterior } = stats;

  // Validación: si no hay datos del período actual, mostrar mensaje
  if (!periodoActual || periodoActual.totalCitas === undefined) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">No hay datos disponibles</h3>
        <p className="text-xs text-gray-600">Selecciona un período para ver las estadísticas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {/* Ingresos totales - Métrica principal */}
      <KPICard
        title="Ingresos Totales"
        value={`$${(periodoActual.ingresoTotal || 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        change={comparacionPeriodoAnterior?.variacionIngresos}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="green"
      />

      {/* Total de Citas */}
      <KPICard
        title="Total de Citas"
        value={periodoActual.totalCitas}
        change={comparacionPeriodoAnterior?.variacionCitas}
        subtitle={`${periodoActual.citasCompletadas} completadas`}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        color="blue"
      />

      {/* Tasa de Asistencia */}
      <KPICard
        title="Tasa de Asistencia"
        value={`${(periodoActual.tasaAsistencia || 0).toFixed(1)}%`}
        change={comparacionPeriodoAnterior?.variacionTasaAsistencia}
        subtitle="Citas completadas"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="green"
      />

      {/* Ingreso Promedio */}
      <KPICard
        title="Ingreso Promedio"
        value={`$${(periodoActual.ingresoPromedioPorCita || 0).toFixed(2)}`}
        subtitle="Por cita completada"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
        color="purple"
      />

      {/* Citas Pendientes */}
      <KPICard
        title="Citas Pendientes"
        value={periodoActual.citasPendientes}
        subtitle="Por confirmar"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="yellow"
      />

      {/* Citas Confirmadas */}
      <KPICard
        title="Citas Confirmadas"
        value={periodoActual.citasConfirmadas}
        subtitle="Listas para atender"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        }
        color="blue"
      />

      {/* Cancelaciones */}
      <KPICard
        title="Cancelaciones"
        value={periodoActual.citasCanceladas + periodoActual.citasNoAsistio}
        subtitle={`${(periodoActual.tasaCancelacion || 0).toFixed(1)}% del total`}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="red"
      />

      {/* Tasa de Cancelación */}
      <KPICard
        title="Tasa de Cancelación"
        value={`${(periodoActual.tasaCancelacion || 0).toFixed(1)}%`}
        subtitle={`${periodoActual.citasCanceladas} canceladas, ${periodoActual.citasNoAsistio} no asistió`}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
        color="orange"
      />
    </div>
  );
}

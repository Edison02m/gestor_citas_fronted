// frontend/src/components/reportes/TasaUtilizacionCard.tsx

import { TasaUtilizacion } from '@/services/reportes.service';

interface TasaUtilizacionCardProps {
  data: TasaUtilizacion[];
  loading?: boolean;
}

export default function TasaUtilizacionCard({ data, loading = false }: TasaUtilizacionCardProps) {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-2xl border border-gray-200 animate-pulse">
        <div className="h-5 bg-gray-100 rounded w-40 mb-4"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between mb-1.5">
              <div className="h-3 bg-gray-100 rounded w-24"></div>
              <div className="h-3 bg-gray-100 rounded w-12"></div>
            </div>
            <div className="h-2 bg-gray-100 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-base font-bold text-gray-900 mb-1">Sin datos de utilización</p>
        <p className="text-xs text-gray-600">No hay datos suficientes para mostrar</p>
      </div>
    );
  }

  const promedioUtilizacion = data.reduce((sum, emp) => sum + emp.tasaUtilizacion, 0) / data.length;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-0.5">Tasa de Utilización</h3>
          <p className="text-xs text-gray-600">Horas trabajadas vs disponibles</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-600">Promedio</p>
          <p className={`text-xl font-bold ${promedioUtilizacion >= 70 ? 'text-green-600' : promedioUtilizacion >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {Math.round(promedioUtilizacion)}%
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {data.slice(0, 5).map((empleado, index) => (
          <div key={empleado.empleadoId || index} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-900">{empleado.empleadoNombre || 'Sin nombre'}</p>
                <p className="text-[10px] text-gray-600">
                  {empleado.horasTrabajadas}h / {empleado.horasDisponibles}h • {empleado.citasTotales} citas
                </p>
              </div>
              <span className={`text-xs font-bold ${empleado.tasaUtilizacion >= 70 ? 'text-green-600' : empleado.tasaUtilizacion >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {Math.round(empleado.tasaUtilizacion)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${empleado.tasaUtilizacion >= 70 ? 'bg-green-500' : empleado.tasaUtilizacion >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(empleado.tasaUtilizacion, 100)}%` }}
              ></div>
            </div>

            {empleado.espaciosVacios > 0 && (
              <p className="text-[10px] text-gray-600">
                <svg className="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {empleado.espaciosVacios} espacios vacíos de 30+ min
              </p>
            )}
          </div>
        ))}
      </div>

      {data.length > 5 && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-center">
          <p className="text-[10px] text-gray-600">Mostrando top 5 de {data.length} empleados</p>
        </div>
      )}
    </div>
  );
}

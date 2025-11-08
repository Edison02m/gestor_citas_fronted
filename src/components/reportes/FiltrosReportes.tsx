// frontend/src/components/reportes/FiltrosReportes.tsx

import { FiltrosReportes as FiltrosReportesType } from '@/services/reportes.service';

interface FiltrosReportesProps {
  filtros: FiltrosReportesType;
  onChange: (filtros: FiltrosReportesType) => void;
}

export default function FiltrosReportes({
  filtros,
  onChange
}: FiltrosReportesProps) {
  const handleChange = (key: keyof FiltrosReportesType, value: any) => {
    onChange({ ...filtros, [key]: value });
  };

  const handlePreset = (preset: 'hoy' | 'semana' | 'mes' | 'ano') => {
    const hoy = new Date();
    let fechaInicio: Date;

    switch (preset) {
      case 'hoy':
        fechaInicio = new Date(hoy);
        break;
      case 'semana':
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - 7);
        break;
      case 'mes':
        fechaInicio = new Date(hoy);
        fechaInicio.setMonth(hoy.getMonth() - 1);
        break;
      case 'ano':
        fechaInicio = new Date(hoy);
        fechaInicio.setFullYear(hoy.getFullYear() - 1);
        break;
    }

    onChange({
      ...filtros,
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0]
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
      {/* Header compacto */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-gray-900">Filtros de Período</h3>
      </div>

      {/* Presets de fechas - más compactos */}
      <div className="mb-3">
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => handlePreset('hoy')}
            className="px-2 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 border border-gray-200 rounded-xl transition-all"
          >
            Hoy
          </button>
          <button
            onClick={() => handlePreset('semana')}
            className="px-2 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 border border-gray-200 rounded-xl transition-all"
          >
            7 días
          </button>
          <button
            onClick={() => handlePreset('mes')}
            className="px-2 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 border border-gray-200 rounded-xl transition-all"
          >
            30 días
          </button>
          <button
            onClick={() => handlePreset('ano')}
            className="px-2 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 border border-gray-200 rounded-xl transition-all"
          >
            1 año
          </button>
        </div>
      </div>

      {/* Fechas personalizadas - más compactas */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha Inicio</label>
          <input
            type="date"
            value={filtros.fechaInicio || ''}
            onChange={(e) => handleChange('fechaInicio', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0490C8] focus:border-[#0490C8] text-xs text-gray-900 font-medium transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha Fin</label>
          <input
            type="date"
            value={filtros.fechaFin || ''}
            onChange={(e) => handleChange('fechaFin', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0490C8] focus:border-[#0490C8] text-xs text-gray-900 font-medium transition-all"
          />
        </div>
      </div>
    </div>
  );
}

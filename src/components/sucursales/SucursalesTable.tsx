'use client';

import { Sucursal } from '@/interfaces';

interface SucursalesTableProps {
  sucursales: Sucursal[];
  onEdit: (sucursal: Sucursal) => void;
  onEditHorarios: (sucursal: Sucursal) => void;
  onDelete: (sucursal: Sucursal) => void;
  loading?: boolean;
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function SucursalesTable({ 
  sucursales, 
  onEdit, 
  onEditHorarios, 
  onDelete, 
  loading 
}: SucursalesTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-[#0490C8] mx-auto"></div>
        <p className="text-sm text-gray-600 mt-4 font-medium">Cargando sucursales...</p>
      </div>
    );
  }

  if (sucursales.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No hay sucursales registradas</h3>
        <p className="text-sm text-gray-600">Agrega tu primera sucursal para comenzar a gestionar tu negocio</p>
      </div>
    );
  }

  const getHorariosResumen = (sucursal: Sucursal) => {
    const diasAbiertos = sucursal.horarios.filter(h => h.abierto);
    return `${diasAbiertos.length}/7 días`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sucursales.map((sucursal) => (
        <div 
          key={sucursal.id} 
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
        >
          {/* Header - Más limpio */}
          <div className="mb-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">{sucursal.nombre}</h3>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                sucursal.estado === 'ACTIVA' 
                  ? 'bg-gray-100 text-gray-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {sucursal.estado}
              </span>
            </div>
          </div>

          {/* Información - Más espaciada y limpia */}
          <div className="space-y-3 mb-5">
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <div className="text-sm">
                <p className="text-gray-900 font-medium">{sucursal.direccion}</p>
                {(sucursal.ciudad || sucursal.provincia) && (
                  <p className="text-gray-500 text-xs mt-0.5">
                    {[sucursal.ciudad, sucursal.provincia].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <p className="text-sm text-gray-700">{sucursal.telefono}</p>
            </div>

            {sucursal.email && (
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-700 truncate">{sucursal.email}</p>
              </div>
            )}
          </div>

          {/* Horarios - Diseño más limpio y sobrio */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-900">Horarios</span>
              <span className="text-xs text-gray-600 font-medium">{getHorariosResumen(sucursal)}</span>
            </div>
            <div className="flex gap-1.5">
              {DIAS_SEMANA.map((dia, index) => {
                const horario = sucursal.horarios.find(h => h.diaSemana === index);
                const tituloHorario = horario?.abierto 
                  ? `${horario.horaApertura} - ${horario.horaCierre}${
                      horario.tieneDescanso 
                        ? `\nDescanso: ${horario.descansoInicio} - ${horario.descansoFin}` 
                        : ''
                    }`
                  : 'Cerrado';
                
                return (
                  <div
                    key={index}
                    className={`relative flex-1 text-center py-2 rounded-xl text-xs font-semibold transition-all ${
                      horario?.abierto
                        ? 'bg-[#0490C8] text-white hover:bg-[#023664]'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                    title={tituloHorario}
                  >
                    {dia}
                    {horario?.abierto && horario?.tieneDescanso && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border-2 border-[#0490C8] shadow-sm" title="Tiene descanso"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Acciones - Botones más sobrios */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(sucursal)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Editar</span>
            </button>
            <button
              onClick={() => onEditHorarios(sucursal)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Horarios</span>
            </button>
            <button
              onClick={() => onDelete(sucursal)}
              className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

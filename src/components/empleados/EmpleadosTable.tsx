'use client';

import { Empleado } from '@/interfaces';

interface EmpleadosTableProps {
  empleados: Empleado[];
  onEdit: (empleado: Empleado) => void;
  onEditHorarios: (empleado: Empleado) => void;
  onEditBloqueos: (empleado: Empleado) => void;
  onEditSucursales: (empleado: Empleado) => void;
  onDelete: (empleado: Empleado) => void;
  loading?: boolean;
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function EmpleadosTable({ 
  empleados, 
  onEdit, 
  onEditHorarios,
  onEditBloqueos,
  onEditSucursales,
  onDelete, 
  loading 
}: EmpleadosTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-[#0490C8] mx-auto"></div>
        <p className="text-sm text-gray-600 mt-4 font-medium">Cargando empleados...</p>
      </div>
    );
  }

  if (empleados.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No hay empleados registrados</h3>
        <p className="text-sm text-gray-600">Agrega tu primer empleado para comenzar a gestionar tu equipo</p>
      </div>
    );
  }

  const getHorariosResumen = (empleado: Empleado) => {
    if (!empleado.horarios || empleado.horarios.length === 0) {
      return 'Sin horarios';
    }
    return `${empleado.horarios.length}/7 días`;
  };

  const getBloqueosActivos = (empleado: Empleado) => {
    if (!empleado.bloqueos || empleado.bloqueos.length === 0) return 0;
    
    const hoy = new Date();
    return empleado.bloqueos.filter(b => new Date(b.fechaFin) >= hoy).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {empleados.map((empleado) => (
        <div 
          key={empleado.id} 
          className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
        >
          {/* Header con foto y estado */}
          <div className="mb-5">
            <div className="flex items-start gap-4 mb-3">
              {/* Avatar */}
              <div 
                className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center bg-gray-100 text-gray-600 font-bold text-lg"
              >
                {empleado.foto ? (
                  <img 
                    src={empleado.foto} 
                    alt={empleado.nombre} 
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  empleado.nombre.charAt(0).toUpperCase()
                )}
              </div>

              {/* Nombre y estado */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">{empleado.nombre}</h3>
                <p className="text-sm text-gray-600 mt-1">{empleado.cargo}</p>
              </div>

              <span className={`px-3 py-1.5 text-xs font-semibold rounded-full flex-shrink-0 ${
                empleado.estado === 'ACTIVO' 
                  ? 'bg-gray-100 text-gray-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {empleado.estado}
              </span>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <p className="text-sm text-gray-700">{empleado.telefono}</p>
            </div>

            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-700 truncate">{empleado.email}</p>
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Disponibilidad</span>
              {getBloqueosActivos(empleado) > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span className="text-xs font-semibold text-red-600">
                    {getBloqueosActivos(empleado)} {getBloqueosActivos(empleado) === 1 ? 'bloqueo' : 'bloqueos'}
                  </span>
                </div>
              )}
            </div>

            {/* Días trabajados */}
            <div className="flex gap-1.5">
              {DIAS_SEMANA.map((dia, index) => {
                const horario = empleado.horarios?.find(h => h.diaSemana === index);
                const tieneHorario = !!horario;
                const tituloHorario = tieneHorario 
                  ? `${horario.horaInicio} - ${horario.horaFin}${
                      horario.tieneDescanso 
                        ? `\nDescanso: ${horario.descansoInicio} - ${horario.descansoFin}` 
                        : ''
                    }`
                  : 'Sin horario';
                
                return (
                  <div key={index} className="relative flex-1">
                    <div 
                      className={`text-center py-2 rounded-xl text-xs font-semibold transition-all ${
                        tieneHorario
                          ? 'bg-[#0490C8] text-white hover:bg-[#023664]'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                      title={tituloHorario}
                    >
                      {dia}
                    </div>
                    {tieneHorario && horario.tieneDescanso && (
                      <div 
                        className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border border-[#0490C8] shadow-sm" 
                        title="Tiene descanso"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Acciones - Layout compacto */}
          <div className="space-y-2.5">
            {/* Fila 1: Editar + Horarios + Bloqueos */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onEdit(empleado)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
                title="Editar empleado"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="hidden sm:inline">Editar</span>
              </button>
              
              <button
                onClick={() => onEditHorarios(empleado)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
                title="Configurar horarios"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Horarios</span>
              </button>

              <button
                onClick={() => onEditBloqueos(empleado)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
                title="Gestionar bloqueos"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span className="hidden sm:inline">Bloqueos</span>
              </button>
            </div>

            {/* Fila 2: Sucursales + Eliminar */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onEditSucursales(empleado)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
                title="Gestionar sucursales"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="hidden sm:inline">Sucursales</span>
              </button>

              <button
                onClick={() => onDelete(empleado)}
                className="flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
                title="Eliminar empleado"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

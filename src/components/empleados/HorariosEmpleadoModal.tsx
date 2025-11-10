'use client';

import { useState, useEffect } from 'react';
import { Empleado, HorarioEmpleadoDto } from '@/interfaces';
import EmpleadosService from '@/services/empleados.service';
import { SucursalesService } from '@/services/sucursales.service';

interface HorariosEmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (horarios: HorarioEmpleadoDto[]) => Promise<void>;
  empleado: Empleado | null;
  loading?: boolean;
}

const DIAS_SEMANA = [
  { num: 0, nombre: 'Domingo', letra: 'D' },
  { num: 1, nombre: 'Lunes', letra: 'L' },
  { num: 2, nombre: 'Martes', letra: 'M' },
  { num: 3, nombre: 'Miércoles', letra: 'X' },
  { num: 4, nombre: 'Jueves', letra: 'J' },
  { num: 5, nombre: 'Viernes', letra: 'V' },
  { num: 6, nombre: 'Sábado', letra: 'S' }
];

interface HorarioState {
  diaSemana: number;
  activo: boolean;
  horaInicio: string;
  horaFin: string;
  tieneDescanso: boolean;
  descansoInicio: string;
  descansoFin: string;
  sucursalId?: string | null;
}

export default function HorariosEmpleadoModal({ isOpen, onClose, onSubmit, empleado, loading }: HorariosEmpleadoModalProps) {
  const [horarios, setHorarios] = useState<HorarioState[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(1); // Lunes por defecto
  const [error, setError] = useState('');
  const [sucursalId, setSucursalId] = useState<string | null>(null);
  const [loadingSucursal, setLoadingSucursal] = useState(false);

  useEffect(() => {
    if (empleado && isOpen) {
      cargarHorarios();
      cargarSucursalEmpleado();
    }
  }, [empleado, isOpen]);

  const cargarSucursalEmpleado = async () => {
    if (!empleado) return;
    
    try {
      const sucursales = await EmpleadosService.getSucursales(empleado.id);
      if (sucursales.length > 0) {
        setSucursalId(sucursales[0].sucursalId);
      }
    } catch (error) {
      // Log removido
    }
  };

  const sincronizarConSucursal = async () => {
    if (!sucursalId) {
      setError('El empleado no tiene una sucursal asignada');
      return;
    }

    setLoadingSucursal(true);
    setError('');

    try {
      const sucursal = await SucursalesService.getSucursal(sucursalId);
      
      if (!sucursal.horarios || sucursal.horarios.length === 0) {
        setError('La sucursal no tiene horarios configurados');
        setLoadingSucursal(false);
        return;
      }

      // Mapear los horarios de la sucursal al formato del empleado
      const nuevoHorarios = DIAS_SEMANA.map(dia => {
        const horarioSucursal = sucursal.horarios.find(h => h.diaSemana === dia.num);
        
        if (horarioSucursal && horarioSucursal.abierto) {
          return {
            diaSemana: dia.num,
            activo: true,
            horaInicio: horarioSucursal.horaApertura || '09:00',
            horaFin: horarioSucursal.horaCierre || '18:00',
            tieneDescanso: horarioSucursal.tieneDescanso || false,
            descansoInicio: horarioSucursal.descansoInicio || '13:00',
            descansoFin: horarioSucursal.descansoFin || '14:00'
          };
        }

        return {
          diaSemana: dia.num,
          activo: false,
          horaInicio: '09:00',
          horaFin: '18:00',
          tieneDescanso: false,
          descansoInicio: '13:00',
          descansoFin: '14:00'
        };
      });

      setHorarios(nuevoHorarios);
      setLoadingSucursal(false);
    } catch (error: any) {
      // Log removido
      setError(error.response?.data?.message || error.message || 'Error al sincronizar con la sucursal');
      setLoadingSucursal(false);
    }
  };

  const cargarHorarios = () => {
    if (!empleado) return;

    const horariosIniciales = DIAS_SEMANA.map(dia => {
      // Verificar que empleado.horarios sea un array
      const horariosArray = Array.isArray(empleado.horarios) ? empleado.horarios : [];
      
      // Buscar horario para este día (ya no filtramos por sucursal)
      const horario = horariosArray.find(h => h.diaSemana === dia.num);
      
      return {
        diaSemana: dia.num,
        activo: !!horario,
        horaInicio: horario?.horaInicio || '09:00',
        horaFin: horario?.horaFin || '18:00',
        tieneDescanso: horario?.tieneDescanso === true,
        descansoInicio: horario?.descansoInicio || '13:00',
        descansoFin: horario?.descansoFin || '14:00'
      };
    });
    
    setHorarios(horariosIniciales);
  };

  const handleToggleActivo = (diaSemana: number) => {
    setHorarios(prev => prev.map(h =>
      h.diaSemana === diaSemana ? { ...h, activo: !h.activo } : h
    ));
  };

  const handleToggleDescanso = (diaSemana: number) => {
    setHorarios(prev => prev.map(h =>
      h.diaSemana === diaSemana ? { ...h, tieneDescanso: !h.tieneDescanso } : h
    ));
  };

  const handleHoraChange = (diaSemana: number, campo: 'horaInicio' | 'horaFin' | 'descansoInicio' | 'descansoFin', valor: string) => {
    setHorarios(prev => prev.map(h =>
      h.diaSemana === diaSemana ? { ...h, [campo]: valor } : h
    ));
  };

  const copiarATodos = () => {
    const horarioDia = horarios.find(h => h.diaSemana === diaSeleccionado);
    if (!horarioDia) return;

    setHorarios(prev => prev.map(h => ({
      ...h,
      activo: horarioDia.activo,
      horaInicio: horarioDia.horaInicio,
      horaFin: horarioDia.horaFin,
      tieneDescanso: horarioDia.tieneDescanso,
      descansoInicio: horarioDia.descansoInicio,
      descansoFin: horarioDia.descansoFin
    })));
  };

  const copiarAEntreSemana = () => {
    const horarioDia = horarios.find(h => h.diaSemana === diaSeleccionado);
    if (!horarioDia) return;

    setHorarios(prev => prev.map(h =>
      h.diaSemana >= 1 && h.diaSemana <= 5 ? {
        ...h,
        activo: horarioDia.activo,
        horaInicio: horarioDia.horaInicio,
        horaFin: horarioDia.horaFin,
        tieneDescanso: horarioDia.tieneDescanso,
        descansoInicio: horarioDia.descansoInicio,
        descansoFin: horarioDia.descansoFin
      } : h
    ));
  };

  const copiarAFinSemana = () => {
    const horarioDia = horarios.find(h => h.diaSemana === diaSeleccionado);
    if (!horarioDia) return;

    setHorarios(prev => prev.map(h =>
      h.diaSemana === 0 || h.diaSemana === 6 ? {
        ...h,
        activo: horarioDia.activo,
        horaInicio: horarioDia.horaInicio,
        horaFin: horarioDia.horaFin,
        tieneDescanso: horarioDia.tieneDescanso,
        descansoInicio: horarioDia.descansoInicio,
        descansoFin: horarioDia.descansoFin
      } : h
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar horarios activos
    const horariosActivos = horarios.filter(h => h.activo);
    
    if (horariosActivos.length === 0) {
      setError('Debe configurar al menos un día de trabajo');
      return;
    }

    for (const horario of horariosActivos) {
      if (!horario.horaInicio || !horario.horaFin) {
        setError('Todos los días activos deben tener hora de inicio y fin');
        return;
      }
      if (horario.horaInicio >= horario.horaFin) {
        setError('La hora de inicio debe ser menor que la hora de fin');
        return;
      }

      // Validar descanso si está habilitado
      if (horario.tieneDescanso) {
        if (!horario.descansoInicio || !horario.descansoFin) {
          setError('Los días con descanso deben tener hora de inicio y fin del descanso');
          return;
        }
        if (horario.descansoInicio >= horario.descansoFin) {
          setError('La hora de inicio del descanso debe ser menor que la hora de fin');
          return;
        }
        if (horario.descansoInicio <= horario.horaInicio || horario.descansoFin >= horario.horaFin) {
          setError('El horario de descanso debe estar dentro del horario de trabajo');
          return;
        }
      }
    }

    try {
      // El backend espera un array directo de horarios en formato específico
      const horariosDto = horariosActivos.map(h => {
        const horario: any = {
          diaSemana: h.diaSemana,
          horaInicio: h.horaInicio,
          horaFin: h.horaFin,
          tieneDescanso: h.tieneDescanso || false
        };

        // Solo incluir descanso si está habilitado
        if (h.tieneDescanso) {
          horario.descansoInicio = h.descansoInicio;
          horario.descansoFin = h.descansoFin;
        }

        return horario;
      });

      await onSubmit(horariosDto);
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Error al actualizar horarios');
    }
  };

  if (!isOpen || !empleado) return null;

  const horarioDiaSeleccionado = horarios.find(h => h.diaSemana === diaSeleccionado);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Configurar Horarios</h2>
            <p className="text-xs text-gray-600 mt-0.5">{empleado.nombre}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - 2 columnas */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-3 sm:p-6">
            {/* Columna izquierda: Selector de días y resumen */}
            <div className="space-y-4 sm:space-y-5">
              {/* Selector de días - Grid compacto */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900">Días de trabajo</h3>
                  {sucursalId && (
                    <button
                      type="button"
                      onClick={sincronizarConSucursal}
                      disabled={loadingSucursal}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#0490C8] text-white text-xs font-medium rounded-xl hover:bg-[#037ab0] transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
                      title="Sincronizar con horario de la sucursal"
                    >
                      {loadingSucursal ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="hidden sm:inline">Sincronizando...</span>
                          <span className="sm:hidden">Sync...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="hidden sm:inline">Igual a sucursal</span>
                          <span className="sm:hidden">Sincronizar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-7 sm:grid-cols-4 gap-1.5 sm:gap-2">
                  {DIAS_SEMANA.map((dia) => {
                    const horario = horarios.find(h => h.diaSemana === dia.num);
                    const esSeleccionado = diaSeleccionado === dia.num;
                    const estaActivo = horario?.activo;

                    return (
                      <button
                        key={dia.num}
                        type="button"
                        onClick={() => setDiaSeleccionado(dia.num)}
                        className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl text-xs font-semibold transition-all ${
                          esSeleccionado
                            ? 'bg-[#0490C8] text-white shadow-md'
                            : estaActivo
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-white border border-gray-300 text-gray-500 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-bold">{dia.letra}</div>
                          <div className="text-[10px] mt-0.5 opacity-90 hidden sm:block">{dia.nombre.slice(0, 3)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resumen semanal */}
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3">Resumen semanal</h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {horarios.map((horario) => {
                    const dia = DIAS_SEMANA.find(d => d.num === horario.diaSemana);
                    return (
                      <div key={horario.diaSemana} className="text-[10px] sm:text-xs">
                        <span className="font-medium text-gray-700 inline-block w-16 sm:w-20">{dia?.nombre}:</span>
                        {horario.activo ? (
                          <span className="text-gray-700">
                            {horario.horaInicio} → {horario.tieneDescanso && (
                              <span className="text-[#0490C8] font-medium hidden sm:inline">{horario.descansoInicio}-{horario.descansoFin} → </span>
                            )}{horario.horaFin}
                          </span>
                        ) : (
                          <span className="text-gray-400">No trabaja</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Columna derecha: Configuración del día seleccionado */}
            <div className="mt-4 lg:mt-0">
              {horarioDiaSeleccionado && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 h-full">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {DIAS_SEMANA.find(d => d.num === diaSeleccionado)?.nombre}
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-medium text-gray-600">
                        {horarioDiaSeleccionado.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={horarioDiaSeleccionado.activo}
                          onChange={() => handleToggleActivo(diaSeleccionado)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0490C8]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0490C8]"></div>
                      </div>
                    </label>
                  </div>

                  {horarioDiaSeleccionado.activo && (
                    <>
                      {/* Horarios principales */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Inicio</label>
                          <input
                            type="time"
                            value={horarioDiaSeleccionado.horaInicio}
                            onChange={(e) => handleHoraChange(diaSeleccionado, 'horaInicio', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Fin</label>
                          <input
                            type="time"
                            value={horarioDiaSeleccionado.horaFin}
                            onChange={(e) => handleHoraChange(diaSeleccionado, 'horaFin', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20"
                          />
                        </div>
                      </div>

                      {/* Descanso */}
                      <div className="pt-2 border-t border-gray-200">
                        <label className="flex items-center justify-between cursor-pointer mb-2">
                          <span className="text-xs font-medium text-gray-700">Descanso/Almuerzo</span>
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={horarioDiaSeleccionado.tieneDescanso}
                              onChange={() => handleToggleDescanso(diaSeleccionado)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0490C8]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#0490C8]"></div>
                          </div>
                        </label>

                        {horarioDiaSeleccionado.tieneDescanso && (
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Inicio</label>
                              <input
                                type="time"
                                value={horarioDiaSeleccionado.descansoInicio}
                                onChange={(e) => handleHoraChange(diaSeleccionado, 'descansoInicio', e.target.value)}
                                className="w-full px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Fin</label>
                              <input
                                type="time"
                                value={horarioDiaSeleccionado.descansoFin}
                                onChange={(e) => handleHoraChange(diaSeleccionado, 'descansoFin', e.target.value)}
                                className="w-full px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Acciones rápidas */}
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-2">Aplicar a otros días</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={copiarATodos}
                            className="flex-1 px-2 sm:px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1.5"
                            title="Aplicar a todos los días"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Toda la semana</span>
                          </button>
                          <button
                            type="button"
                            onClick={copiarAEntreSemana}
                            className="flex-1 px-2 sm:px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1.5"
                            title="Aplicar de Lunes a Viernes"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">Entre semana</span>
                            <span className="sm:hidden">L-V</span>
                          </button>
                          <button
                            type="button"
                            onClick={copiarAFinSemana}
                            className="flex-1 px-2 sm:px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1.5"
                            title="Aplicar Sábado y Domingo"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className="hidden sm:inline">Fin de semana</span>
                            <span className="sm:hidden">S-D</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white flex-shrink-0">
            {error && (
              <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs sm:text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-[#0490C8] text-white font-medium rounded-xl hover:bg-[#037ab0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar horarios'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

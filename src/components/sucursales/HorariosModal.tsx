'use client';

import { useState, useEffect } from 'react';
import { Sucursal, HorarioDto } from '@/interfaces';

interface HorariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (horarios: HorarioDto[]) => Promise<void>;
  sucursal: Sucursal | null;
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
  abierto: boolean;
  horaApertura: string;
  horaCierre: string;
  tieneDescanso: boolean;
  descansoInicio: string;
  descansoFin: string;
}

export default function HorariosModal({ isOpen, onClose, onSubmit, sucursal, loading }: HorariosModalProps) {
  const [horarios, setHorarios] = useState<HorarioState[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(1); // Lunes por defecto
  const [error, setError] = useState('');

  useEffect(() => {
    if (sucursal && isOpen) {
      const horariosIniciales = DIAS_SEMANA.map(dia => {
        const horario = sucursal.horarios.find(h => h.diaSemana === dia.num);
        
        return {
          diaSemana: dia.num,
          abierto: horario?.abierto || false,
          horaApertura: horario?.horaApertura || '09:00',
          horaCierre: horario?.horaCierre || '18:00',
          tieneDescanso: horario?.tieneDescanso === true,
          descansoInicio: horario?.descansoInicio || '13:00',
          descansoFin: horario?.descansoFin || '14:00'
        };
      });
      
      setHorarios(horariosIniciales);
    }
  }, [sucursal, isOpen]);

  const handleToggleAbierto = (diaSemana: number) => {
    setHorarios(prev => prev.map(h =>
      h.diaSemana === diaSemana ? { ...h, abierto: !h.abierto } : h
    ));
  };

  const handleToggleDescanso = (diaSemana: number) => {
    setHorarios(prev => prev.map(h =>
      h.diaSemana === diaSemana ? { ...h, tieneDescanso: !h.tieneDescanso } : h
    ));
  };

  const handleHoraChange = (diaSemana: number, campo: 'horaApertura' | 'horaCierre' | 'descansoInicio' | 'descansoFin', valor: string) => {
    setHorarios(prev => prev.map(h =>
      h.diaSemana === diaSemana ? { ...h, [campo]: valor } : h
    ));
  };

  const copiarATodos = () => {
    const horarioDia = horarios.find(h => h.diaSemana === diaSeleccionado);
    if (!horarioDia) return;

    setHorarios(prev => prev.map(h => ({
      ...h,
      abierto: horarioDia.abierto,
      horaApertura: horarioDia.horaApertura,
      horaCierre: horarioDia.horaCierre,
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
        abierto: horarioDia.abierto,
        horaApertura: horarioDia.horaApertura,
        horaCierre: horarioDia.horaCierre,
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
        abierto: horarioDia.abierto,
        horaApertura: horarioDia.horaApertura,
        horaCierre: horarioDia.horaCierre,
        tieneDescanso: horarioDia.tieneDescanso,
        descansoInicio: horarioDia.descansoInicio,
        descansoFin: horarioDia.descansoFin
      } : h
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que los horarios abiertos tengan horas válidas
    for (const horario of horarios) {
      if (horario.abierto) {
        const nombreDia = DIAS_SEMANA.find(d => d.num === horario.diaSemana)?.nombre || 'Día ' + horario.diaSemana;
        
        if (!horario.horaApertura || !horario.horaCierre) {
          setError(`El día ${nombreDia} está abierto pero falta la hora de apertura o cierre`);
          return;
        }
        
        if (horario.horaApertura >= horario.horaCierre) {
          setError(`El día ${nombreDia}: La hora de apertura debe ser menor que la hora de cierre`);
          return;
        }

        // Validar descanso si está habilitado
        if (horario.tieneDescanso) {
          if (!horario.descansoInicio || !horario.descansoFin) {
            setError(`El día ${nombreDia} tiene descanso activado pero falta la hora de inicio o fin del descanso`);
            return;
          }
          
          if (horario.descansoInicio >= horario.descansoFin) {
            setError(`El día ${nombreDia}: La hora de inicio del descanso debe ser menor que la hora de fin`);
            return;
          }
          
          if (horario.descansoInicio <= horario.horaApertura || horario.descansoFin >= horario.horaCierre) {
            setError(`El día ${nombreDia}: El horario de descanso debe estar dentro del horario de apertura y cierre`);
            return;
          }
        }
      }
    }

    try {
      const horariosDto: HorarioDto[] = horarios.map(h => ({
        diaSemana: h.diaSemana,
        abierto: h.abierto,
        ...(h.abierto && {
          horaApertura: h.horaApertura,
          horaCierre: h.horaCierre,
          tieneDescanso: h.tieneDescanso,
          ...(h.tieneDescanso && {
            descansoInicio: h.descansoInicio,
            descansoFin: h.descansoFin
          })
        })
      }));

      await onSubmit(horariosDto);
    } catch (error: any) {
      setError(error.message || 'Error al actualizar horarios');
    }
  };

  if (!isOpen || !sucursal) return null;

  const horarioDiaSeleccionado = horarios.find(h => h.diaSemana === diaSeleccionado);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Configurar Horarios</h2>
            <p className="text-xs text-gray-600 mt-0.5">{sucursal.nombre}</p>
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

        <form id="horarios-form" onSubmit={handleSubmit} className="p-3 sm:p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-full">
            {/* Columna Izquierda: Selector de Días */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Días de trabajo</h3>
              <div className="grid grid-cols-7 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {DIAS_SEMANA.map((dia) => {
                  const horario = horarios.find(h => h.diaSemana === dia.num);
                  const esSeleccionado = diaSeleccionado === dia.num;
                  const estaActivo = horario?.abierto;

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

              {/* Resumen de Horarios */}
              <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Resumen Semanal</h3>
                <div className="space-y-1 sm:space-y-1.5">
                  {DIAS_SEMANA.map(dia => {
                    const horario = horarios.find(h => h.diaSemana === dia.num);
                    if (!horario) return null;

                    return (
                      <div
                        key={dia.num}
                        className="flex items-center justify-between text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 rounded-lg sm:rounded-xl hover:bg-white transition-colors cursor-pointer"
                        onClick={() => setDiaSeleccionado(dia.num)}
                      >
                        <span className="font-medium text-gray-700 w-10 sm:w-16">{dia.nombre.substring(0, 3)}</span>
                        {horario.abierto ? (
                          <div className="flex items-center gap-0.5 sm:gap-1 font-mono text-[9px] sm:text-[11px]">
                            <span className="text-gray-700">{horario.horaApertura}</span>
                            {horario.tieneDescanso ? (
                              <>
                                <span className="text-gray-400 hidden sm:inline">→</span>
                                <span className="text-[#0490C8] hidden sm:inline">{horario.descansoInicio}-{horario.descansoFin}</span>
                                <span className="text-gray-400 hidden sm:inline">→</span>
                                <span className="text-gray-400 sm:hidden">-</span>
                              </>
                            ) : (
                              <span className="text-gray-400">━━</span>
                            )}
                            <span className="text-gray-700">{horario.horaCierre}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[9px] sm:text-[11px]">Cerrado</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Columna Derecha: Configuración del Día */}
            <div className="mt-4 lg:mt-0">
              {horarioDiaSeleccionado && (
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2.5 sm:space-y-3 h-full">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {DIAS_SEMANA.find(d => d.num === diaSeleccionado)?.nombre}
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-medium text-gray-600">
                        {horarioDiaSeleccionado.abierto ? 'Abierto' : 'Cerrado'}
                      </span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={horarioDiaSeleccionado.abierto}
                          onChange={() => handleToggleAbierto(diaSeleccionado)}
                          className="sr-only peer"
                        />
                        <div className="w-9 sm:w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0490C8]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0490C8]"></div>
                      </div>
                    </label>
                  </div>

                  {horarioDiaSeleccionado.abierto && (
                    <>
                      {/* Horarios principales */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Apertura</label>
                          <input
                            type="time"
                            value={horarioDiaSeleccionado.horaApertura}
                            onChange={(e) => handleHoraChange(diaSeleccionado, 'horaApertura', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Cierre</label>
                          <input
                            type="time"
                            value={horarioDiaSeleccionado.horaCierre}
                            onChange={(e) => handleHoraChange(diaSeleccionado, 'horaCierre', e.target.value)}
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
                            <span className="hidden sm:inline">Toda la semana</span>
                            <span className="sm:hidden">Todos</span>
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
        </form>

        {/* Footer fijo */}
        <div className="border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4 bg-white flex-shrink-0">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm shadow-sm mb-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="horarios-form"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#0490C8] hover:bg-[#023664] text-white font-medium rounded-xl transition-all disabled:opacity-50 text-sm"
            >
              {loading ? 'Guardando...' : 'Guardar Horarios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

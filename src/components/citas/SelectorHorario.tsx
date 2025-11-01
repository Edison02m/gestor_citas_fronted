'use client';

import { useState, useEffect } from 'react';
import { Cita } from '@/interfaces';
import { CitasService } from '@/services/citas.service';

interface SelectorHorarioProps {
  fecha: string;
  sucursalId: string;
  servicioId: string;
  empleadoId?: string;
  duracionServicio: number; // Duración en minutos
  onSelectHorario: (horaInicio: string, horaFin: string) => void;
  horaInicioSeleccionada?: string;
}

interface HorarioSucursal {
  horaApertura: string;
  horaCierre: string;
  descansoInicio?: string;
  descansoFin?: string;
}

export default function SelectorHorario({
  fecha,
  sucursalId,
  servicioId,
  empleadoId,
  duracionServicio,
  onSelectHorario,
  horaInicioSeleccionada
}: SelectorHorarioProps) {
  const [horaInicio, setHoraInicio] = useState(horaInicioSeleccionada || '');
  const [horaFin, setHoraFin] = useState('');
  const [citasExistentes, setCitasExistentes] = useState<Cita[]>([]);
  const [horarioSucursal, setHorarioSucursal] = useState<HorarioSucursal | null>(null);
  const [loading, setLoading] = useState(false);
  const [validando, setValidando] = useState(false);
  const [error, setError] = useState<string>('');
  const [disponible, setDisponible] = useState<boolean | null>(null);

  // Cargar citas existentes para esa fecha
  useEffect(() => {
    if (fecha && sucursalId) {
      loadCitasDelDia();
    }
  }, [fecha, sucursalId, empleadoId]);

  // Calcular hora fin automáticamente
  useEffect(() => {
    if (horaInicio) {
      const horaFinCalculada = calcularHoraFin(horaInicio, duracionServicio);
      setHoraFin(horaFinCalculada);
      validarDisponibilidad(horaInicio, horaFinCalculada);
    } else {
      setHoraFin('');
      setDisponible(null);
      setError('');
    }
  }, [horaInicio, duracionServicio, citasExistentes]);

  const loadCitasDelDia = async () => {
    setLoading(true);
    try {
      const response = await CitasService.getCitas({
        fechaInicio: fecha,
        fechaFin: fecha,
        sucursalId,
        empleadoId
      });
      
      // Filtrar solo citas no canceladas
      const citasActivas = response.data.filter(
        cita => cita.estado !== 'CANCELADA'
      );
      
      setCitasExistentes(citasActivas);
      
      // Extraer horario de la primera cita (asumiendo que tiene info de sucursal)
      // En un caso real, esto vendría del endpoint de sucursales
      if (citasActivas.length > 0 && citasActivas[0].sucursal) {
        // Por ahora usamos horario estándar, pero podrías obtenerlo del backend
        setHorarioSucursal({
          horaApertura: '08:00',
          horaCierre: '18:00'
        });
      } else {
        setHorarioSucursal({
          horaApertura: '08:00',
          horaCierre: '18:00'
        });
      }
    } catch (error) {
      // Log removido
      setError('Error al cargar las citas existentes');
      setHorarioSucursal({
        horaApertura: '08:00',
        horaCierre: '18:00'
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularHoraFin = (horaInicio: string, duracionMinutos: number): string => {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracionMinutos;
    
    const horasFinales = Math.floor(totalMinutos / 60);
    const minutosFinales = totalMinutos % 60;
    
    return `${horasFinales.toString().padStart(2, '0')}:${minutosFinales.toString().padStart(2, '0')}`;
  };

  const timeToMinutes = (time: string): number => {
    const [horas, minutos] = time.split(':').map(Number);
    return horas * 60 + minutos;
  };

  const validarDisponibilidad = (inicio: string, fin: string) => {
    setValidando(true);
    setError('');
    setDisponible(null);

    // 1. Validar que esté dentro del horario de la sucursal
    if (horarioSucursal) {
      const inicioMin = timeToMinutes(inicio);
      const finMin = timeToMinutes(fin);
      const aperturaMin = timeToMinutes(horarioSucursal.horaApertura);
      const cierreMin = timeToMinutes(horarioSucursal.horaCierre);

      if (inicioMin < aperturaMin) {
        setError(`La sucursal abre a las ${horarioSucursal.horaApertura}`);
        setDisponible(false);
        setValidando(false);
        return;
      }

      if (finMin > cierreMin) {
        setError(`La sucursal cierra a las ${horarioSucursal.horaCierre}. Tu cita terminaría a las ${fin}`);
        setDisponible(false);
        setValidando(false);
        return;
      }

      // Validar descanso si existe
      if (horarioSucursal.descansoInicio && horarioSucursal.descansoFin) {
        const descansoInicioMin = timeToMinutes(horarioSucursal.descansoInicio);
        const descansoFinMin = timeToMinutes(horarioSucursal.descansoFin);

        const solapaConDescanso = (
          (inicioMin >= descansoInicioMin && inicioMin < descansoFinMin) ||
          (finMin > descansoInicioMin && finMin <= descansoFinMin) ||
          (inicioMin <= descansoInicioMin && finMin >= descansoFinMin)
        );

        if (solapaConDescanso) {
          setError(`Horario de descanso: ${horarioSucursal.descansoInicio} - ${horarioSucursal.descansoFin}`);
          setDisponible(false);
          setValidando(false);
          return;
        }
      }
    }

    // 2. Validar conflictos con citas existentes
    const inicioMin = timeToMinutes(inicio);
    const finMin = timeToMinutes(fin);

    const hayConflicto = citasExistentes.some(cita => {
      const citaInicioMin = timeToMinutes(cita.horaInicio);
      const citaFinMin = timeToMinutes(cita.horaFin);

      return (
        (inicioMin >= citaInicioMin && inicioMin < citaFinMin) ||
        (finMin > citaInicioMin && finMin <= citaFinMin) ||
        (inicioMin <= citaInicioMin && finMin >= citaFinMin)
      );
    });

    if (hayConflicto) {
      setError('⚠️ Ya existe una cita en este horario');
      setDisponible(false);
    } else {
      setDisponible(true);
      onSelectHorario(inicio, fin);
    }

    setValidando(false);
  };

  const handleHoraInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHoraInicio(e.target.value);
  };

  const getCitasOrdenadas = () => {
    return [...citasExistentes].sort((a, b) => {
      return timeToMinutes(a.horaInicio) - timeToMinutes(b.horaInicio);
    });
  };

  const getSugerenciasHorarios = () => {
    if (!horarioSucursal) return [];

    const sugerencias: string[] = [];
    const aperturaMin = timeToMinutes(horarioSucursal.horaApertura);
    const cierreMin = timeToMinutes(horarioSucursal.horaCierre);

    // Agregar hora de apertura
    sugerencias.push(horarioSucursal.horaApertura);

    // Agregar horas después de cada cita
    citasExistentes.forEach(cita => {
      const citaFinMin = timeToMinutes(cita.horaFin);
      if (citaFinMin + duracionServicio <= cierreMin) {
        sugerencias.push(cita.horaFin);
      }
    });

    return sugerencias;
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0490C8] mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Cargando disponibilidad...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info del servicio */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Selecciona la hora de inicio</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Duración: <span className="font-semibold">{duracionServicio} minutos</span>
              {horarioSucursal && (
                <> • Horario: {horarioSucursal.horaApertura} - {horarioSucursal.horaCierre}</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Selector de hora */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de inicio *
            </label>
            <input
              type="time"
              value={horaInicio}
              onChange={handleHoraInicioChange}
              min={horarioSucursal?.horaApertura}
              max={horarioSucursal?.horaCierre}
              step="60"
              className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de fin (automática)
            </label>
            <input
              type="time"
              value={horaFin}
              disabled
              className="w-full px-4 py-3 text-base text-gray-900 bg-gray-100 border-2 border-gray-200 rounded-xl cursor-not-allowed"
            />
          </div>
        </div>

        {/* Sugerencias de horarios */}
        {getSugerenciasHorarios().length > 0 && !horaInicio && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">💡 Horarios sugeridos:</p>
            <div className="flex flex-wrap gap-2">
              {getSugerenciasHorarios().map((hora, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setHoraInicio(hora)}
                  className="px-3 py-1.5 text-sm text-[#0490C8] bg-[#0490C8]/10 rounded-lg hover:bg-[#0490C8]/20 transition-colors"
                >
                  {hora}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Validación en tiempo real */}
        {validando && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0490C8]"></div>
            Validando disponibilidad...
          </div>
        )}

        {/* Mensaje de disponibilidad */}
        {disponible === true && horaInicio && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">✅ Horario disponible</p>
                <p className="text-sm text-green-700 mt-0.5">
                  <span className="font-semibold">{horaInicio}</span> a <span className="font-semibold">{horaFin}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {disponible === false && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-900">❌ Horario no disponible</p>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de citas existentes */}
      {citasExistentes.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h4 className="text-sm font-semibold text-gray-700">
              Horarios ocupados este día ({citasExistentes.length})
            </h4>
          </div>
          
          <div className="space-y-2">
            {getCitasOrdenadas().map((cita, index) => (
              <div
                key={cita.id || index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 rounded-lg p-2">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {cita.horaInicio} - {cita.horaFin}
                    </p>
                    <p className="text-xs text-gray-600">
                      {cita.cliente?.nombre || 'Cliente'} • {cita.servicio?.nombre || 'Servicio'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {cita.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {citasExistentes.length === 0 && !loading && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-green-900">¡Todo el día está disponible!</p>
          <p className="text-xs text-green-700 mt-1">No hay citas agendadas para esta fecha</p>
        </div>
      )}
    </div>
  );
}

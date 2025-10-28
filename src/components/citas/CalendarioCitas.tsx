'use client';

import { useState, useEffect } from 'react';
import { HorarioDisponible } from '@/interfaces';
import { CitasService } from '@/services/citas.service';

interface CalendarioCitasProps {
  fecha: string;
  sucursalId: string;
  servicioId: string;
  empleadoId?: string;
  duracionServicio: number; // Duración en minutos
  onSelectSlot: (horaInicio: string, horaFin: string) => void;
  selectedSlot?: { horaInicio: string; horaFin: string } | null;
}

export default function CalendarioCitas({
  fecha,
  sucursalId,
  servicioId,
  empleadoId,
  duracionServicio,
  onSelectSlot,
  selectedSlot
}: CalendarioCitasProps) {
  const [slots, setSlots] = useState<HorarioDisponible[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (fecha && sucursalId && servicioId) {
      loadDisponibilidad();
    }
  }, [fecha, sucursalId, servicioId, empleadoId]);

  const loadDisponibilidad = async () => {
    try {
      setLoading(true);
      setError('');
      const horarios = await CitasService.obtenerDisponibilidad({
        fecha,
        sucursalId,
        servicioId,
        empleadoId
      });
      setSlots(horarios);
    } catch (err: any) {
      setError(err.message || 'Error al cargar disponibilidad');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const calcularHoraFin = (horaInicio: string, duracionMinutos: number): string => {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const date = new Date();
    date.setHours(horas, minutos, 0);
    date.setMinutes(date.getMinutes() + duracionMinutos);
    
    const horaFin = date.getHours().toString().padStart(2, '0');
    const minutosFin = date.getMinutes().toString().padStart(2, '0');
    
    return `${horaFin}:${minutosFin}`;
  };

  // Verificar si un slot es parte de la cita que se está agendando
  const isSlotInRange = (slot: HorarioDisponible): boolean => {
    if (!selectedSlot) return false;
    
    const slotInicioMin = timeToMinutes(slot.horaInicio);
    const selectedInicioMin = timeToMinutes(selectedSlot.horaInicio);
    const selectedFinMin = timeToMinutes(selectedSlot.horaFin);
    
    return slotInicioMin >= selectedInicioMin && slotInicioMin < selectedFinMin;
  };

  const timeToMinutes = (time: string): number => {
    const [horas, minutos] = time.split(':').map(Number);
    return horas * 60 + minutos;
  };

  // Verificar si los próximos slots necesarios están disponibles
  const canBookFromSlot = (startIndex: number): boolean => {
    const slotsNeeded = Math.ceil(duracionServicio / 30);
    
    for (let i = 0; i < slotsNeeded; i++) {
      const slot = slots[startIndex + i];
      if (!slot || !slot.disponible) {
        return false;
      }
    }
    
    return true;
  };

  const handleSlotClick = (slot: HorarioDisponible, index: number) => {
    if (!slot.disponible) return;
    
    // Verificar si hay suficientes slots disponibles consecutivos
    if (!canBookFromSlot(index)) {
      setError(`No hay ${duracionServicio} minutos disponibles desde esta hora`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    const horaFin = calcularHoraFin(slot.horaInicio, duracionServicio);
    onSelectSlot(slot.horaInicio, horaFin);
  };

  // Agrupar slots por bloques de tiempo (mañana, tarde, noche)
  const agruparSlotsPorPeriodo = () => {
    const manana: HorarioDisponible[] = [];
    const tarde: HorarioDisponible[] = [];
    const noche: HorarioDisponible[] = [];

    slots.forEach(slot => {
      const hora = parseInt(slot.horaInicio.split(':')[0]);
      if (hora < 12) {
        manana.push(slot);
      } else if (hora < 18) {
        tarde.push(slot);
      } else {
        noche.push(slot);
      }
    });

    return { manana, tarde, noche };
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0490C8] mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Cargando horarios disponibles...</p>
      </div>
    );
  }

  if (error && slots.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 text-yellow-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-yellow-800 font-medium">No hay horarios disponibles</p>
        <p className="text-xs text-yellow-700 mt-1">Intenta con otra fecha, sucursal o empleado</p>
      </div>
    );
  }

  const { manana, tarde, noche } = agruparSlotsPorPeriodo();

  const renderSlotButton = (slot: HorarioDisponible, index: number) => {
    const isSelected = isSlotInRange(slot);
    const isStartSlot = selectedSlot?.horaInicio === slot.horaInicio;
    const canBook = canBookFromSlot(index);
    
    let buttonClass = 'px-3 py-2 text-sm rounded-lg transition-all border-2 ';
    
    if (!slot.disponible) {
      buttonClass += 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed';
    } else if (isSelected) {
      if (isStartSlot) {
        buttonClass += 'bg-[#0490C8] text-white border-[#0490C8] font-medium shadow-md';
      } else {
        buttonClass += 'bg-[#0490C8]/20 text-[#0490C8] border-[#0490C8]/30';
      }
    } else if (canBook) {
      buttonClass += 'bg-white text-gray-700 border-gray-200 hover:border-[#0490C8] hover:bg-[#0490C8]/5 hover:text-[#0490C8] cursor-pointer';
    } else {
      buttonClass += 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60';
    }

    return (
      <button
        key={`${slot.horaInicio}-${index}`}
        type="button"
        onClick={() => handleSlotClick(slot, index)}
        disabled={!slot.disponible || !canBook}
        className={buttonClass}
        title={
          !slot.disponible 
            ? 'Horario ocupado' 
            : !canBook 
            ? `Se necesitan ${duracionServicio} minutos consecutivos` 
            : `Agendar desde ${slot.horaInicio}`
        }
      >
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{slot.horaInicio}</span>
        </div>
      </button>
    );
  };

  const renderPeriodo = (titulo: string, slots: HorarioDisponible[], icono: React.ReactNode, startIndex: number) => {
    if (slots.length === 0) return null;

    return (
      <div className="mb-6 last:mb-0">
        <div className="flex items-center gap-2 mb-3">
          {icono}
          <h4 className="text-sm font-semibold text-gray-700">{titulo}</h4>
          <span className="text-xs text-gray-500">
            ({slots.filter(s => s.disponible).length} disponibles)
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {slots.map((slot, relativeIndex) => {
            const absoluteIndex = startIndex + relativeIndex;
            return renderSlotButton(slot, absoluteIndex);
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header con info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Selecciona un horario</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Duración del servicio: <span className="font-semibold">{duracionServicio} minutos</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              💡 Los bloques en azul claro muestran el tiempo que ocupará tu cita
            </p>
          </div>
        </div>
      </div>

      {/* Mensaje de error temporal */}
      {error && slots.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Selección actual */}
      {selectedSlot && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Horario seleccionado</p>
              <p className="text-sm text-green-700 mt-0.5">
                <span className="font-semibold">{selectedSlot.horaInicio}</span> a{' '}
                <span className="font-semibold">{selectedSlot.horaFin}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calendario por períodos */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 max-h-[500px] overflow-y-auto">
        {renderPeriodo(
          'Mañana',
          manana,
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>,
          0
        )}
        
        {renderPeriodo(
          'Tarde',
          tarde,
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>,
          manana.length
        )}
        
        {renderPeriodo(
          'Noche',
          noche,
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>,
          manana.length + tarde.length
        )}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#0490C8] border-2 border-[#0490C8] rounded"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded"></div>
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded opacity-60"></div>
          <span>Tiempo insuficiente</span>
        </div>
      </div>
    </div>
  );
}

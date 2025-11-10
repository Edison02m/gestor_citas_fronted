'use client';

import { useState, useMemo, useEffect } from 'react';
import { Cita, EstadoCita } from '@/interfaces';
import { toDate, formatDateInput, formatDate } from '@/utils/format';
import CitaDetailModal from './CitaDetailModal';
import CitasService from '@/services/citas.service';

interface MiniCalendarViewProps {
  citas: Cita[];
  loading?: boolean;
  onCitaClick?: (cita: Cita) => void;
  onCitaUpdated?: () => void;
  onMonthChange?: (date: Date) => void;
  initialMonth?: Date; // Mes inicial desde el padre
}

export default function MiniCalendarView({ citas, loading = false, onCitaClick, onCitaUpdated, onMonthChange, initialMonth }: MiniCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState(initialMonth || new Date());
  const [currentMonth, setCurrentMonth] = useState(initialMonth || new Date());
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changingStatusCitaId, setChangingStatusCitaId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'calendar'>('list');
  const [localCitas, setLocalCitas] = useState<Cita[]>(citas);

  // Sincronizar citas locales con las del padre solo cuando cambian
  useEffect(() => {
    setLocalCitas(citas);
  }, [citas]);

  // Sincronizar con el mes del padre cuando cambie
  useEffect(() => {
    if (initialMonth) {
      setCurrentMonth(initialMonth);
    }
  }, [initialMonth]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileView('list');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCitaClick = (cita: Cita) => {
    setSelectedCita(cita);
    setIsModalOpen(true);
    onCitaClick?.(cita);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCita(null);
  };

  const handleStatusChange = async (citaId: string, newStatus: EstadoCita) => {
    try {
      setChangingStatusCitaId(citaId);
      
      // Actualizar estado localmente de inmediato (optimistic update)
      setLocalCitas(prevCitas => 
        prevCitas.map(cita => 
          cita.id === citaId 
            ? { ...cita, estado: newStatus }
            : cita
        )
      );
      
      // Hacer la petición al backend
      await CitasService.cambiarEstado(citaId, newStatus);
      console.log('✅ Estado de cita cambiado exitosamente');
      
      // NO llamamos onCitaUpdated para evitar recargar todo
      // onCitaUpdated?.();
    } catch (error) {
      console.error('Error al cambiar estado de la cita:', error);
      
      // Si falla, revertir el cambio local
      setLocalCitas(citas);
      
      // Aquí podrías mostrar un toast de error si tienes un sistema de notificaciones
    } finally {
      setChangingStatusCitaId(null);
    }
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    console.log(`⏩ Usuario presionó botón: ${direction === 'next' ? 'Siguiente (>)' : 'Anterior (<)'}`);
    
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      const oldMonth = prev.getMonth();
      const oldYear = prev.getFullYear();
      
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      console.log('🔄 Cambio de mes en MiniCalendarView:', {
        de: `${monthNames[oldMonth]} ${oldYear}`,
        a: `${monthNames[newDate.getMonth()]} ${newDate.getFullYear()}`,
        direccion: direction === 'next' ? 'Adelante' : 'Atrás'
      });
      
      // Notificar al padre que cambió el mes
      console.log('📢 Notificando al componente padre (page.tsx)...');
      onMonthChange?.(newDate);
      
      return newDate;
    });
  };

  // Generar días del mes
  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentMonth]);

  // Agrupar citas por fecha (usar localCitas en lugar de citas)
  const citasByDate = useMemo(() => {
    const grouped: { [key: string]: Cita[] } = {};
    localCitas.forEach(cita => {
      const date = toDate(cita.fecha);
      if (date) {
        const key = formatDateInput(date);
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(cita);
      }
    });
    return grouped;
  }, [localCitas]);

  // Obtener citas del día seleccionado
  const selectedDayCitas = useMemo(() => {
    const key = formatDateInput(selectedDate);
    return citasByDate[key] || [];
  }, [selectedDate, citasByDate]);

  // Ordenar citas por hora
  const sortedDayCitas = useMemo(() => {
    return [...selectedDayCitas].sort((a, b) => {
      return a.horaInicio.localeCompare(b.horaInicio);
    });
  }, [selectedDayCitas]);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelectedDate = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const getCitasCount = (date: Date) => {
    const key = formatDateInput(date);
    return citasByDate[key]?.length || 0;
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case EstadoCita.PENDIENTE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case EstadoCita.CONFIRMADA:
        return 'bg-green-100 text-green-800 border-green-200';
      case EstadoCita.COMPLETADA:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case EstadoCita.CANCELADA:
        return 'bg-red-100 text-red-800 border-red-200';
      case EstadoCita.NO_ASISTIO:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case EstadoCita.PENDIENTE:
        return 'Pendiente';
      case EstadoCita.CONFIRMADA:
        return 'Confirmada';
      case EstadoCita.COMPLETADA:
        return 'Completada';
      case EstadoCita.CANCELADA:
        return 'Cancelada';
      case EstadoCita.NO_ASISTIO:
        return 'No asistió';
      default:
        return estado;
    }
  };

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const calendarSection = (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full lg:w-1/3 xl:w-1/4">
      <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => changeMonth('prev')}
            aria-label="Mes anterior"
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0490C8]"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-base font-bold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={() => changeMonth('next')}
            aria-label="Mes siguiente"
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0490C8]"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {dayNames.map((name, index) => (
            <div
              key={index}
              className="text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wide sm:text-xs"
            >
              {name.substring(0, 1)}
            </div>
          ))}
        </div>
      </div>

      <div className="p-2 sm:p-3 flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {monthDays.map((day, index) => {
            const count = getCitasCount(day);
            const today = isToday(day);
            const selected = isSelectedDate(day);
            const current = isCurrentMonth(day);

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative aspect-square flex flex-col items-center justify-center
                  rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200
                  ${!current ? 'text-gray-300' : 'text-gray-700'}
                  ${today ? 'ring-2 ring-[#0490C8] ring-offset-1' : ''}
                  ${selected
                    ? 'bg-[#0490C8] text-white shadow-md hover:bg-[#037aa8]'
                    : 'hover:bg-gray-100 hover:shadow-sm'
                  }
                `}
              >
                <span className={`text-xs sm:text-sm ${selected ? 'font-bold' : ''}`}>
                  {day.getDate()}
                </span>
                {count > 0 && (
                  <span
                    className={`
                      absolute -top-1 -right-1 text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-full
                      min-w-[18px] h-[18px] flex items-center justify-center
                      ${selected
                        ? 'bg-white text-[#0490C8] border border-[#0490C8]'
                        : count <= 2
                          ? 'bg-green-500 text-white'
                          : count <= 5
                            ? 'bg-yellow-500 text-white'
                            : 'bg-red-500 text-white'
                      }
                      shadow-sm
                    `}
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <p className="text-[11px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 sm:mb-2">
          Ocupación
        </p>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-gray-600">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="font-medium">1-2 citas</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="font-medium">3-5 citas</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="font-medium">6+ citas</span>
          </div>
        </div>
      </div>
    </div>
  );

  const detailsSection = (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full lg:flex-1">
      <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex-shrink-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              {formatDate(selectedDate)}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {sortedDayCitas.length} {sortedDayCitas.length === 1 ? 'cita programada' : 'citas programadas'}
            </p>
          </div>
          {isToday(selectedDate) && (
            <span className="inline-flex w-fit bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              HOY
            </span>
          )}
        </div>
      </div>

  <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0490C8] mb-4" />
            <p className="text-sm text-gray-500">Cargando citas...</p>
          </div>
        ) : sortedDayCitas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 text-center">No hay citas programadas</h3>
            <p className="text-sm text-gray-600 text-center">Este día está disponible</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {sortedDayCitas.map((cita) => (
              <button
                key={cita.id}
                onClick={() => handleCitaClick(cita)}
                className="w-full text-left rounded-xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 bg-white overflow-hidden"
              >
                <div className="flex">
                  <div
                    className="w-1.5 flex-shrink-0"
                    style={{ backgroundColor: cita.servicio?.color || '#0490C8' }}
                  />

                  <div className="flex-1 p-3 sm:p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-900">
                        <span>{cita.horaInicio}</span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span>{cita.horaFin}</span>
                      </div>

                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={cita.estado}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(cita.id, e.target.value as EstadoCita);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={changingStatusCitaId === cita.id}
                          className={`
                            text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:py-1 rounded-full border transition-all duration-200
                            min-w-[100px] sm:min-w-[120px] text-center
                            ${getStatusColor(cita.estado)}
                            ${changingStatusCitaId === cita.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
                          `}
                        >
                          {Object.values(EstadoCita).map((estado) => (
                            <option key={estado} value={estado}>
                              {getStatusLabel(estado)}
                            </option>
                          ))}
                        </select>
                        {changingStatusCitaId === cita.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-gray-900 mt-2 mb-1.5 truncate">
                      {cita.cliente?.nombre}
                    </h4>

                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs sm:text-sm text-gray-700 font-medium truncate">
                        {cita.servicio?.nombre}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs text-gray-600">
                      {cita.empleado && (
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="truncate max-w-[140px] sm:max-w-none">{cita.empleado.nombre}</span>
                        </div>
                      )}
                    </div>

                    {cita.notas && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-[10px] sm:text-xs text-gray-500 italic line-clamp-1">
                          💬 {cita.notas}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full">
      {isMobile ? (
        <div className="flex flex-col gap-3 h-full">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-1.5 flex gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setMobileView('list')}
              className={`
                flex-1 rounded-xl py-2 text-sm font-semibold transition-all duration-200
                ${mobileView === 'list' ? 'bg-[#0490C8] text-white shadow-md' : 'bg-white text-gray-600 hover:text-gray-900'}
              `}
            >
              Citas
            </button>
            <button
              type="button"
              onClick={() => setMobileView('calendar')}
              className={`
                flex-1 rounded-xl py-2 text-sm font-semibold transition-all duration-200
                ${mobileView === 'calendar' ? 'bg-[#0490C8] text-white shadow-md' : 'bg-white text-gray-600 hover:text-gray-900'}
              `}
            >
              Calendario
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {mobileView === 'list' ? detailsSection : calendarSection}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row h-full">
          {calendarSection}
          {detailsSection}
        </div>
      )}

      <CitaDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        cita={selectedCita}
        onCitaUpdated={() => {
          console.log('🔄 Cita actualizada en modal - refracting datos...');
          onCitaUpdated?.();
          // No cerramos el modal aquí, dejamos que el modal lo maneje
        }}
      />
    </div>
  );
}

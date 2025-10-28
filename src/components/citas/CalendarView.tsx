'use client';

import { useRef, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { Cita, EstadoCita } from '@/interfaces';
import { CitasService } from '@/services/citas.service';
import { formatDateInput } from '@/utils/format';

interface CalendarViewProps {
  onCitaClick?: (cita: Cita) => void;
  onCitaUpdated?: () => void;
}

export default function CalendarView({ onCitaClick, onCitaUpdated }: CalendarViewProps) {
  const calendarRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [changingStatusCitaId, setChangingStatusCitaId] = useState<string | null>(null);

  // Función para cargar citas dinámicamente según el rango visible
  const loadEvents = useCallback(async (fetchInfo: any, successCallback: any, failureCallback: any) => {
    try {
      setLoading(true);
      
      // FullCalendar nos da las fechas exactas que necesita ver
      const startDate = fetchInfo.start;
      const endDate = fetchInfo.end;
      
      // Formatear fechas para el backend
      const fechaInicio = formatDateInput(startDate);
      const fechaFin = formatDateInput(endDate);
      
      console.log('📅 FullCalendar cargando citas:', {
        fechaInicio,
        fechaFin,
        vista: fetchInfo.view?.type,
        diasVisibles: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      });
      
      // Cargar citas del backend
      const response = await CitasService.getCitas({
        fechaInicio,
        fechaFin,
        page: 1,
        limit: 500 // Suficiente para varias semanas/meses
      });
      
      console.log('✅ Citas cargadas:', {
        total: response.data.length,
        primeraFecha: response.data[0]?.fecha || 'N/A',
        ultimaFecha: response.data[response.data.length - 1]?.fecha || 'N/A'
      });
      
      // Convertir citas a formato de eventos de FullCalendar
      const events = response.data.map(cita => {
        const startDateTime = `${cita.fecha.split('T')[0]}T${cita.horaInicio}:00`;
        const endDateTime = `${cita.fecha.split('T')[0]}T${cita.horaFin}:00`;
        
        return {
          id: cita.id.toString(),
          title: `${cita.cliente?.nombre || 'Cliente'} - ${cita.servicio?.nombre || 'Servicio'}`,
          start: startDateTime,
          end: endDateTime,
          backgroundColor: cita.servicio?.color || '#0490C8',
          borderColor: cita.servicio?.color || '#0490C8',
          textColor: '#ffffff',
          extendedProps: {
            citaData: cita,
            cliente: cita.cliente?.nombre,
            servicio: cita.servicio?.nombre,
            estado: cita.estado,
          }
        };
      });
      
      // Notificar a FullCalendar que los eventos están listos
      successCallback(events);
      
    } catch (error) {
      console.error('❌ Error cargando citas:', error);
      failureCallback(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handler para click en evento
  const handleEventClick = useCallback((clickInfo: any) => {
    const cita = clickInfo.event.extendedProps.citaData;
    if (onCitaClick && cita) {
      onCitaClick(cita);
    }
  }, [onCitaClick]);

  // Función para cambiar el estado de una cita
  const handleStatusChange = async (citaId: string, newStatus: EstadoCita) => {
    try {
      setChangingStatusCitaId(citaId);
      await CitasService.cambiarEstado(citaId, newStatus);
      
      // Refrescar el calendario
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
      
      onCitaUpdated?.();
    } catch (error) {
      console.error('Error al cambiar estado de la cita:', error);
    } finally {
      setChangingStatusCitaId(null);
    }
  };

  // Función para obtener el color del estado
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

  // Renderizado personalizado del contenido del evento
  const renderEventContent = (eventInfo: any) => {
    const cita = eventInfo.event.extendedProps.citaData;
    const isListView = eventInfo.view.type === 'listWeek';
    
    // Para vista de lista, retornar solo el contenido del título
    if (isListView) {
      return (
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {eventInfo.event.extendedProps.cliente}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {eventInfo.event.extendedProps.servicio}
            </div>
          </div>
          {cita && (
            <div 
              className="relative flex-shrink-0"
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <select
                value={cita.estado}
                onChange={(e) => {
                  handleStatusChange(cita.id, e.target.value as EstadoCita);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                disabled={changingStatusCitaId === cita.id}
                className={`
                  text-xs font-semibold px-2 py-1 rounded-full border transition-all duration-200
                  ${getStatusColor(cita.estado)}
                  ${changingStatusCitaId === cita.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
                `}
              >
                {Object.values(EstadoCita).map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
              {changingStatusCitaId === cita.id && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    // Para otras vistas (semana, día, mes)
    return (
      <div className="p-1 overflow-hidden h-full flex flex-col">
        <div className="text-xs font-semibold truncate">
          {eventInfo.timeText}
        </div>
        <div className="text-xs truncate">
          {eventInfo.event.extendedProps.cliente}
        </div>
        {eventInfo.event.extendedProps.servicio && (
          <div className="text-xs opacity-90 truncate">
            {eventInfo.event.extendedProps.servicio}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          
          // Configuración de vistas
          initialView="listWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          
          // Botones personalizados con Tailwind
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            list: 'Lista'
          }}
          
          // Configuración de idioma
          locale={esLocale}
          
          // Configuración de horarios
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          slotDuration="00:30:00"
          slotLabelInterval="01:00"
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          
          // Formato de eventos
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          
          // Configuración de días
          firstDay={1} // Lunes
          weekends={true}
          allDaySlot={false}
          
          // Altura
          height="100%"
          expandRows={true}
          
          // Eventos
          events={loadEvents}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          
          // Interactividad
          selectable={false}
          selectMirror={true}
          dayMaxEvents={true}
          
          // Estilos personalizados
          nowIndicator={true}
          eventDisplay="block"
          
          // Configuración adicional
          eventMaxStack={3}
          dayHeaderFormat={{
            weekday: 'short',
            day: 'numeric',
            omitCommas: true
          }}
        />
      </div>
    </div>
  );
}

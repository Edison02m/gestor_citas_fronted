'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { Cita, EstadoCita } from '@/interfaces';
import { CitasService } from '@/services/citas.service';
import { formatDateInput } from '@/utils/format';
import CitaDetailModal from './CitaDetailModal';

interface CalendarViewProps {
  citas?: Cita[]; // Citas pre-filtradas desde el padre
  onCitaClick?: (cita: Cita) => void;
  onCitaUpdated?: () => void;
}

export default function CalendarView({ citas: citasProp, onCitaClick, onCitaUpdated }: CalendarViewProps) {
  const calendarRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [changingStatusCitaId, setChangingStatusCitaId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localCitas, setLocalCitas] = useState<Cita[]>(citasProp || []);

  // Sincronizar citas locales con las del padre solo cuando cambian
  useEffect(() => {
    if (citasProp) {
      setLocalCitas(citasProp);
    }
  }, [citasProp]);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Función para cargar citas dinámicamente según el rango visible
  const loadEvents = useCallback(async (fetchInfo: any, successCallback: any, failureCallback: any) => {
    try {
      setLoading(true);
      
      // Si hay citas locales, usarlas (incluye las actualizadas optimísticamente)
      if (localCitas && localCitas.length > 0) {
        console.log('📦 Usando citas locales:', {
          total: localCitas.length
        });
        
        // Convertir citas a formato de eventos de FullCalendar
        const events = localCitas.map(cita => {
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
        
        successCallback(events);
        setLoading(false);
        return;
      }
      
      // Si no hay citas del padre, cargar desde el backend
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
  }, [localCitas]);

  // Handler para click en evento
  const handleEventClick = useCallback((clickInfo: any) => {
    const cita = clickInfo.event.extendedProps.citaData;
    if (cita) {
      setSelectedCita(cita);
      setIsModalOpen(true);
      onCitaClick?.(cita);
    }
  }, [onCitaClick]);

  // Función para cambiar el estado de una cita
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
      
      // Refrescar el calendario con las citas actualizadas
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
      
      // Hacer la petición al backend
      await CitasService.cambiarEstado(citaId, newStatus);
      console.log('✅ Estado de cita cambiado exitosamente');
      
      // NO llamamos onCitaUpdated para evitar recargar todo desde el padre
      // onCitaUpdated?.();
    } catch (error) {
      console.error('Error al cambiar estado de la cita:', error);
      
      // Si falla, revertir el cambio local
      if (citasProp) {
        setLocalCitas(citasProp);
      }
      
      // Refrescar calendario para mostrar el estado original
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
    } finally {
      setChangingStatusCitaId(null);
    }
  };

  // Función para obtener el color del estado - Minimalista
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case EstadoCita.PENDIENTE:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case EstadoCita.CONFIRMADA:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case EstadoCita.COMPLETADA:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case EstadoCita.CANCELADA:
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case EstadoCita.NO_ASISTIO:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Función para obtener la etiqueta del estado
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

  // Renderizado personalizado del contenido del evento
  const renderEventContent = (eventInfo: any) => {
    const cita = eventInfo.event.extendedProps.citaData;
    const isListView = eventInfo.view.type === 'listWeek';
    const isMonthView = eventInfo.view.type === 'dayGridMonth';
    
    // Para vista de lista - Diseño minimalista tipo tarjeta - RESPONSIVE
    if (isListView) {
      return (
        <div className="flex items-center justify-between w-full gap-2 md:gap-3 py-1">
          {/* Información principal */}
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            {/* Indicador de color del servicio */}
            <div 
              className="w-1 h-10 md:h-12 rounded-full flex-shrink-0"
              style={{ backgroundColor: cita?.servicio?.color || '#0490C8' }}
            />
            
            {/* Detalles de la cita */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
                <h4 className="font-bold text-gray-900 text-xs md:text-sm truncate">
                  {eventInfo.event.extendedProps.cliente}
                </h4>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-gray-600 mb-0.5 md:mb-1">
                <span className="font-medium truncate">{eventInfo.event.extendedProps.servicio}</span>
              </div>
              <div className="hidden md:flex items-center gap-3 text-xs text-gray-600">
                {cita?.empleado && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">{cita.empleado.nombre}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Estado de la cita - RESPONSIVE */}
          {cita && (
            <div 
              className="relative flex-shrink-0"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <select
                value={cita.estado}
                onChange={(e) => {
                  handleStatusChange(cita.id, e.target.value as EstadoCita);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                disabled={changingStatusCitaId === cita.id}
                className={`
                  text-[10px] md:text-xs font-semibold px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border transition-all duration-200
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
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    // Para vista de mes - mejorar visibilidad - RESPONSIVE
    if (isMonthView) {
      return (
        <div className="px-0.5 md:px-1 py-0.5 overflow-hidden h-full flex items-center gap-0.5 md:gap-1">
          <div className="text-[9px] md:text-[11px] font-bold text-white truncate drop-shadow-sm">
            {isMobile ? eventInfo.timeText.split('-')[0] : eventInfo.timeText}
          </div>
          <div className="text-[9px] md:text-[11px] font-semibold text-white truncate drop-shadow-sm">
            {eventInfo.event.extendedProps.cliente.split(' ')[0]}
          </div>
        </div>
      );
    }
    
    // Para otras vistas (semana, día) - Vista compacta con información esencial - RESPONSIVE
    // Calcular la duración del evento en minutos
    const start = new Date(eventInfo.event.start);
    const end = new Date(eventInfo.event.end);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    // Obtener nombre corto del cliente (primera palabra o iniciales)
    const clienteNombre = eventInfo.event.extendedProps.cliente || '';
    const nombreCorto = clienteNombre.split(' ')[0]; // Primera palabra
    
    return (
      <div 
        className="p-0.5 px-0.5 md:px-1 overflow-hidden h-full flex items-center gap-0.5 md:gap-1 relative group"
        title={`${eventInfo.event.extendedProps.cliente} - ${eventInfo.event.extendedProps.servicio}\n${eventInfo.timeText}\nEstado: ${getStatusLabel(cita?.estado || '')}`}
      >
        {/* Contenido visible siempre - MUY COMPACTO - RESPONSIVE */}
        <div className="flex items-center gap-0.5 md:gap-1 min-w-0 flex-1">
          <span className="text-[8px] md:text-[10px] font-bold text-white/95 drop-shadow-sm flex-shrink-0">
            {eventInfo.timeText.split('-')[0]}
          </span>
          <span className="text-[8px] md:text-[10px] font-semibold text-white truncate drop-shadow-sm">
            {nombreCorto}
          </span>
        </div>
        
        {/* Tooltip con información completa al hacer hover - Solo en desktop */}
        <div className="hidden md:block absolute left-0 top-full mt-1 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px] pointer-events-none">
          <div className="font-bold mb-1 text-sm">{eventInfo.event.extendedProps.cliente}</div>
          <div className="text-gray-300 mb-1">{eventInfo.event.extendedProps.servicio}</div>
          <div className="text-gray-400 text-[11px] mb-1">{eventInfo.timeText}</div>
          {cita && (
            <>
              <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${getStatusColor(cita.estado).replace('bg-', 'bg-opacity-20 bg-').replace('text-', 'text-').replace('border-', 'border-opacity-40 border-')}`}>
                {getStatusLabel(cita.estado)}
              </div>
              {cita.empleado && (
                <div className="text-gray-400 text-[11px] mt-1">
                  Empleado: {cita.empleado.nombre}
                </div>
              )}
              {cita.notas && (
                <div className="text-gray-400 text-[11px] mt-1 italic">
                  "{cita.notas}"
                </div>
              )}
            </>
          )}
          {/* Flecha del tooltip */}
          <div className="absolute bottom-full left-4 -mb-1 border-4 border-transparent border-b-gray-900"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Estilos personalizados para FullCalendar */}
      <style jsx global>{`
        /* ===== ESTILOS RESPONSIVE BASE ===== */
        @media (max-width: 767px) {
          /* Ajustar padding general en móvil */
          .fc {
            font-size: 0.875rem !important;
          }
        }
        
        /* ===== BOTONES DEL CALENDARIO ===== */
        /* Botones generales */
        .fc .fc-button {
          background: white !important;
          border: 2px solid #0490C8 !important;
          border-radius: 12px !important;
          padding: 8px 16px !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          color: #1f2937 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
          transition: all 0.2s ease !important;
          text-transform: capitalize !important;
        }
        
        /* Botones en móvil - más pequeños */
        @media (max-width: 767px) {
          .fc .fc-button {
            padding: 6px 12px !important;
            font-size: 0.75rem !important;
            border-radius: 8px !important;
          }
          
          .fc .fc-prev-button,
          .fc .fc-next-button {
            padding: 6px 8px !important;
            min-width: 32px !important;
          }
          
          .fc .fc-today-button {
            padding: 6px 12px !important;
          }
        }
        
        .fc .fc-button:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px rgba(4, 144, 200, 0.2) !important;
          background: #f0f9ff !important;
          border-color: #037aa8 !important;
        }
        
        .fc .fc-button:active {
          transform: translateY(0) !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }
        
        .fc .fc-button:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
          transform: none !important;
          background: #f3f4f6 !important;
          border-color: #d1d5db !important;
          color: #9ca3af !important;
        }
        
        /* Botón activo - AZUL */
        .fc .fc-button-active {
          background: linear-gradient(135deg, #0490C8 0%, #037aa8 100%) !important;
          border-color: #037aa8 !important;
          color: white !important;
          box-shadow: 0 2px 4px rgba(4, 144, 200, 0.3) !important;
        }
        
        .fc .fc-button-active:hover {
          background: linear-gradient(135deg, #037aa8 0%, #026890 100%) !important;
          border-color: #026890 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px rgba(4, 144, 200, 0.4) !important;
        }
        
        /* Grupo de botones */
        .fc .fc-button-group {
          display: flex !important;
          gap: 6px !important;
        }
        
        .fc .fc-button-group > .fc-button {
          margin: 0 !important;
        }
        
        /* Botones de navegación (prev, next, today) - mismo estilo */
        .fc .fc-prev-button,
        .fc .fc-next-button,
        .fc .fc-today-button {
          padding: 8px 12px !important;
          min-width: 40px !important;
        }
        
        /* ===== TOOLBAR (barra superior) ===== */
        .fc .fc-toolbar {
          padding: 12px 16px !important;
          background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%) !important;
          border-radius: 12px 12px 0 0 !important;
          border-bottom: 1px solid #e5e7eb !important;
          margin-bottom: 0 !important;
          gap: 10px !important;
        }
        
        /* Toolbar en móvil - más compacto */
        @media (max-width: 767px) {
          .fc .fc-toolbar {
            padding: 8px 10px !important;
            gap: 8px !important;
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          
          .fc .fc-toolbar-chunk {
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
          }
          
          /* Primera fila: navegación y título */
          .fc .fc-toolbar .fc-toolbar-chunk:nth-child(1) {
            order: 1 !important;
            flex-shrink: 0 !important;
          }
          
          .fc .fc-toolbar .fc-toolbar-chunk:nth-child(2) {
            order: 2 !important;
            flex: 1 !important;
            justify-content: center !important;
            min-width: 0 !important;
          }
          
          /* Segunda fila: selectores de vista (centrados, ancho completo) */
          .fc .fc-toolbar .fc-toolbar-chunk:nth-child(3) {
            order: 3 !important;
            width: 100% !important;
            justify-content: center !important;
            margin-top: 2px !important;
          }
          
          .fc .fc-toolbar-title {
            font-size: 0.95rem !important;
            font-weight: 700 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
        }
        
        /* Footer toolbar en móvil - para selectores de vista */
        .fc .fc-footer-toolbar {
          padding: 8px 12px !important;
          background: #f9fafb !important;
          border-top: 1px solid #e5e7eb !important;
          border-radius: 0 0 12px 12px !important;
        }
        
        @media (max-width: 767px) {
          .fc .fc-footer-toolbar {
            display: none !important;
          }
        }
        
        .fc .fc-toolbar-chunk {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        
        /* Título del calendario */
        .fc .fc-toolbar-title {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          color: #111827 !important;
          letter-spacing: -0.02em !important;
        }
        
        /* ===== CONTENIDO DEL CALENDARIO ===== */
        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: #e5e7eb !important;
        }
        
        .fc-theme-standard .fc-scrollgrid {
          border-color: #e5e7eb !important;
          border-radius: 0 0 12px 12px !important;
          overflow: hidden !important;
        }
        
        /* Headers de días */
        .fc .fc-col-header-cell {
          background: #f9fafb !important;
          padding: 12px 8px !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          color: #374151 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        
        /* Headers más compactos en móvil */
        @media (max-width: 767px) {
          .fc .fc-col-header-cell {
            padding: 8px 4px !important;
            font-size: 0.7rem !important;
          }
        }
        
        /* Celdas de día */
        .fc .fc-daygrid-day {
          transition: background-color 0.2s ease !important;
        }
        
        .fc .fc-daygrid-day:hover {
          background-color: #f9fafb !important;
        }
        
        .fc .fc-daygrid-day-number {
          padding: 8px !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          color: #111827 !important;
        }
        
        /* Números de día en móvil */
        @media (max-width: 767px) {
          .fc .fc-daygrid-day-number {
            padding: 4px !important;
            font-size: 0.75rem !important;
          }
        }
        
        /* Día de hoy */
        .fc .fc-day-today {
          background-color: rgba(4, 144, 200, 0.05) !important;
        }
        
        .fc .fc-day-today .fc-daygrid-day-number {
          background: linear-gradient(135deg, #0490C8 0%, #037aa8 100%) !important;
          color: white !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          display: inline-block !important;
        }
        
        /* ===== EVENTOS ===== */
        .fc-event {
          border-radius: 6px !important;
          border: none !important;
          padding: 2px 4px !important;
          margin: 1px 2px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        
        /* Eventos más pequeños en móvil */
        @media (max-width: 767px) {
          .fc-event {
            border-radius: 4px !important;
            padding: 1px 3px !important;
            margin: 0.5px 1px !important;
            font-size: 0.7rem !important;
          }
        }
        
        .fc-event:hover {
          opacity: 0.9 !important;
          transform: scale(1.02) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* Deshabilitar hover en móvil (evitar problemas táctiles) */
        @media (max-width: 767px) {
          .fc-event:hover {
            transform: none !important;
          }
        }
        
        /* ===== MÁS EVENTOS ===== */
        .fc-daygrid-more-link {
          color: #1f2937 !important;
          font-weight: 600 !important;
          font-size: 0.75rem !important;
        }
        
        .fc-daygrid-more-link:hover {
          color: #0490C8 !important;
          text-decoration: underline !important;
        }
        
        /* ===== VISTA DE LISTA - MINIMALISTA ===== */
        /* Contenedor principal de la lista */
        .fc-list {
          border: none !important;
        }
        
        /* Tabla de la lista */
        .fc-list-table {
          border: none !important;
        }
        
        /* Header de fecha en lista */
        .fc-list-day-cushion {
          background: #f9fafb !important;
          padding: 10px 14px !important;
          border: none !important;
          border-bottom: 1px solid #e5e7eb !important;
        }
        
        /* Header más compacto en móvil */
        @media (max-width: 767px) {
          .fc-list-day-cushion {
            padding: 6px 10px !important;
          }
        }
        
        .fc-list-day-text {
          font-size: 0.875rem !important;
          font-weight: 700 !important;
          color: #111827 !important;
          text-transform: capitalize !important;
        }
        
        @media (max-width: 767px) {
          .fc-list-day-text {
            font-size: 0.8rem !important;
          }
        }
        
        .fc-list-day-side-text {
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          color: #6b7280 !important;
          text-transform: uppercase !important;
        }
        
        @media (max-width: 767px) {
          .fc-list-day-side-text {
            font-size: 0.7rem !important;
          }
        }
        
        /* Filas de eventos en lista */
        .fc-list-event {
          border: none !important;
          border-bottom: 1px solid #f3f4f6 !important;
          transition: all 0.2s ease !important;
        }
        
        .fc-list-event:hover {
          background: #f9fafb !important;
        }
        
        .fc-list-event:hover td {
          background: transparent !important;
        }
        
        /* Celda de hora */
        .fc-list-event-time {
          padding: 12px 14px !important;
          width: 100px !important;
          font-size: 0.875rem !important;
          font-weight: 700 !important;
          color: #374151 !important;
        }
        
        /* Celda de hora más compacta en móvil */
        @media (max-width: 767px) {
          .fc-list-event-time {
            padding: 10px 8px !important;
            width: 70px !important;
            font-size: 0.75rem !important;
          }
        }
        
        /* Ocultar punto de color del servicio (solo mostrar barra lateral) */
        .fc-list-event-dot {
          display: none !important;
        }
        
        /* Título del evento */
        .fc-list-event-title {
          padding: 12px 14px 12px 0 !important;
        }
        
        @media (max-width: 767px) {
          .fc-list-event-title {
            padding: 10px 8px 10px 0 !important;
          }
        }
        
        /* Mensaje cuando no hay eventos */
        .fc-list-empty {
          background: white !important;
          padding: 60px 20px !important;
          text-align: center !important;
        }
        
        .fc-list-empty-cushion {
          font-size: 0.875rem !important;
          color: #6b7280 !important;
          font-weight: 500 !important;
        }
        
        /* Estilos del popover - Más compacto y moderno */
        .fc-popover {
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          overflow: visible !important;
          min-width: 200px !important;
          max-width: 220px !important;
          z-index: 100 !important;
          max-height: 200px !important;
          display: flex !important;
          flex-direction: column !important;
        }
        
        /* Popover en móvil - pantalla completa o casi */
        @media (max-width: 767px) {
          .fc-popover {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            min-width: 90vw !important;
            max-width: 90vw !important;
            max-height: 70vh !important;
          }
        }
        
        .fc-popover-header {
          background: #f9fafb !important;
          padding: 8px 12px !important;
          border-bottom: 1px solid #e5e7eb !important;
          flex-shrink: 0 !important;
          border-radius: 12px 12px 0 0 !important;
        }
        
        .fc-popover-title {
          color: #111827 !important;
          font-weight: 700 !important;
          font-size: 0.75rem !important;
          letter-spacing: 0.2px !important;
        }
        
        .fc-popover-close {
          color: #6b7280 !important;
          font-size: 1rem !important;
          opacity: 0.8 !important;
          width: 20px !important;
          height: 20px !important;
          border-radius: 6px !important;
          transition: all 0.2s !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .fc-popover-close:hover {
          opacity: 1 !important;
          background-color: #e5e7eb !important;
        }
        
        .fc-popover-body {
          padding: 6px !important;
          max-height: 140px !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          background-color: #ffffff !important;
          flex: 1 1 auto !important;
          border-radius: 0 0 12px 12px !important;
        }
        
        /* Mejorar los eventos dentro del popover - Más compactos */
        .fc-popover .fc-event {
          margin-bottom: 4px !important;
          border-radius: 8px !important;
          padding: 6px 8px !important;
          font-size: 0.75rem !important;
          border: none !important;
          cursor: pointer !important;
          transition: all 0.15s ease !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
          /* Mantener el color del evento original */
        }
        
        .fc-popover .fc-event:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
          opacity: 0.95 !important;
        }
        
        .fc-popover .fc-event:last-child {
          margin-bottom: 0 !important;
        }
        
        .fc-popover .fc-event-main {
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          flex-wrap: wrap !important;
        }
        
        .fc-popover .fc-event-title {
          font-weight: 600 !important;
          color: white !important;
          font-size: 0.75rem !important;
          line-height: 1.3 !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
        }
        
        .fc-popover .fc-event-time {
          font-weight: 700 !important;
          color: white !important;
          font-size: 0.7rem !important;
          flex-shrink: 0 !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
        }
        
        /* Scrollbar personalizado para el popover - Más delgado */
        .fc-popover-body::-webkit-scrollbar {
          width: 3px !important;
        }
        
        .fc-popover-body::-webkit-scrollbar-track {
          background: #f3f4f6 !important;
          border-radius: 2px !important;
        }
        
        .fc-popover-body::-webkit-scrollbar-thumb {
          background: #d1d5db !important;
          border-radius: 2px !important;
        }
        
        .fc-popover-body::-webkit-scrollbar-thumb:hover {
          background: #9ca3af !important;
        }
        
        /* ===== VISTAS DE TIEMPO (Semana/Día) - RESPONSIVE ===== */
        /* Columna de horas */
        .fc .fc-timegrid-axis {
          width: 50px !important;
        }
        
        @media (max-width: 767px) {
          .fc .fc-timegrid-axis {
            width: 35px !important;
          }
        }
        
        /* Etiquetas de tiempo */
        .fc .fc-timegrid-slot-label {
          font-size: 0.75rem !important;
          padding: 2px !important;
        }
        
        @media (max-width: 767px) {
          .fc .fc-timegrid-slot-label {
            font-size: 0.65rem !important;
            padding: 1px !important;
          }
        }
        
        /* Slots de tiempo */
        .fc .fc-timegrid-slot {
          height: 2em !important;
        }
        
        @media (max-width: 767px) {
          .fc .fc-timegrid-slot {
            height: 1.5em !important;
          }
        }
        
        /* Línea de tiempo actual */
        .fc .fc-timegrid-now-indicator-line {
          border-color: #0490C8 !important;
          border-width: 2px !important;
        }
        
        .fc .fc-timegrid-now-indicator-arrow {
          border-color: #0490C8 !important;
        }
        
        /* ===== AJUSTES GENERALES MÓVIL ===== */
        @media (max-width: 767px) {
          /* Reducir padding general */
          .fc-view-harness {
            padding: 0 !important;
          }
          
          /* Scrollbar más delgado en móvil */
          .fc-scroller::-webkit-scrollbar {
            width: 4px !important;
            height: 4px !important;
          }
          
          .fc-scroller::-webkit-scrollbar-track {
            background: #f3f4f6 !important;
          }
          
          .fc-scroller::-webkit-scrollbar-thumb {
            background: #d1d5db !important;
            border-radius: 2px !important;
          }
        }
      `}</style>
      
      <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          
          // Configuración de vistas - RESPONSIVE
          initialView={isMobile ? "listWeek" : "listWeek"}
          headerToolbar={isMobile ? {
            left: 'prev,next,today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek,timeGridDay'
          } : {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          
          // Sin footer en móvil
          footerToolbar={undefined}
          
          // Botones personalizados - RESPONSIVE
          buttonText={{
            today: isMobile ? 'Hoy' : 'Hoy',
            month: isMobile ? 'Mes' : 'Mes',
            week: isMobile ? 'Sem' : 'Semana',
            day: isMobile ? 'Día' : 'Día',
            list: isMobile ? 'Lista' : 'Lista'
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
          dayMaxEvents={isMobile ? 2 : 4} // Menos eventos en móvil antes de "+X más"
          moreLinkClick="popover" // En móvil usar popover en lugar de cambiar vista
          
          // Estilos personalizados
          nowIndicator={true}
          eventDisplay="block"
          
          // Configuración adicional - RESPONSIVE
          dayHeaderFormat={isMobile ? {
            weekday: 'narrow', // Solo inicial en móvil (L, M, X...)
            omitCommas: true
          } : {
            weekday: 'short',
            day: 'numeric',
            omitCommas: true
          }}
          
          // Ajustes de vista responsivos
          views={{
            dayGridMonth: {
              dayMaxEvents: isMobile ? 2 : 4,
              eventLimit: isMobile ? 2 : 4,
            },
            timeGridWeek: {
              dayHeaderFormat: isMobile ? { weekday: 'narrow' } : { weekday: 'short', day: 'numeric' },
              slotLabelFormat: isMobile ? {
                hour: 'numeric',
                minute: '2-digit',
                hour12: false
              } : {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }
            },
            timeGridDay: {
              slotLabelFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }
            }
          }}
        />
      </div>

      {/* Modal de Detalle de Cita */}
      <CitaDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCita(null);
        }}
        cita={selectedCita}
        onCitaUpdated={() => {
          console.log('🔄 Cita actualizada en CalendarView - refrescando eventos...');
          // Refrescar los eventos del calendario
          if (calendarRef.current) {
            calendarRef.current.getApi().refetchEvents();
          }
          onCitaUpdated?.();
        }}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CrearCitaModal from '@/components/citas/CrearCitaModal';
import CalendarView from '@/components/citas/CalendarView';
import MiniCalendarView from '@/components/citas/MiniCalendarView';
import CitaDetailModal from '@/components/citas/CitaDetailModal';
import { CitasService } from '@/services/citas.service';
import { Cita, CreateCitaDto, EstadoCita } from '@/interfaces';
import { format, formatDateInput } from '@/utils/format';

type ViewMode = 'calendar' | 'mini' | 'table';

export default function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    console.log('🔥 useEffect disparado - currentMonth cambió a:', {
      mes: `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`,
      timestamp: new Date().toLocaleTimeString()
    });
    console.log('⏳ Llamando a loadCitas()...');
    loadCitas();
  }, [currentMonth]);

  const loadCitas = async () => {
    try {
      setLoading(true);
      
      // Usar currentMonth en lugar de la fecha actual
      // Esto permite cargar citas del mes seleccionado en el calendario
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      console.log('📅 Estado actual de currentMonth:', {
        fecha: currentMonth.toLocaleDateString('es-ES'),
        año: year,
        mes: month + 1, // +1 para mostrar mes humano-readable
        mesNombre: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][month]
      });
      
      // Inicio del mes - usando fechas locales
      const startOfMonth = new Date(year, month, 1);
      
      // Fin del mes - usando fechas locales
      const endOfMonth = new Date(year, month + 1, 0);
      
      // Formatear fechas para enviar al backend (YYYY-MM-DD en hora local)
      const fechaInicio = formatDateInput(startOfMonth);
      const fechaFin = formatDateInput(endOfMonth);
      
      console.log('🚀 Enviando petición al backend:', {
        fechaInicio,
        fechaFin,
        totalDiasEnMes: endOfMonth.getDate(),
        params: {
          fechaInicio,
          fechaFin,
          page: 1,
          limit: 200
        }
      });
      
      const response = await CitasService.getCitas({
        fechaInicio,
        fechaFin,
        page: 1,
        limit: 200 // Suficiente para un mes completo
      });
      
      console.log('✅ Respuesta del backend recibida:', {
        totalCitas: response.data.length,
        primeraFecha: response.data[0]?.fecha || 'N/A',
        ultimaFecha: response.data[response.data.length - 1]?.fecha || 'N/A'
      });
      
      setCitas(response.data);
    } catch (error) {
      console.error('❌ Error al cargar citas:', error);
      setErrorMessage('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCita = async (data: CreateCitaDto) => {
    try {
      setSubmitting(true);
      const nuevaCita = await CitasService.createCita(data);
      setCitas([nuevaCita, ...citas]);
      setIsModalOpen(false);
      setSuccessMessage('Cita creada exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      // Re-lanzar el error completo para que el modal pueda acceder a response.data.message
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const getEstadoColor = (estado: EstadoCita) => {
    const colors = {
      [EstadoCita.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
      [EstadoCita.CONFIRMADA]: 'bg-blue-100 text-blue-800',
      [EstadoCita.COMPLETADA]: 'bg-green-100 text-green-800',
      [EstadoCita.CANCELADA]: 'bg-red-100 text-red-800',
      [EstadoCita.NO_ASISTIO]: 'bg-gray-100 text-gray-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoLabel = (estado: EstadoCita) => {
    const labels = {
      [EstadoCita.PENDIENTE]: 'Pendiente',
      [EstadoCita.CONFIRMADA]: 'Confirmada',
      [EstadoCita.COMPLETADA]: 'Completada',
      [EstadoCita.CANCELADA]: 'Cancelada',
      [EstadoCita.NO_ASISTIO]: 'No Asistió',
    };
    return labels[estado] || estado;
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Citas</h1>
            <p className="text-sm text-gray-600 mt-1">Gestiona todas las citas de tu negocio</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Toggle Vista */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('mini')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'mini'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Vista compacta"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span className="hidden md:inline">Compacta</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Vista de calendario"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden md:inline">Calendario</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Vista de tabla"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden md:inline">Tabla</span>
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-[#0490C8] text-white text-sm font-medium rounded-xl hover:bg-[#037aa8] transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Cita
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {errorMessage}
          </div>
        )}

        {/* Content */}
        {viewMode === 'mini' ? (
          /* Vista Compacta - Mini Calendario + Detalle */
          <div className="h-[calc(100vh-200px)]">
            <MiniCalendarView 
              citas={citas}
              loading={loading}
              initialMonth={currentMonth}
              onCitaClick={(cita) => {
                console.log('Cita seleccionada:', cita);
              }}
              onCitaUpdated={loadCitas}
              onMonthChange={(newMonth) => {
                const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                console.log('📥 page.tsx recibió notificación de cambio de mes:', {
                  mesAnterior: `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`,
                  mesNuevo: `${monthNames[newMonth.getMonth()]} ${newMonth.getFullYear()}`
                });
                console.log('🔄 Actualizando currentMonth state...');
                setCurrentMonth(newMonth);
                console.log('✅ State actualizado - esto disparará useEffect que llamará loadCitas()');
              }}
            />
          </div>
        ) : loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0490C8] mx-auto"></div>
              <p className="text-sm text-gray-500 mt-4">Cargando citas...</p>
            </div>
          </div>
        ) : citas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas registradas</h3>
            <p className="text-sm text-gray-500 mb-4">Comienza creando tu primera cita</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#0490C8] text-white text-sm font-medium rounded-xl hover:bg-[#037aa8] transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Primera Cita
            </button>
          </div>
        ) : viewMode === 'calendar' ? (
          /* Vista de Calendario con FullCalendar */
          <div className="h-[calc(100vh-180px)]">
            <CalendarView 
              onCitaClick={(cita) => {
                setSelectedCita(cita);
                setIsDetailModalOpen(true);
              }}
              onCitaUpdated={loadCitas}
            />
          </div>
        ) : (
          /* Vista de Tabla */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sucursal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {citas.map((cita) => (
                    <tr key={cita.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {format.date(cita.fecha)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cita.horaInicio} - {cita.horaFin}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {cita.cliente?.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cita.cliente?.telefono}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {cita.servicio?.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cita.servicio?.duracion} min
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {cita.empleado?.nombre || '-'}
                        </div>
                        {cita.empleado && (
                          <div className="text-sm text-gray-500">
                            {cita.empleado.cargo}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {cita.sucursal?.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(cita.estado)}`}>
                          {getEstadoLabel(cita.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {format.currency(cita.precioTotal)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <CrearCitaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCita}
        loading={submitting}
      />

      {/* Modal de Detalle de Cita */}
      <CitaDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCita(null);
        }}
        cita={selectedCita}
        onCitaUpdated={loadCitas}
      />
    </DashboardLayout>
  );
}

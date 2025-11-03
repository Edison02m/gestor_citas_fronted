'use client';

import { useState, useEffect } from 'react';
import { CreateCitaDto, Cliente, Servicio, Empleado, Sucursal, CanalOrigen, Cita, CreateClienteDto } from '@/interfaces';
import { ClientesService } from '@/services/clientes.service';
import { ServiciosService } from '@/services/servicios.service';
import { EmpleadosService } from '@/services/empleados.service';
import { SucursalesService } from '@/services/sucursales.service';
import { CitasService } from '@/services/citas.service';
import SelectorSemana from './SelectorSemana';
import { formatDateInput } from '@/utils/format';
import ClienteModal from '@/components/clientes/ClienteModal';

interface CrearCitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCitaDto) => Promise<void>;
  loading?: boolean;
}

export default function CrearCitaModal({ isOpen, onClose, onSubmit, loading }: CrearCitaModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // Paso 1: Selección básica, Paso 2: Fecha y hora, Paso 3: Confirmación
  
  const [formData, setFormData] = useState<CreateCitaDto>({
    fecha: '',
    horaInicio: '',
    horaFin: '',
    clienteId: '',
    servicioId: '',
    empleadoId: '',
    sucursalId: '',
    notas: '',
    canalOrigen: CanalOrigen.MANUAL
  });

  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [citasOcupadas, setCitasOcupadas] = useState<Cita[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  
  const [loadingData, setLoadingData] = useState(false);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [errors, setErrors] = useState<string>('');

  // Modal de crear cliente
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [loadingCliente, setLoadingCliente] = useState(false);

  // Estados para búsqueda en selectores
  const [clienteSearch, setClienteSearch] = useState('');
  const [servicioSearch, setServicioSearch] = useState('');
  const [sucursalSearch, setSucursalSearch] = useState('');
  const [empleadoSearch, setEmpleadoSearch] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [showServicioDropdown, setShowServicioDropdown] = useState(false);
  const [showSucursalDropdown, setShowSucursalDropdown] = useState(false);
  const [showEmpleadoDropdown, setShowEmpleadoDropdown] = useState(false);

  // Cargar datos iniciales y seleccionar fecha actual
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      resetForm();
      // Auto-seleccionar la fecha actual
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      setFechaSeleccionada(hoy);
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [clientesData, serviciosData, empleadosData, sucursalesData] = await Promise.all([
        ClientesService.getClientes(1, 1000),
        ServiciosService.getServicios(),
        EmpleadosService.getEmpleados(1, 1000),
        SucursalesService.getSucursales()
      ]);

      setClientes(clientesData.clientes);
      setServicios(serviciosData.filter((s: Servicio) => s.estado === 'ACTIVO'));
      setEmpleados(empleadosData.data.empleados.filter((e: Empleado) => e.estado === 'ACTIVO'));
      setSucursales(sucursalesData.filter((s: Sucursal) => s.estado === 'ACTIVA'));

      // Auto-seleccionar sucursal si hay solo una
      const sucursalesActivas = sucursalesData.filter((s: Sucursal) => s.estado === 'ACTIVA');
      if (sucursalesActivas.length === 1) {
        setFormData(prev => ({ ...prev, sucursalId: sucursalesActivas[0].id }));
      }

      // Auto-seleccionar empleado si hay solo uno
      const empleadosActivos = empleadosData.data.empleados.filter((e: Empleado) => e.estado === 'ACTIVO');
      if (empleadosActivos.length === 1) {
        setFormData(prev => ({ ...prev, empleadoId: empleadosActivos[0].id }));
      }

    } catch (error) {
      // Log removido
      setErrors('Error al cargar los datos necesarios');
    } finally {
      setLoadingData(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fecha: '',
      horaInicio: '',
      horaFin: '',
      clienteId: '',
      servicioId: '',
      empleadoId: '',
      sucursalId: '',
      notas: '',
      canalOrigen: CanalOrigen.MANUAL
    });
    setFechaSeleccionada(null);
    setStep(1);
    setErrors('');
    setCitasOcupadas([]);
    // Resetear búsquedas
    setClienteSearch('');
    setServicioSearch('');
    setSucursalSearch('');
    setEmpleadoSearch('');
    setShowClienteDropdown(false);
    setShowServicioDropdown(false);
    setShowSucursalDropdown(false);
    setShowEmpleadoDropdown(false);
  };

  // Funciones de filtrado para búsqueda
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    cliente.cedula.includes(clienteSearch) ||
    (cliente.telefono && cliente.telefono.includes(clienteSearch)) ||
    (cliente.email && cliente.email.toLowerCase().includes(clienteSearch.toLowerCase()))
  );

  const serviciosFiltrados = servicios.filter(servicio => {
    // Filtrar por búsqueda de texto
    const matchesSearch = servicio.nombre.toLowerCase().includes(servicioSearch.toLowerCase());
    
    // Si no hay sucursal seleccionada, mostrar todos los servicios que coincidan con la búsqueda
    if (!formData.sucursalId) {
      return matchesSearch;
    }
    
    // Si hay sucursal seleccionada, solo mostrar servicios disponibles en esa sucursal
    const estáEnSucursal = servicio.sucursales?.some(
      ss => ss.sucursalId === formData.sucursalId && ss.disponible
    );
    
    return matchesSearch && estáEnSucursal;
  });

  const sucursalesFiltradas = sucursales.filter(sucursal =>
    sucursal.nombre.toLowerCase().includes(sucursalSearch.toLowerCase()) ||
    sucursal.direccion.toLowerCase().includes(sucursalSearch.toLowerCase())
  );

  const empleadosFiltrados = empleados.filter(empleado => {
    // Filtrar por búsqueda de texto
    const matchesSearch = empleado.nombre.toLowerCase().includes(empleadoSearch.toLowerCase()) ||
      empleado.cargo.toLowerCase().includes(empleadoSearch.toLowerCase());
    
    // Si no hay sucursal seleccionada, mostrar todos los empleados que coincidan con la búsqueda
    if (!formData.sucursalId) {
      return matchesSearch;
    }
    
    // Si hay sucursal seleccionada, solo mostrar empleados asignados a esa sucursal
    const estáEnSucursal = empleado.sucursales?.some(
      es => es.sucursalId === formData.sucursalId
    );
    
    return matchesSearch && estáEnSucursal;
  });

  // Funciones para manejar selección
  const handleClienteSelect = (cliente: Cliente) => {
    setFormData(prev => ({ ...prev, clienteId: cliente.id }));
    setClienteSearch(cliente.nombre);
    setShowClienteDropdown(false);
  };

  const handleServicioSelect = (servicio: Servicio) => {
    setFormData(prev => ({ ...prev, servicioId: servicio.id }));
    setServicioSearch(servicio.nombre);
    setShowServicioDropdown(false);
  };

  const handleSucursalSelect = (sucursal: Sucursal) => {
    setFormData(prev => ({ ...prev, sucursalId: sucursal.id }));
    setSucursalSearch(sucursal.nombre);
    setShowSucursalDropdown(false);
  };

  const handleEmpleadoSelect = (empleado: Empleado) => {
    setFormData(prev => ({ ...prev, empleadoId: empleado.id }));
    setEmpleadoSearch(empleado.nombre);
    setShowEmpleadoDropdown(false);
  };

  // Función para crear nuevo cliente
  const handleCrearCliente = async (data: CreateClienteDto | any) => {
    try {
      setLoadingCliente(true);
      const nuevoCliente = await ClientesService.createCliente(data as CreateClienteDto);
      
      // Agregar el nuevo cliente a la lista
      setClientes(prev => [nuevoCliente, ...prev]);
      
      // Auto-seleccionar el nuevo cliente
      setFormData(prev => ({ ...prev, clienteId: nuevoCliente.id }));
      setClienteSearch(nuevoCliente.nombre);
      
      // Cerrar el modal
      setShowClienteModal(false);
    } catch (error: any) {
      throw error;
    } finally {
      setLoadingCliente(false);
    }
  };

  // Actualizar formData.fecha cuando se selecciona una fecha
  useEffect(() => {
    if (fechaSeleccionada) {
      const fechaFormateada = formatDateInput(fechaSeleccionada);
      setFormData(prev => ({
        ...prev,
        fecha: fechaFormateada
      }));
    }
  }, [fechaSeleccionada]);

  // Resetear servicio seleccionado cuando cambia la sucursal
  useEffect(() => {
    if (formData.sucursalId && formData.servicioId) {
      // Verificar si el servicio actual está disponible en la nueva sucursal
      const servicioActual = servicios.find(s => s.id === formData.servicioId);
      const estáDisponible = servicioActual?.sucursales?.some(
        ss => ss.sucursalId === formData.sucursalId && ss.disponible
      );
      
      // Si el servicio no está disponible en la nueva sucursal, limpiarlo
      if (!estáDisponible) {
        setFormData(prev => ({ ...prev, servicioId: '' }));
        setServicioSearch('');
      }
    }
  }, [formData.sucursalId]);

  // Resetear empleado seleccionado cuando cambia la sucursal
  useEffect(() => {
    if (formData.sucursalId && formData.empleadoId) {
      // Verificar si el empleado actual está asignado a la nueva sucursal
      const empleadoActual = empleados.find(e => e.id === formData.empleadoId);
      const estáEnSucursal = empleadoActual?.sucursales?.some(
        es => es.sucursalId === formData.sucursalId
      );
      
      // Si el empleado no está en la nueva sucursal, limpiarlo
      if (!estáEnSucursal) {
        setFormData(prev => ({ ...prev, empleadoId: '' }));
        setEmpleadoSearch('');
      }
    }
  }, [formData.sucursalId]);

  // Cuando cambia la fecha seleccionada o los datos necesarios, calcular horarios disponibles
  useEffect(() => {
    if (fechaSeleccionada && formData.empleadoId && formData.sucursalId && formData.servicioId) {
      calcularHorariosDisponibles();
    } else {
      setHorariosDisponibles([]);
      setCitasOcupadas([]);
    }
  }, [fechaSeleccionada, formData.empleadoId, formData.sucursalId, formData.servicioId]);

  const calcularHorariosDisponibles = async () => {
    if (!fechaSeleccionada || !formData.empleadoId || !formData.sucursalId || !formData.servicioId) return;

    try {
      setLoadingCitas(true);
      const fechaStr = formatDateInput(fechaSeleccionada);
      
      // Obtener las citas del empleado en esa fecha
      const citas = await CitasService.getCitas({
        fechaInicio: fechaStr,
        fechaFin: fechaStr,
        empleadoId: formData.empleadoId,
        sucursalId: formData.sucursalId
      });

      // Filtrar solo las citas no canceladas
      const citasActivas = citas.data.filter((c: Cita) => c.estado !== 'CANCELADA');
      setCitasOcupadas(citasActivas);

      // Obtener el servicio seleccionado para saber la duración
      const servicio = servicios.find(s => s.id === formData.servicioId);
      if (!servicio) return;

      // Obtener la sucursal y empleado completos
      const sucursal = sucursales.find(s => s.id === formData.sucursalId);
      const empleado = empleados.find(e => e.id === formData.empleadoId);
      if (!sucursal || !empleado) return;

      // Obtener el día de la semana (0 = domingo, 6 = sábado)
      const diaSemana = fechaSeleccionada.getDay();

      // Log removido
      // Log removido
      console.log('Día de la semana (0=domingo, 6=sábado):', diaSemana);
      // Log removido
      // Log removido
      // Log removido
      // Log removido

      // Buscar el horario de la sucursal para ese día
      const horarioSucursal = sucursal.horarios?.find(h => h.diaSemana === diaSemana && h.abierto);
      if (!horarioSucursal) {
      // Log removido
        setHorariosDisponibles([]);
        return;
      }

      // Log removido

      // Buscar el horario del empleado para ese día
      const horarioEmpleado = empleado.horarios?.find(h => h.diaSemana === diaSemana);
      if (!horarioEmpleado) {
      // Log removido
        setHorariosDisponibles([]);
        return;
      }

      // Log removido

      // Verificar que los horarios tengan valores válidos
      if (!horarioSucursal.horaApertura || !horarioSucursal.horaCierre || 
          !horarioEmpleado.horaInicio || !horarioEmpleado.horaFin) {
      // Log removido
      // Log removido
      // Log removido
        setHorariosDisponibles([]);
        return;
      }

      // Determinar el horario efectivo (el más restrictivo)
      const horaInicio = horarioSucursal.horaApertura > horarioEmpleado.horaInicio 
        ? horarioSucursal.horaApertura 
        : horarioEmpleado.horaInicio;
      
      const horaFin = horarioSucursal.horaCierre < horarioEmpleado.horaFin 
        ? horarioSucursal.horaCierre 
        : horarioEmpleado.horaFin;

      // Log removido
      console.log('Inicio:', horaInicio, '(sucursal:', horarioSucursal.horaApertura, ', empleado:', horarioEmpleado.horaInicio, ')');
      console.log('Fin:', horaFin, '(sucursal:', horarioSucursal.horaCierre, ', empleado:', horarioEmpleado.horaFin, ')');

      // Generar todos los horarios posibles cada 15 minutos
      const horarios = generarHorariosPosibles(horaInicio, horaFin, servicio.duracion, citasActivas, horarioSucursal, horarioEmpleado);
      // Log removido
      setHorariosDisponibles(horarios);

    } catch (error) {
      // Log removido
      setHorariosDisponibles([]);
    } finally {
      setLoadingCitas(false);
    }
  };

  const generarHorariosPosibles = (
    horaInicio: string, 
    horaFin: string, 
    duracion: number, 
    citasOcupadas: Cita[],
    horarioSucursal: any,
    horarioEmpleado: any
  ): string[] => {
    const horarios: string[] = [];
    const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = horaFin.split(':').map(Number);

    let minutoActual = horaInicioH * 60 + horaInicioM;
    const minutoFinal = horaFinH * 60 + horaFinM;

    while (minutoActual + duracion <= minutoFinal) {
      const hora = Math.floor(minutoActual / 60);
      const minuto = minutoActual % 60;
      const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
      
      const horaFinCita = minutoActual + duracion;
      const horaFinCitaStr = `${Math.floor(horaFinCita / 60).toString().padStart(2, '0')}:${(horaFinCita % 60).toString().padStart(2, '0')}`;

      // Verificar si está disponible
      if (estaDisponible(horaStr, horaFinCitaStr, citasOcupadas, horarioSucursal, horarioEmpleado)) {
        horarios.push(horaStr);
      }

      minutoActual += 15; // Intervalos de 15 minutos
    }

    return horarios;
  };

  const estaDisponible = (
    horaInicio: string, 
    horaFin: string, 
    citasOcupadas: Cita[],
    horarioSucursal: any,
    horarioEmpleado: any
  ): boolean => {
      // Log removido
    
    // Verificar conflicto con citas existentes
    const citaConflicto = citasOcupadas.find(cita => {
      const citaInicio = cita.horaInicio;
      const citaFin = cita.horaFin;
      const hayConflicto = (
        (horaInicio >= citaInicio && horaInicio < citaFin) ||
        (horaFin > citaInicio && horaFin <= citaFin) ||
        (horaInicio <= citaInicio && horaFin >= citaFin)
      );
      if (hayConflicto) {
      // Log removido
      }
      return hayConflicto;
    });

    if (citaConflicto) {
      // Log removido
      return false;
    }

    // Verificar conflicto con descanso de sucursal
    if (horarioSucursal.tieneDescanso) {
      const descansoInicio = horarioSucursal.descansoInicio;
      const descansoFin = horarioSucursal.descansoFin;
      const enDescansoSucursal = (
        (horaInicio >= descansoInicio && horaInicio < descansoFin) ||
        (horaFin > descansoInicio && horaFin <= descansoFin) ||
        (horaInicio <= descansoInicio && horaFin >= descansoFin)
      );
      if (enDescansoSucursal) {
      // Log removido
      // Log removido
        return false;
      }
    }

    // Verificar conflicto con descanso de empleado
    if (horarioEmpleado.tieneDescanso) {
      const descansoInicio = horarioEmpleado.descansoInicio;
      const descansoFin = horarioEmpleado.descansoFin;
      const enDescansoEmpleado = (
        (horaInicio >= descansoInicio && horaInicio < descansoFin) ||
        (horaFin > descansoInicio && horaFin <= descansoFin) ||
        (horaInicio <= descansoInicio && horaFin >= descansoFin)
      );
      if (enDescansoEmpleado) {
      // Log removido
      // Log removido
        return false;
      }
    }

      // Log removido
    return true;
  };

  const handleStep1Next = () => {
    setErrors('');

    // Validar cliente
    if (!formData.clienteId) {
      setErrors('Debes seleccionar un cliente');
      return;
    }

    // Validar servicio
    if (!formData.servicioId) {
      setErrors('Debes seleccionar un servicio');
      return;
    }

    // Validar sucursal
    if (!formData.sucursalId) {
      setErrors('Debes seleccionar una sucursal');
      return;
    }

    // Validar empleado (obligatorio si hay más de 1)
    if (empleados.length > 1 && !formData.empleadoId) {
      setErrors('Debes seleccionar un empleado');
      return;
    }

    if (empleados.length === 0) {
      setErrors('No hay empleados activos disponibles');
      return;
    }

    setStep(2);
  };

  const handleStep2Next = () => {
    setErrors('');

    // Validar hora
    if (!formData.horaInicio) {
      setErrors('Debes ingresar la hora de inicio');
      return;
    }

    // Validar hora de fin
    if (!formData.horaFin) {
      setErrors('Debes ingresar la hora de fin');
      return;
    }

    // Verificar que no haya conflicto
    if (hayConflicto) {
      setErrors('El horario seleccionado tiene conflictos con otra cita');
      return;
    }

    setStep(3);
  };

  const handleFinalSubmit = async () => {
    setErrors('');

    try {
      // Crear el objeto con la fecha formateada en el momento del submit
      const dataToSubmit: CreateCitaDto = {
        ...formData,
        fecha: formatDateInput(fechaSeleccionada!),
      };
      
      console.log('Fecha seleccionada (Date object):', fechaSeleccionada);
      console.log('Fecha formateada (string):', dataToSubmit.fecha);
      
      await onSubmit(dataToSubmit);
      resetForm();
    } catch (error: any) {
      // Intentar extraer el mensaje de error de múltiples ubicaciones posibles
      let errorMessage = 'Error al crear la cita';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors(errorMessage);
    }
  };

  const calcularHoraFin = (horaInicio: string, duracion: number): string => {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracion;
    const nuevasHoras = Math.floor(totalMinutos / 60);
    const nuevosMinutos = totalMinutos % 60;
    return `${nuevasHoras.toString().padStart(2, '0')}:${nuevosMinutos.toString().padStart(2, '0')}`;
  };

  // Cuando se selecciona hora de inicio, calcular hora de fin automáticamente
  const handleHoraInicioChange = (hora: string) => {
    setFormData(prev => ({ ...prev, horaInicio: hora }));
    
    if (hora && formData.servicioId) {
      const servicio = servicios.find(s => s.id === formData.servicioId);
      if (servicio) {
        const horaFin = calcularHoraFin(hora, servicio.duracion);
        setFormData(prev => ({ ...prev, horaFin }));
      }
    }
  };

  const verificarConflicto = (horaInicio: string, horaFin: string): boolean => {
    if (!horaInicio || !horaFin) return false;

    return citasOcupadas.some(cita => {
      const citaInicio = cita.horaInicio;
      const citaFin = cita.horaFin;

      // Verificar solapamiento
      return (
        (horaInicio >= citaInicio && horaInicio < citaFin) ||
        (horaFin > citaInicio && horaFin <= citaFin) ||
        (horaInicio <= citaInicio && horaFin >= citaFin)
      );
    });
  };

  const hayConflicto = verificarConflicto(formData.horaInicio, formData.horaFin);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full shadow-xl overflow-hidden flex flex-col" style={{ maxWidth: step === 2 ? '950px' : '520px', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Nueva Cita</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Paso {step} de 3: {step === 1 ? 'Información básica' : step === 2 ? 'Fecha y hora' : 'Confirmar y crear'}
            </p>
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

        {/* Form */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className={`flex-1 overflow-y-auto ${step === 1 ? 'px-8 py-4' : 'px-5 py-3'}`}>
            {step === 1 ? (
              /* ==================== PASO 1: Información Básica ==================== */
              <div className="space-y-3">
                {/* Cliente */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={clienteSearch}
                      onChange={(e) => {
                        setClienteSearch(e.target.value);
                        setShowClienteDropdown(true);
                      }}
                      onFocus={() => setShowClienteDropdown(true)}
                      onBlur={() => setTimeout(() => setShowClienteDropdown(false), 200)}
                      placeholder="Buscar cliente por nombre, cédula, teléfono o email..."
                      className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 pr-10"
                      disabled={loadingData}
                      autoComplete="off"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Dropdown */}
                  {showClienteDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col">
                      {/* Botón crear nuevo cliente */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowClienteModal(true);
                          setShowClienteDropdown(false);
                        }}
                        className="w-full px-3 py-2.5 text-left bg-[#0490C8] hover:bg-[#023664] text-white font-medium transition-colors flex items-center gap-2 border-b border-[#023664]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm">Crear nuevo cliente</span>
                      </button>

                      {/* Lista de clientes */}
                      <div className="overflow-y-auto max-h-48">
                        {clientesFiltrados.length > 0 ? (
                          clientesFiltrados.map(cliente => (
                            <button
                              key={cliente.id}
                              type="button"
                              onClick={() => handleClienteSelect(cliente)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
                              <div className="text-xs text-gray-500">
                                {cliente.cedula}
                                {cliente.telefono && ` • ${cliente.telefono}`}
                                {cliente.email && ` • ${cliente.email}`}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            No se encontraron clientes
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sucursal (solo si hay más de 1) */}
                {sucursales.length > 1 && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Sucursal <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={sucursalSearch}
                        onChange={(e) => {
                          setSucursalSearch(e.target.value);
                          setShowSucursalDropdown(true);
                        }}
                        onFocus={() => setShowSucursalDropdown(true)}
                        onBlur={() => setTimeout(() => setShowSucursalDropdown(false), 200)}
                        placeholder="Buscar sucursal..."
                        className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 pr-10"
                        disabled={loadingData}
                        autoComplete="off"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Dropdown */}
                    {showSucursalDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {sucursalesFiltradas.length > 0 ? (
                          sucursalesFiltradas.map(sucursal => (
                            <button
                              key={sucursal.id}
                              type="button"
                              onClick={() => handleSucursalSelect(sucursal)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="text-sm font-medium text-gray-900">{sucursal.nombre}</div>
                              <div className="text-xs text-gray-500">{sucursal.direccion}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            No se encontraron sucursales
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Servicio */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Servicio <span className="text-red-500">*</span>
                    {!formData.sucursalId && sucursales.length > 1 && (
                      <span className="text-xs text-gray-500 ml-1">(Selecciona primero una sucursal)</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={servicioSearch}
                      onChange={(e) => {
                        setServicioSearch(e.target.value);
                        setShowServicioDropdown(true);
                      }}
                      onFocus={() => setShowServicioDropdown(true)}
                      onBlur={() => setTimeout(() => setShowServicioDropdown(false), 200)}
                      placeholder="Buscar servicio..."
                      className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 pr-10"
                      disabled={loadingData}
                      autoComplete="off"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Dropdown */}
                  {showServicioDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {serviciosFiltrados.length > 0 ? (
                        serviciosFiltrados.map(servicio => (
                          <button
                            key={servicio.id}
                            type="button"
                            onClick={() => handleServicioSelect(servicio)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                          >
                            <div className="text-sm font-medium text-gray-900">{servicio.nombre}</div>
                            <div className="text-xs text-gray-500">
                              {servicio.duracion}min • ${servicio.precio}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                          {!formData.sucursalId && sucursales.length > 1 
                            ? 'Selecciona una sucursal primero' 
                            : 'No se encontraron servicios'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Empleado (mostrar solo si hay empleados) */}
                {empleados.length > 0 && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Empleado {empleados.length > 1 && <span className="text-red-500">*</span>}
                      {empleados.length === 1 && <span className="text-gray-500 text-xs ml-1">(Auto-seleccionado)</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={empleadoSearch}
                        onChange={(e) => {
                          setEmpleadoSearch(e.target.value);
                          setShowEmpleadoDropdown(true);
                        }}
                        onFocus={() => setShowEmpleadoDropdown(true)}
                        onBlur={() => setTimeout(() => setShowEmpleadoDropdown(false), 200)}
                        placeholder="Buscar empleado..."
                        className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 disabled:bg-gray-50 pr-10"
                        disabled={loadingData || empleados.length === 1}
                        autoComplete="off"
                        required={empleados.length > 1}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Dropdown */}
                    {showEmpleadoDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {empleadosFiltrados.length > 0 ? (
                          empleadosFiltrados.map(empleado => (
                            <button
                              key={empleado.id}
                              type="button"
                              onClick={() => handleEmpleadoSelect(empleado)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="text-sm font-medium text-gray-900">{empleado.nombre}</div>
                              <div className="text-xs text-gray-500">{empleado.cargo}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            No se encontraron empleados
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 resize-none"
                    rows={2}
                    placeholder="Información adicional sobre la cita..."
                    disabled={loadingData}
                  />
                </div>
              </div>
            ) : step === 2 ? (
              /* ==================== PASO 2: Fecha y Hora ==================== */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna Izquierda: Selector de Día */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Selecciona el día <span className="text-red-500">*</span>
                    </label>
                    <SelectorSemana
                      onSelectFecha={setFechaSeleccionada}
                      fechaSeleccionada={fechaSeleccionada}
                    />
                  </div>

                  {/* Selección de Hora */}
                  {fechaSeleccionada && (
                    <div className="bg-gray-50 rounded-xl p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Hora de inicio <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            value={formData.horaInicio}
                            onChange={(e) => handleHoraInicioChange(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Hora de fin <span className="text-gray-500 text-[10px]">(Auto)</span>
                          </label>
                          <input
                            type="time"
                            value={formData.horaFin}
                            readOnly
                            className="w-full px-3 py-1.5 text-sm text-gray-900 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed"
                            required
                          />
                        </div>
                      </div>

                      {/* Alerta de conflicto */}
                      {hayConflicto && formData.horaInicio && formData.horaFin && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                          <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-xs font-semibold text-red-700">Conflicto de horario</p>
                            <p className="text-[10px] text-red-600 mt-0.5">El empleado ya tiene una cita en este horario</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Columna Derecha: Horarios Disponibles */}
                {fechaSeleccionada && formData.servicioId && (
                  <div className="space-y-3">
                    {loadingCitas ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#0490C8]"></div>
                      </div>
                    ) : horariosDisponibles.length > 0 ? (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Horarios disponibles ({horariosDisponibles.length} espacios)
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 max-h-[400px] overflow-y-auto pr-1">
                          {horariosDisponibles.map((hora, index) => {
                            const servicio = servicios.find(s => s.id === formData.servicioId);
                            const duracion = servicio?.duracion || 0;
                            const [h, m] = hora.split(':').map(Number);
                            const minutosFin = h * 60 + m + duracion;
                            const horaFin = `${Math.floor(minutosFin / 60).toString().padStart(2, '0')}:${(minutosFin % 60).toString().padStart(2, '0')}`;
                            const esSeleccionado = formData.horaInicio === hora;

                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleHoraInicioChange(hora)}
                                className={`
                                  p-2 rounded-xl border transition-all text-center
                                  ${esSeleccionado 
                                    ? 'bg-[#0490C8] border-[#0490C8] text-white shadow-md' 
                                    : 'bg-white border-gray-200 text-gray-700 hover:border-[#0490C8] hover:bg-blue-50'
                                  }
                                `}
                              >
                                <div className="text-xs font-semibold">{hora}</div>
                                <div className="text-[9px] opacity-75 mt-0.5">
                                  {duracion}min
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 text-center space-y-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {!formData.servicioId 
                              ? 'Selecciona un servicio' 
                              : 'No hay horarios disponibles'}
                          </p>
                          {formData.servicioId && (
                            <p className="text-xs text-gray-500">
                              El empleado/sucursal no tiene espacios libres este día
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* ==================== PASO 3: Resumen y Confirmación ==================== */
              <div className="space-y-4">
                {/* Título del resumen */}
                <div className="text-center pb-2">
                  <h3 className="text-sm font-bold text-gray-900">Confirma los detalles de la cita</h3>
                  <p className="text-xs text-gray-500 mt-1">Revisa que toda la información sea correcta</p>
                </div>

                {/* Resumen de la cita - Grid de 2 columnas */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {/* Cliente */}
                  <div className="flex items-start gap-2.5 pb-3 border-b border-gray-200">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">Cliente</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {clientes.find(c => c.id === formData.clienteId)?.nombre}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {clientes.find(c => c.id === formData.clienteId)?.telefono}
                      </p>
                    </div>
                  </div>

                  {/* Servicio */}
                  <div className="flex items-start gap-2.5 pb-3 border-b border-gray-200">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">Servicio</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {servicios.find(s => s.id === formData.servicioId)?.nombre}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {servicios.find(s => s.id === formData.servicioId)?.duracion} min • ${servicios.find(s => s.id === formData.servicioId)?.precio}
                      </p>
                    </div>
                  </div>

                  {/* Sucursal */}
                  <div className="flex items-start gap-2.5 pb-3 border-b border-gray-200">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">Sucursal</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {sucursales.find(s => s.id === formData.sucursalId)?.nombre}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5 truncate">
                        {sucursales.find(s => s.id === formData.sucursalId)?.direccion}
                      </p>
                    </div>
                  </div>

                  {/* Empleado */}
                  <div className="flex items-start gap-2.5 pb-3 border-b border-gray-200">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">Empleado</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {empleados.find(e => e.id === formData.empleadoId)?.nombre}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {empleados.find(e => e.id === formData.empleadoId)?.cargo}
                      </p>
                    </div>
                  </div>

                  {/* Fecha y Hora */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">Fecha y Hora</p>
                      <p className="text-sm font-medium text-gray-900">
                        {fechaSeleccionada?.toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          day: 'numeric',
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {formData.horaInicio} - {formData.horaFin}
                      </p>
                    </div>
                  </div>

                  {/* Notas (si existen) */}
                  {formData.notas && (
                    <div className="flex items-start gap-2.5 pt-3 border-t border-gray-200">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">Notas</p>
                        <p className="text-xs text-gray-700">{formData.notas}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-5 py-3 bg-white flex-shrink-0">
            {/* Error */}
            {errors && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-xl text-xs mb-2">
                {errors}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {(step === 2 || step === 3) && (
                <button
                  type="button"
                  onClick={() => setStep(step === 2 ? 1 : 2)}
                  disabled={loading}
                  className="px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 text-xs"
                >
                  ← Atrás
                </button>
              )}
              
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 text-xs"
              >
                Cancelar
              </button>

              {step === 1 ? (
                <button
                  type="button"
                  onClick={handleStep1Next}
                  disabled={loadingData}
                  className="flex-1 px-3 py-2 bg-[#0490C8] hover:bg-[#023664] text-white font-medium rounded-xl transition-all disabled:opacity-50 text-xs"
                >
                  Siguiente →
                </button>
              ) : step === 2 ? (
                <button
                  type="button"
                  onClick={handleStep2Next}
                  disabled={loadingData || !formData.horaInicio || !formData.horaFin || hayConflicto}
                  className="flex-1 px-3 py-2 bg-[#0490C8] hover:bg-[#023664] text-white font-medium rounded-xl transition-all disabled:opacity-50 text-xs"
                >
                  Continuar →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirmar y Crear Cita
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear nuevo cliente */}
      <ClienteModal
        isOpen={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onSubmit={handleCrearCliente}
        loading={loadingCliente}
      />
    </div>
  );
}

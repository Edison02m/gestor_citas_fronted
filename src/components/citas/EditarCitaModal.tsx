'use client';

import { useState, useEffect } from 'react';
import { Cita, UpdateCitaDto, Cliente, Servicio, Empleado, Sucursal, EstadoCita } from '@/interfaces';
import { ClientesService } from '@/services/clientes.service';
import { ServiciosService } from '@/services/servicios.service';
import { EmpleadosService } from '@/services/empleados.service';
import { SucursalesService } from '@/services/sucursales.service';
import { CitasService } from '@/services/citas.service';
import { formatDateInput, toDate } from '@/utils/format';
import SelectorSemana from './SelectorSemana';

interface EditarCitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cita: Cita | null;
  onSuccess: () => void;
}

export default function EditarCitaModal({ isOpen, onClose, cita, onSuccess }: EditarCitaModalProps) {
  const [formData, setFormData] = useState<UpdateCitaDto>({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [citasOcupadas, setCitasOcupadas] = useState<Cita[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && cita) {
      loadInitialData();
      // Inicializar con los datos de la cita actual
      const fechaCita = toDate(cita.fecha) || new Date();
      setFechaSeleccionada(fechaCita);
      const initialFormData = {
        fecha: formatDateInput(fechaCita),
        horaInicio: cita.horaInicio,
        horaFin: cita.horaFin,
        servicioId: cita.servicio?.id,
        empleadoId: cita.empleado?.id || undefined,
        sucursalId: cita.sucursal?.id,
        estado: cita.estado,
        notas: cita.notas || '',
      };
      
      console.log('🔄 EDITAR CITA - Inicializando formulario con:', initialFormData);
      console.log('Cita original completa:', cita);
      
      setFormData(initialFormData);
    }
  }, [isOpen, cita]);

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
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos necesarios');
    } finally {
      setLoadingData(false);
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

  // Calcular horarios disponibles cuando cambian los datos relevantes
  // Si NO hay empleados (0), permitir continuar sin validar empleadoId
  // En este caso, el dueño del negocio atenderá la cita
  useEffect(() => {
    if (fechaSeleccionada && formData.sucursalId && formData.servicioId) {
      // Si hay empleados, requerir que uno esté seleccionado
      if (empleados.length > 0 && !formData.empleadoId) {
        setHorariosDisponibles([]);
        setCitasOcupadas([]);
        return;
      }
      
      calcularHorariosDisponibles();
    } else {
      setHorariosDisponibles([]);
      setCitasOcupadas([]);
    }
  }, [fechaSeleccionada, formData.empleadoId, formData.sucursalId, formData.servicioId]);

  // Recalcular horarios cuando se cargan los datos (servicios, empleados, sucursales)
  useEffect(() => {
    if (!loadingData && fechaSeleccionada && formData.sucursalId && formData.servicioId) {
      // Si hay empleados, requerir que uno esté seleccionado
      if (empleados.length > 0 && !formData.empleadoId) {
        return;
      }
      calcularHorariosDisponibles();
    }
  }, [loadingData]);

  // Limpiar servicio si no está disponible en la sucursal seleccionada
  useEffect(() => {
    if (formData.sucursalId && formData.servicioId && servicios.length > 0) {
      const servicioActual = servicios.find(s => s.id === formData.servicioId);
      const estáDisponible = servicioActual?.sucursales?.some(
        ss => ss.sucursalId === formData.sucursalId && ss.disponible
      );
      
      if (!estáDisponible) {
        console.log('⚠️ EDITAR CITA - Servicio no disponible en sucursal, limpiando...');
        setFormData(prev => ({ ...prev, servicioId: undefined, horaInicio: '', horaFin: '' }));
      }
    }
  }, [formData.sucursalId, servicios]);

  // Limpiar empleado si no está asignado a la sucursal seleccionada
  useEffect(() => {
    if (formData.sucursalId && formData.empleadoId && empleados.length > 0) {
      const empleadoActual = empleados.find(e => e.id === formData.empleadoId);
      const estáAsignado = empleadoActual?.sucursales?.some(
        es => es.sucursalId === formData.sucursalId
      );
      
      if (!estáAsignado) {
        console.log('⚠️ EDITAR CITA - Empleado no asignado a sucursal, limpiando...');
        setFormData(prev => ({ ...prev, empleadoId: undefined, horaInicio: '', horaFin: '' }));
      }
    }
  }, [formData.sucursalId, empleados]);

  const calcularHorariosDisponibles = async () => {
    if (!fechaSeleccionada || !formData.sucursalId || !formData.servicioId) return;

    try {
      setLoadingCitas(true);
      const fechaStr = formatDateInput(fechaSeleccionada);
      
      // Obtener el servicio seleccionado para saber la duración
      const servicio = servicios.find(s => s.id === formData.servicioId);
      if (!servicio) return;

      // Obtener la sucursal completa
      const sucursal = sucursales.find(s => s.id === formData.sucursalId);
      if (!sucursal) return;

      // Obtener el día de la semana (0 = domingo, 6 = sábado)
      const diaSemana = fechaSeleccionada.getDay();

      console.log('🏢 EDITAR CITA - Día de la semana (0=domingo, 6=sábado):', diaSemana);

      // Buscar el horario de la sucursal para ese día
      const horarioSucursal = sucursal.horarios?.find(h => h.diaSemana === diaSemana && h.abierto);
      if (!horarioSucursal) {
        setHorariosDisponibles([]);
        return;
      }

      // Si NO hay empleados registrados, usar solo el horario de la sucursal
      if (empleados.length === 0 || !formData.empleadoId) {
        console.log('⚠️ EDITAR CITA - Sin empleados, usando solo horario de sucursal');
        
        // Verificar que el horario de la sucursal tenga valores válidos
        if (!horarioSucursal.horaApertura || !horarioSucursal.horaCierre) {
          setHorariosDisponibles([]);
          return;
        }

        // ✅ IMPORTANTE: Consultar citas de la sucursal (sin filtrar por empleado)
        // El dueño atiende todas las citas, así que debemos evitar conflictos
        const citasData = await CitasService.getCitas({
          fechaInicio: fechaStr,
          fechaFin: fechaStr,
          sucursalId: formData.sucursalId
          // NO incluir empleadoId - queremos TODAS las citas de la sucursal
        });

        // Filtrar solo las citas no canceladas y excluir la cita actual
        const citasActivas = citasData.data.filter((c: Cita) => 
          c.estado !== 'CANCELADA' && c.id !== cita?.id
        );
        setCitasOcupadas(citasActivas);

        const horaInicio = horarioSucursal.horaApertura;
        const horaFin = horarioSucursal.horaCierre;

        console.log('Horario de sucursal - Inicio:', horaInicio, 'Fin:', horaFin);
        console.log('Citas ocupadas en sucursal:', citasActivas.length);

        // Generar horarios usando el horario de la sucursal
        // Validar contra todas las citas existentes (el dueño atiende todo)
        const horarios = generarHorariosPosibles(
          horaInicio, 
          horaFin, 
          servicio.duracion, 
          citasActivas, // ✅ Validar contra citas existentes
          horarioSucursal,
          null // Sin horario de empleado específico
        );
        setHorariosDisponibles(horarios);
        return;
      }

      // Si HAY empleados, continuar con la lógica normal
      // Obtener las citas del empleado en esa fecha
      const citasData = await CitasService.getCitas({
        fechaInicio: fechaStr,
        fechaFin: fechaStr,
        empleadoId: formData.empleadoId,
        sucursalId: formData.sucursalId
      });

      // Filtrar citas no canceladas y excluir la cita actual
      const citasActivas = citasData.data.filter((c: Cita) => 
        c.estado !== 'CANCELADA' && c.id !== cita?.id
      );
      setCitasOcupadas(citasActivas);

      // Obtener el empleado completo
      const empleado = empleados.find(e => e.id === formData.empleadoId);
      if (!empleado) return;

      console.log('🏢 EDITAR CITA - INFORMACIÓN DE SUCURSAL Y EMPLEADO:');
      console.log('Fecha seleccionada:', fechaSeleccionada);
      console.log('Día de la semana (0=domingo, 6=sábado):', diaSemana);
      console.log('Sucursal seleccionada:', sucursal.nombre);
      console.log('Horarios de la sucursal:', sucursal.horarios);
      console.log('Empleado seleccionado:', empleado.nombre);
      console.log('Horarios del empleado:', empleado.horarios);
      console.log('✅ EDITAR CITA - Horario de sucursal encontrado:', horarioSucursal);

      // Buscar el horario del empleado para ese día
      const horarioEmpleado = empleado.horarios?.find(h => h.diaSemana === diaSemana);
      if (!horarioEmpleado) {
        console.warn('⚠️ EDITAR CITA - No se encontró horario de empleado para el día', diaSemana);
        setHorariosDisponibles([]);
        return;
      }

      console.log('✅ EDITAR CITA - Horario de empleado encontrado:', horarioEmpleado);

      // Verificar que los horarios tengan valores válidos
      if (!horarioSucursal.horaApertura || !horarioSucursal.horaCierre || 
          !horarioEmpleado.horaInicio || !horarioEmpleado.horaFin) {
        console.error('❌ EDITAR CITA - Horarios inválidos o incompletos');
        console.error('Sucursal - Apertura:', horarioSucursal.horaApertura, 'Cierre:', horarioSucursal.horaCierre);
        console.error('Empleado - Inicio:', horarioEmpleado.horaInicio, 'Fin:', horarioEmpleado.horaFin);
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

      console.log('⏰ EDITAR CITA - Horario efectivo calculado:');
      console.log('Inicio:', horaInicio, '(sucursal:', horarioSucursal.horaApertura, ', empleado:', horarioEmpleado.horaInicio, ')');
      console.log('Fin:', horaFin, '(sucursal:', horarioSucursal.horaCierre, ', empleado:', horarioEmpleado.horaFin, ')');

      // Generar todos los horarios posibles cada 15 minutos
      const horarios = generarHorariosPosibles(horaInicio, horaFin, servicio.duracion, citasActivas, horarioSucursal, horarioEmpleado);
      console.log('📋 EDITAR CITA - Horarios disponibles generados:', horarios.length, 'espacios');
      setHorariosDisponibles(horarios);

    } catch (error) {
      console.error('Error al calcular horarios disponibles:', error);
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
    horarioEmpleado: any | null
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
    horarioEmpleado: any | null
  ): boolean => {
    console.log(`\n🔍 EDITAR - Verificando disponibilidad para ${horaInicio} - ${horaFin}`);
    
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
        console.log(`❌ Conflicto con cita existente: ${citaInicio} - ${citaFin}`);
      }
      return hayConflicto;
    });

    if (citaConflicto) {
      console.log(`   ❌ RECHAZADO: Hay cita ocupada`);
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
        console.log(`❌ Conflicto con descanso de sucursal: ${descansoInicio} - ${descansoFin}`);
        console.log(`   ❌ RECHAZADO: En horario de descanso de sucursal`);
        return false;
      }
    }

    // Verificar conflicto con descanso de empleado (solo si hay horarioEmpleado)
    if (horarioEmpleado && horarioEmpleado.tieneDescanso) {
      const descansoInicio = horarioEmpleado.descansoInicio;
      const descansoFin = horarioEmpleado.descansoFin;
      const enDescansoEmpleado = (
        (horaInicio >= descansoInicio && horaInicio < descansoFin) ||
        (horaFin > descansoInicio && horaFin <= descansoFin) ||
        (horaInicio <= descansoInicio && horaFin >= descansoFin)
      );
      if (enDescansoEmpleado) {
        console.log(`❌ Conflicto con descanso de empleado: ${descansoInicio} - ${descansoFin}`);
        console.log(`   ❌ RECHAZADO: En horario de descanso de empleado`);
        return false;
      }
    }

    console.log(`   ✅ DISPONIBLE`);
    return true;
  };

  const calcularHoraFin = (horaInicio: string, duracion: number): string => {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracion;
    const nuevasHoras = Math.floor(totalMinutos / 60);
    const nuevosMinutos = totalMinutos % 60;
    return `${nuevasHoras.toString().padStart(2, '0')}:${nuevosMinutos.toString().padStart(2, '0')}`;
  };

  const handleHoraInicioChange = (hora: string) => {
    console.log('⏰ Cambiando hora de inicio a:', hora);
    
    if (hora && formData.servicioId) {
      const servicio = servicios.find(s => s.id === formData.servicioId);
      if (servicio) {
        const horaFin = calcularHoraFin(hora, servicio.duracion);
        console.log('✅ Hora de fin calculada:', horaFin, '(duración:', servicio.duracion, 'min)');
        setFormData(prev => ({ ...prev, horaInicio: hora, horaFin }));
      } else {
        console.warn('⚠️ No se encontró el servicio con ID:', formData.servicioId);
        setFormData(prev => ({ ...prev, horaInicio: hora }));
      }
    } else {
      console.warn('⚠️ Falta hora o servicioId:', { hora, servicioId: formData.servicioId });
      setFormData(prev => ({ ...prev, horaInicio: hora }));
    }
  };

  const verificarConflicto = (horaInicio: string, horaFin: string): boolean => {
    if (!horaInicio || !horaFin) return false;

    return citasOcupadas.some(citaOcupada => {
      const citaInicio = citaOcupada.horaInicio;
      const citaFin = citaOcupada.horaFin;

      // Verificar solapamiento
      return (
        (horaInicio >= citaInicio && horaInicio < citaFin) ||
        (horaFin > citaInicio && horaFin <= citaFin) ||
        (horaInicio <= citaInicio && horaFin >= citaFin)
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cita) return;

    setError('');

    // Validar hora
    if (!formData.horaInicio) {
      setError('Debes ingresar la hora de inicio');
      return;
    }

    // Validar hora de fin
    if (!formData.horaFin) {
      setError('Debes ingresar la hora de fin');
      return;
    }

    setLoading(true);

    try {
      // Solo enviar los campos que han sido modificados
      const dataToUpdate: UpdateCitaDto = {};
      
      // Comparar fecha (convertir la fecha de la cita a formato string para comparar)
      const fechaOriginal = formatDateInput(toDate(cita.fecha) || new Date());
      if (formData.fecha && formData.fecha !== fechaOriginal) {
        dataToUpdate.fecha = formData.fecha;
        console.log('📅 Fecha cambió:', fechaOriginal, '→', formData.fecha);
      }
      
      // Comparar horas (ya son strings)
      if (formData.horaInicio && formData.horaInicio !== cita.horaInicio) {
        dataToUpdate.horaInicio = formData.horaInicio;
        console.log('⏰ Hora inicio cambió:', cita.horaInicio, '→', formData.horaInicio);
      }
      if (formData.horaFin && formData.horaFin !== cita.horaFin) {
        dataToUpdate.horaFin = formData.horaFin;
        console.log('⏰ Hora fin cambió:', cita.horaFin, '→', formData.horaFin);
      }
      
      // Comparar servicio
      if (formData.servicioId && formData.servicioId !== cita.servicio?.id) {
        dataToUpdate.servicioId = formData.servicioId;
        console.log('🔧 Servicio cambió:', cita.servicio?.id, '→', formData.servicioId);
      }
      
      // Comparar empleado (puede ser undefined)
      if (formData.empleadoId !== cita.empleado?.id) {
        dataToUpdate.empleadoId = formData.empleadoId;
        console.log('👤 Empleado cambió:', cita.empleado?.id, '→', formData.empleadoId);
      }
      
      // Comparar sucursal
      if (formData.sucursalId && formData.sucursalId !== cita.sucursal?.id) {
        dataToUpdate.sucursalId = formData.sucursalId;
        console.log('🏢 Sucursal cambió:', cita.sucursal?.id, '→', formData.sucursalId);
      }
      
      // Comparar estado
      if (formData.estado && formData.estado !== cita.estado) {
        dataToUpdate.estado = formData.estado;
        console.log('🔄 Estado cambió:', cita.estado, '→', formData.estado);
      }
      
      // Comparar notas
      const notasOriginal = cita.notas || '';
      const notasNuevas = formData.notas || '';
      if (notasNuevas !== notasOriginal) {
        dataToUpdate.notas = formData.notas;
        console.log('📝 Notas cambió:', notasOriginal, '→', notasNuevas);
      }

      console.log('📝 EDITAR CITA - DATOS A ENVIAR AL BACKEND:');
      console.log('ID de la cita:', cita.id);
      console.log('Datos originales de la cita:', {
        fecha: cita.fecha,
        horaInicio: cita.horaInicio,
        horaFin: cita.horaFin,
        servicioId: cita.servicio?.id,
        empleadoId: cita.empleado?.id,
        sucursalId: cita.sucursal?.id,
        notas: cita.notas
      });
      console.log('Datos actualizados (solo campos modificados):', dataToUpdate);
      console.log('FormData completo:', formData);
      console.log('Fecha seleccionada (Date object):', fechaSeleccionada);
      console.log('Fecha formateada:', formData.fecha);
      console.log('¿Objeto vacío?', Object.keys(dataToUpdate).length === 0);
      
      if (Object.keys(dataToUpdate).length === 0) {
        console.warn('⚠️ No hay cambios para actualizar');
        onSuccess();
        onClose();
        return;
      }

      await CitasService.updateCita(cita.id, dataToUpdate);
      onSuccess();
      onClose();
    } catch (error: any) {
      // Log completo del error para debug
      console.error('❌ ERROR AL ACTUALIZAR CITA:');
      console.error('Error completo:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      
      // Intentar extraer el mensaje de error
      let errorMessage = 'Error al actualizar la cita';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Mensaje de error mostrado al usuario:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoLabel = (estado: string) => {
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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case EstadoCita.PENDIENTE:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case EstadoCita.CONFIRMADA:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case EstadoCita.COMPLETADA:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case EstadoCita.CANCELADA:
        return 'bg-red-50 text-red-700 border-red-200';
      case EstadoCita.NO_ASISTIO:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!isOpen || !cita) return null;

  // Filtrar servicios por sucursal seleccionada
  const serviciosFiltrados = servicios.filter(servicio => {
    // Si no hay sucursal seleccionada, mostrar todos los servicios
    if (!formData.sucursalId) {
      return true;
    }
    
    // Si hay sucursal seleccionada, solo mostrar servicios disponibles en esa sucursal
    return servicio.sucursales?.some(
      ss => ss.sucursalId === formData.sucursalId && ss.disponible
    );
  });

  // Filtrar empleados por sucursal seleccionada
  const empleadosFiltrados = empleados.filter(empleado => {
    // Si no hay sucursal seleccionada, mostrar todos los empleados
    if (!formData.sucursalId) {
      return true;
    }
    
    // Si hay sucursal seleccionada, solo mostrar empleados asignados a esa sucursal
    return empleado.sucursales?.some(
      es => es.sucursalId === formData.sucursalId
    );
  });

  const hayConflicto = verificarConflicto(formData.horaInicio || '', formData.horaFin || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-2xl w-full shadow-xl overflow-hidden flex flex-col" style={{ maxWidth: '950px', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Editar Cita</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Cliente: {cita.cliente?.nombre}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-3">
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#0490C8]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna Izquierda: Información Básica */}
                <div className="space-y-3">
                  {/* Grid 2 columnas para Servicio y Sucursal */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Servicio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        Servicio <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.servicioId || ''}
                        onChange={(e) => {
                          const nuevoServicioId = e.target.value;
                          setFormData({ ...formData, servicioId: nuevoServicioId });
                          
                          // Recalcular hora de fin si hay hora de inicio y servicio seleccionado
                          if (formData.horaInicio && nuevoServicioId) {
                            const servicio = servicios.find(s => s.id === nuevoServicioId);
                            if (servicio) {
                              const nuevaHoraFin = calcularHoraFin(formData.horaInicio, servicio.duracion);
                              setFormData(prev => ({ ...prev, servicioId: nuevoServicioId, horaFin: nuevaHoraFin }));
                            }
                          }
                        }}
                        className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20"
                        disabled={loadingData}
                        required
                      >
                        <option value="">Seleccionar servicio...</option>
                        {serviciosFiltrados.map(servicio => (
                          <option key={servicio.id} value={servicio.id}>
                            {servicio.nombre} - {servicio.duracion}min - ${servicio.precio}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sucursal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        Sucursal <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.sucursalId || ''}
                        onChange={(e) => setFormData({ ...formData, sucursalId: e.target.value })}
                        className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20"
                        disabled={loadingData}
                        required
                      >
                        <option value="">Seleccionar sucursal...</option>
                        {sucursales.map(sucursal => (
                          <option key={sucursal.id} value={sucursal.id}>
                            {sucursal.nombre} - {sucursal.direccion}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Grid 2 columnas para Empleado y Estado */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Empleado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        Empleado {empleadosFiltrados.length === 0 && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        value={formData.empleadoId || ''}
                        onChange={(e) => setFormData({ ...formData, empleadoId: e.target.value || undefined })}
                        className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20"
                        disabled={loadingData}
                      >
                        <option value="">Sin asignar</option>
                        {empleadosFiltrados.map(empleado => (
                          <option key={empleado.id} value={empleado.id}>
                            {empleado.nombre} - {empleado.cargo}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        Estado <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.estado || ''}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoCita })}
                        className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20"
                        required
                      >
                        {Object.values(EstadoCita).map((estado) => (
                          <option key={estado} value={estado}>
                            {getEstadoLabel(estado)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selector de Fecha */}
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
                            value={formData.horaInicio || ''}
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
                            value={formData.horaFin || ''}
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

                  {/* Notas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      value={formData.notas || ''}
                      onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                      className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 resize-none"
                      rows={2}
                      placeholder="Información adicional sobre la cita..."
                      disabled={loadingData}
                    />
                  </div>
                </div>

                {/* Columna Derecha: Horarios Disponibles */}
                <div className="space-y-3">
                  {fechaSeleccionada && formData.servicioId ? (
                    loadingCitas ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#0490C8]"></div>
                      </div>
                    ) : horariosDisponibles.length > 0 ? (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Horarios disponibles ({horariosDisponibles.length} espacios)
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 max-h-[500px] overflow-y-auto pr-1">
                          {horariosDisponibles.map((hora, index) => {
                            const servicio = servicios.find(s => s.id === formData.servicioId);
                            const duracion = servicio?.duracion || 0;
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
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                        <p className="text-xs text-yellow-700 font-semibold mb-1">
                          ⚠️ No hay horarios disponibles
                        </p>
                        <p className="text-[10px] text-yellow-600">
                          No hay espacios libres este día
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                      <p className="text-xs text-blue-700 font-semibold mb-1">
                        ℹ️ Selecciona todos los datos
                      </p>
                      <p className="text-[10px] text-blue-600">
                        Completa servicio y fecha para ver horarios disponibles
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-5 py-3 bg-white flex-shrink-0">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-xl text-xs mb-2">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 text-xs"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading || hayConflicto || loadingData}
                className="flex-1 px-3 py-2 bg-[#0490C8] hover:bg-[#023664] text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

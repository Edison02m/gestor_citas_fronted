'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { agendaPublicaService } from '@/services/agenda-publica.service';
import SelectorSemana from '@/components/citas/SelectorSemana';
import { formatDateInput } from '@/utils/format';
import {
  NegocioPublico,
  SucursalPublica,
  ServicioPublico,
  EmpleadoPublico,
  HorarioDisponible,
  CreateCitaPublicaDto,
  Cita,
} from '@/interfaces';

export default function AgendaPublicaPage() {
  const params = useParams();
  const linkPublico = params?.linkPublico as string;

  // Estado del negocio y datos
  const [negocio, setNegocio] = useState<NegocioPublico | null>(null);
  const [sucursales, setSucursales] = useState<SucursalPublica[]>([]);
  const [servicios, setServicios] = useState<ServicioPublico[]>([]);
  const [empleados, setEmpleados] = useState<EmpleadoPublico[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([]);

  // Estado del wizard (pasos: 1-3)
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);

  // Formulario de reserva
  const [formData, setFormData] = useState({
    // Paso 1: Cliente
    clienteCedula: '',
    clienteNombre: '',
    clienteTelefono: '',
    clienteEmail: '',
    // Paso 2: Servicio y selecciones
    sucursalId: '',
    servicioId: '',
    empleadoId: '',
    // Paso 3: Fecha y hora
    fecha: '',
    horaInicio: '',
    horaFin: '',
    notas: '',
  });

  // Estados para fecha y horarios
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  const [citasOcupadas, setCitasOcupadas] = useState<Cita[]>([]);
  const [loadingCitas, setLoadingCitas] = useState(false);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para búsqueda en selectores
  const [servicioSearch, setServicioSearch] = useState('');
  const [sucursalSearch, setSucursalSearch] = useState('');
  const [empleadoSearch, setEmpleadoSearch] = useState('');
  const [showServicioDropdown, setShowServicioDropdown] = useState(false);
  const [showSucursalDropdown, setShowSucursalDropdown] = useState(false);
  const [showEmpleadoDropdown, setShowEmpleadoDropdown] = useState(false);

  // Estados para validación de cliente
  const [validandoCedula, setValidandoCedula] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(false);

  // Cargar información inicial del negocio
  useEffect(() => {
    if (linkPublico) {
      cargarDatosIniciales();
      // Auto-seleccionar la fecha actual
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      setFechaSeleccionada(hoy);
    }
  }, [linkPublico]);

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

  // Cuando cambia la fecha seleccionada o los datos necesarios, calcular horarios disponibles
  useEffect(() => {
    if (fechaSeleccionada && formData.empleadoId && formData.sucursalId && formData.servicioId) {
      calcularHorariosDisponibles();
    } else {
      setHorariosDisponibles([]);
      setCitasOcupadas([]);
    }
  }, [fechaSeleccionada, formData.empleadoId, formData.sucursalId, formData.servicioId]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar negocio
      const negocioRes = await agendaPublicaService.obtenerNegocioPublico(linkPublico);
      setNegocio(negocioRes.data);

      // Cargar sucursales
      const sucursalesRes = await agendaPublicaService.obtenerSucursalesPublicas(linkPublico);
      setSucursales(sucursalesRes.data);

      // Cargar servicios
      const serviciosRes = await agendaPublicaService.obtenerServiciosPublicos(linkPublico);
      setServicios(serviciosRes.data);

      // Auto-seleccionar sucursal si hay solo una
      if (sucursalesRes.data.length === 1) {
        setFormData(prev => ({ ...prev, sucursalId: sucursalesRes.data[0].id }));
        setSucursalSearch(sucursalesRes.data[0].nombre);
        // Cargar empleados de esa sucursal
        const empleadosRes = await agendaPublicaService.obtenerEmpleadosPublicos(
          linkPublico,
          sucursalesRes.data[0].id
        );
        setEmpleados(empleadosRes.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar la información del negocio');
    } finally {
      setLoading(false);
    }
  };

  // Cargar empleados cuando se selecciona una sucursal
  useEffect(() => {
    if (formData.sucursalId) {
      cargarEmpleados();
    }
  }, [formData.sucursalId]);

  const cargarEmpleados = async () => {
    try {
      const empleadosRes = await agendaPublicaService.obtenerEmpleadosPublicos(
        linkPublico,
        formData.sucursalId
      );
      setEmpleados(empleadosRes.data);
    } catch (err: any) {
      console.error('Error al cargar empleados:', err);
    }
  };

  // Cargar horarios disponibles cuando se tienen todos los datos necesarios
  useEffect(() => {
    if (formData.sucursalId && formData.servicioId && formData.fecha) {
      cargarHorarios();
    }
  }, [formData.sucursalId, formData.servicioId, formData.empleadoId, formData.fecha]);

  const cargarHorarios = async () => {
    try {
      setLoadingHorarios(true);
      const horariosRes = await agendaPublicaService.obtenerDisponibilidadPublica(linkPublico, {
        sucursalId: formData.sucursalId,
        servicioId: formData.servicioId,
        empleadoId: formData.empleadoId || undefined,
        fecha: formData.fecha,
      });
      setHorariosDisponibles(horariosRes.data);
    } catch (err: any) {
      console.error('Error al cargar horarios:', err);
      setHorariosDisponibles([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const calcularHorariosDisponibles = async () => {
    if (!fechaSeleccionada || !formData.empleadoId || !formData.sucursalId || !formData.servicioId) return;

    try {
      setLoadingCitas(true);
      const fechaStr = formatDateInput(fechaSeleccionada);
      
      // Obtener disponibilidad desde el backend
      const response = await agendaPublicaService.obtenerDisponibilidadPublica(
        linkPublico as string,
        {
          fecha: fechaStr,
          servicioId: formData.servicioId,
          sucursalId: formData.sucursalId,
          empleadoId: formData.empleadoId
        }
      );

      setHorariosDisponibles(response.data);
      setCitasOcupadas([]);

    } catch (error) {
      console.error('Error al calcular horarios disponibles:', error);
      setHorariosDisponibles([]);
    } finally {
      setLoadingCitas(false);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  // Funciones de filtrado para búsqueda
  const serviciosFiltrados = servicios.filter(servicio =>
    servicio.nombre.toLowerCase().includes(servicioSearch.toLowerCase())
  );

  const sucursalesFiltradas = sucursales.filter(sucursal =>
    sucursal.nombre.toLowerCase().includes(sucursalSearch.toLowerCase()) ||
    sucursal.direccion.toLowerCase().includes(sucursalSearch.toLowerCase())
  );

  const empleadosFiltrados = empleados.filter(empleado =>
    empleado.nombre.toLowerCase().includes(empleadoSearch.toLowerCase())
  );

  // Funciones para manejar selección
  const handleServicioSelect = (servicio: ServicioPublico) => {
    setFormData(prev => ({ 
      ...prev, 
      servicioId: servicio.id,
      // Limpiar horas cuando cambia el servicio
      horaInicio: '',
      horaFin: ''
    }));
    setServicioSearch(servicio.nombre);
    setShowServicioDropdown(false);
  };

  const handleSucursalSelect = (sucursal: SucursalPublica) => {
    setFormData(prev => ({ 
      ...prev, 
      sucursalId: sucursal.id, 
      empleadoId: '',
      // Limpiar horas cuando cambia la sucursal
      horaInicio: '',
      horaFin: ''
    }));
    setSucursalSearch(sucursal.nombre);
    setShowSucursalDropdown(false);
    setEmpleadoSearch('');
  };

  const handleEmpleadoSelect = (empleado: EmpleadoPublico) => {
    setFormData(prev => ({ 
      ...prev, 
      empleadoId: empleado.id,
      // Limpiar horas cuando cambia el empleado
      horaInicio: '',
      horaFin: ''
    }));
    setEmpleadoSearch(empleado.nombre);
    setShowEmpleadoDropdown(false);
  };

  const seleccionarHorario = (horario: HorarioDisponible) => {
    if (horario.disponible) {
      setFormData((prev) => ({
        ...prev,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin,
      }));
    }
  };

  const handleSubmit = async () => {
    // Solo permitir submit en el paso 3
    if (paso !== 3) {
      return;
    }

    // Validaciones
    if (!formData.clienteCedula || !formData.clienteNombre || !formData.clienteTelefono) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!formData.horaInicio || !formData.horaFin) {
      setError('Por favor selecciona un horario');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const dto: CreateCitaPublicaDto = {
        fecha: formData.fecha,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        clienteCedula: formData.clienteCedula,
        clienteNombre: formData.clienteNombre,
        clienteTelefono: formData.clienteTelefono,
        clienteEmail: formData.clienteEmail || undefined,
        servicioId: formData.servicioId,
        empleadoId: formData.empleadoId || undefined,
        sucursalId: formData.sucursalId,
        notas: formData.notas || undefined,
      };

      await agendaPublicaService.crearCitaPublica(linkPublico, dto);

      // Mostrar éxito
      setSuccess('¡Cita agendada exitosamente! Recibirás una confirmación pronto.');
      setPaso(4); // Paso de confirmación final
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al crear la cita');
    } finally {
      setSubmitting(false);
    }
  };

  const avanzarPaso = () => {
    setError('');
    
    // Validaciones por paso
    if (paso === 1) {
      if (!formData.clienteCedula) {
        setError('La cédula es obligatoria');
        return;
      }
      if (!formData.clienteNombre) {
        setError('El nombre es obligatorio');
        return;
      }
      if (!formData.clienteTelefono) {
        setError('El teléfono es obligatorio');
        return;
      }
    }

    if (paso === 2) {
      // Auto-seleccionar sucursal si hay solo una y no está seleccionada
      if (!formData.sucursalId && sucursales.length === 1) {
        setFormData(prev => ({ ...prev, sucursalId: sucursales[0].id }));
        setSucursalSearch(sucursales[0].nombre);
      }
      
      if (!formData.sucursalId && sucursales.length > 1) {
        setError('Por favor selecciona una sucursal');
        return;
      }
      if (!formData.servicioId) {
        setError('Por favor selecciona un servicio');
        return;
      }
    }

    if (paso === 3) {
      if (!formData.fecha) {
        setError('Por favor selecciona una fecha');
        return;
      }
      if (!formData.horaInicio) {
        setError('Por favor selecciona un horario');
        return;
      }
    }

    setPaso((paso + 1) as 1 | 2 | 3 | 4);
  };

  const retrocederPaso = () => {
    setError('');
    setPaso((paso - 1) as 1 | 2 | 3 | 4);
  };

  const reiniciarFormulario = () => {
    // Resetear datos del formulario
    const nuevoFormData = {
      clienteCedula: '',
      clienteNombre: '',
      clienteTelefono: '',
      clienteEmail: '',
      sucursalId: '',
      servicioId: '',
      empleadoId: '',
      fecha: '',
      horaInicio: '',
      horaFin: '',
      notas: '',
    };

    // Si hay solo una sucursal, auto-seleccionarla
    if (sucursales.length === 1) {
      nuevoFormData.sucursalId = sucursales[0].id;
      setSucursalSearch(sucursales[0].nombre);
    } else {
      setSucursalSearch('');
    }

    setFormData(nuevoFormData);
    setPaso(1);
    setSuccess('');
    setError('');
    setServicioSearch('');
    setEmpleadoSearch('');
    // Limpiar estados de validación de cliente
    setClienteEncontrado(false);
    setValidandoCedula(false);
    
    // Resetear fecha seleccionada a hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    setFechaSeleccionada(hoy);
  };

  // Formatear precio
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(precio);
  };

  // Formatear duración
  const formatearDuracion = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas > 0 && mins > 0) {
      return `${horas}h ${mins}min`;
    } else if (horas > 0) {
      return `${horas}h`;
    } else {
      return `${mins}min`;
    }
  };

  // Validar cédula y buscar cliente existente
  const validarCedula = async (cedula: string) => {
    // Limpiar la cédula (solo números, sin guiones ni espacios)
    const cedulaLimpia = cedula.trim().replace(/[-\s]/g, '');
    
    // Validar que tenga al menos 10 caracteres (cédula ecuatoriana sin guiones)
    if (cedulaLimpia.length < 10) {
      setClienteEncontrado(false);
      return;
    }

    try {
      setValidandoCedula(true);
      
      // Buscar cliente por cédula en el backend
      const response = await agendaPublicaService.buscarClientePorCedula(linkPublico, cedulaLimpia);
      
      if (response.success && response.data && response.data.existe) {
        // Cliente encontrado, autocompletar campos
        const cliente = response.data.cliente;
        
        setFormData(prev => ({
          ...prev,
          clienteCedula: cliente.cedula,
          clienteNombre: cliente.nombre,
          clienteTelefono: cliente.telefono || '',
          clienteEmail: cliente.email || ''
        }));
        setClienteEncontrado(true);
      } else {
        // Cliente no encontrado, limpiar campos excepto cédula
        setFormData(prev => ({
          ...prev,
          clienteNombre: '',
          clienteTelefono: '',
          clienteEmail: ''
        }));
        setClienteEncontrado(false);
      }
    } catch (error) {
      console.error('Error al validar cédula:', error);
      setClienteEncontrado(false);
    } finally {
      setValidandoCedula(false);
    }
  };

  // Handler para cambio de cédula con debounce
  const handleCedulaChange = (cedula: string) => {
    setFormData(prev => ({ ...prev, clienteCedula: cedula }));
    
    // Normalizar cédula (quitar guiones y espacios)
    const cedulaLimpia = cedula.trim().replace(/[-\s]/g, '');
    
    // Validar automáticamente cuando tenga 10+ caracteres
    if (cedulaLimpia.length >= 10) {
      validarCedula(cedula);
    } else {
      setClienteEncontrado(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0490C8]"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error && !negocio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={cargarDatosIniciales}
            className="px-6 py-2 bg-[#0490C8] text-white rounded-xl hover:bg-[#037ba8] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className={`w-full transition-all duration-300 ${paso === 3 ? 'max-w-4xl' : 'max-w-lg'}`}>
        {/* Header del negocio - Limpio y profesional */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {negocio?.logo && (
                <img
                  src={negocio.logo}
                  alt={negocio.nombre}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 truncate">{negocio?.nombre}</h1>
                {negocio?.descripcion && (
                  <p className="text-sm text-gray-600 truncate mt-0.5">{negocio.descripcion}</p>
                )}
              </div>
            </div>
            {negocio?.telefono && (
              <a
                href={`tel:${negocio.telefono}`}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium ml-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="hidden sm:inline">Llamar</span>
              </a>
            )}
          </div>
        </div>

        {/* Indicador de pasos - Estilo onboarding */}
        {paso < 4 && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              {[
                { numero: 1, nombre: 'Tus datos' },
                { numero: 2, nombre: 'Servicio' },
                { numero: 3, nombre: 'Fecha y hora' }
              ].map((p, index) => (
                <div key={p.numero} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        p.numero < paso
                          ? 'bg-green-500 text-white'
                          : p.numero === paso
                          ? 'bg-[#0490C8] text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {p.numero < paso ? '✓' : p.numero}
                    </div>
                    <p
                      className={`text-[11px] mt-1.5 text-center leading-tight ${
                        p.numero === paso ? 'text-gray-900 font-medium' : 'text-gray-500'
                      }`}
                    >
                      {p.nombre}
                    </p>
                  </div>
                  {index < 2 && (
                    <div
                      className={`h-px flex-1 mx-1 transition-all ${
                        p.numero < paso ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal principal */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header del paso actual */}
          {paso < 4 && (
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {paso === 1 ? 'Tus datos' : paso === 2 ? 'Selecciona servicio' : 'Fecha y hora'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {paso === 1 
                  ? 'Ingresa tu información de contacto' 
                  : paso === 2 
                  ? 'Elige el servicio que deseas reservar'
                  : 'Selecciona cuándo quieres tu cita'}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
              {/* Paso 1: Datos del Cliente - Minimalista */}
              {paso === 1 && (
                <div className="space-y-3">
                  {/* Cédula */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      Cédula <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.clienteCedula}
                        onChange={(e) => handleCedulaChange(e.target.value)}
                        placeholder="1234567890"
                        maxLength={10}
                        className={`w-full px-3 py-2 text-sm text-gray-900 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0490C8]/20 placeholder-gray-400 transition-all pr-9 ${
                          clienteEncontrado 
                            ? 'border-green-400 bg-green-50/30' 
                            : validandoCedula 
                            ? 'border-blue-400 bg-blue-50/30'
                            : 'border-gray-200 focus:border-[#0490C8]'
                        }`}
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {validandoCedula ? (
                          <div className="w-4 h-4 border-2 border-[#0490C8] border-t-transparent rounded-full animate-spin"></div>
                        ) : clienteEncontrado ? (
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : null}
                      </div>
                    </div>
                    {clienteEncontrado && !validandoCedula && (
                      <p className="text-[10px] text-green-600 mt-1 font-medium">
                        ✓ Cliente registrado
                      </p>
                    )}
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.clienteNombre}
                      onChange={(e) => handleInputChange('clienteNombre', e.target.value)}
                      placeholder="Juan Pérez"
                      className={`w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 placeholder-gray-400 transition-all ${
                        clienteEncontrado ? 'bg-green-50/30' : ''
                      } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      disabled={validandoCedula}
                      required
                    />
                  </div>

                  {/* Grid Teléfono y Email */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Teléfono */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.clienteTelefono}
                        onChange={(e) => handleInputChange('clienteTelefono', e.target.value)}
                        placeholder="0999999999"
                        className={`w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 placeholder-gray-400 transition-all ${
                          clienteEncontrado ? 'bg-green-50/30' : ''
                        } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        disabled={validandoCedula}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email <span className="text-[10px] text-gray-400 font-normal">(opcional)</span>
                      </label>
                      <input
                        type="email"
                        value={formData.clienteEmail}
                        onChange={(e) => handleInputChange('clienteEmail', e.target.value)}
                        placeholder="tu@email.com"
                        className={`w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 placeholder-gray-400 transition-all ${
                          clienteEncontrado ? 'bg-green-50/30' : ''
                        } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        disabled={validandoCedula}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 2: Servicio, Sucursal y Empleado - Minimalista */}
              {paso === 2 && (
                <div className="space-y-3">
                  {/* Sucursal */}
                  {sucursales.length > 1 && (
                    <div className="relative">
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
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
                          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 pr-10 placeholder-gray-400 transition-all"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

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
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Servicio <span className="text-red-500">*</span>
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
                        className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 pr-10 placeholder-gray-400 transition-all"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {showServicioDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {serviciosFiltrados.length > 0 ? (
                          serviciosFiltrados.map(servicio => (
                            <button
                              key={servicio.id}
                              type="button"
                              onClick={() => handleServicioSelect(servicio)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{servicio.nombre}</div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {formatearDuracion(servicio.duracion)} • {formatearPrecio(servicio.precio)}
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-xs text-gray-500 text-center">
                            No se encontraron servicios
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Empleado (opcional) */}
                  {empleados.length > 0 && (
                    <div className="relative">
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Empleado <span className="text-[10px] text-gray-400 font-normal">(opcional)</span>
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
                          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 pr-10 placeholder-gray-400 transition-all"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {showEmpleadoDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {empleadosFiltrados.length > 0 ? (
                            empleadosFiltrados.map(empleado => (
                              <button
                                key={empleado.id}
                                type="button"
                                onClick={() => handleEmpleadoSelect(empleado)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {empleado.foto ? (
                                    <img
                                      src={empleado.foto}
                                      alt={empleado.nombre}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold">
                                      {empleado.nombre.charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{empleado.nombre}</div>
                                    {empleado.cargo && (
                                      <div className="text-xs text-gray-500">{empleado.cargo}</div>
                                    )}
                                  </div>
                                </div>
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
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Notas adicionales <span className="text-[10px] text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                      value={formData.notas}
                      onChange={(e) => handleInputChange('notas', e.target.value)}
                      className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 resize-none placeholder-gray-400 transition-all"
                      rows={2}
                      placeholder="Información adicional..."
                    />
                  </div>
                </div>
              )}

              {/* Paso 3: Fecha y Hora - Minimalista */}
              {paso === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Columna Izquierda: Selector de Día */}
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Selecciona el día <span className="text-red-500">*</span>
                      </label>
                      <SelectorSemana
                        onSelectFecha={setFechaSeleccionada}
                        fechaSeleccionada={fechaSeleccionada}
                      />
                    </div>

                    {/* Selección de Hora Manual */}
                    {fechaSeleccionada && (
                      <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Hora de inicio <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="time"
                              value={formData.horaInicio}
                              onChange={(e) => handleHoraInicioChange(e.target.value)}
                              className="w-full px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Hora de fin <span className="text-[10px] text-gray-400 font-normal">(Auto)</span>
                            </label>
                            <input
                              type="time"
                              value={formData.horaFin}
                              readOnly
                              className="w-full px-3 py-1.5 text-sm text-gray-900 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
                              required
                            />
                          </div>
                        </div>
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
                      ) : horariosDisponibles.filter(h => h.disponible).length > 0 ? (
                        <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Horarios disponibles ({horariosDisponibles.filter(h => h.disponible).length} espacios)
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 max-h-[400px] overflow-y-auto pr-1">
                            {horariosDisponibles.filter(horario => horario.disponible).map((horario) => {
                              const servicio = servicios.find(s => s.id === formData.servicioId);
                              const duracion = servicio?.duracion || 0;
                              const esSeleccionado = formData.horaInicio === horario.horaInicio;

                              return (
                                <button
                                  key={horario.horaInicio}
                                  type="button"
                                  onClick={() => {
                                    handleHoraInicioChange(horario.horaInicio);
                                  }}
                                  className={`
                                    p-2 rounded-xl border transition-all text-center
                                    ${esSeleccionado 
                                      ? 'bg-[#0490C8] border-[#0490C8] text-white shadow-md' 
                                      : 'bg-white border-gray-200 text-gray-700 hover:border-[#0490C8] hover:bg-blue-50'
                                    }
                                  `}
                                >
                                  <div className="text-xs font-semibold">{horario.horaInicio}</div>
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
                            {!formData.servicioId 
                              ? '⚠️ Selecciona un servicio' 
                              : '⚠️ No hay horarios disponibles'}
                          </p>
                          {formData.servicioId && (
                            <p className="text-[10px] text-yellow-600">
                              No hay espacios libres este día
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Paso 4: Confirmación exitosa - Minimalista */}
              {paso === 4 && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cita Agendada!</h2>
                  <p className="text-sm text-gray-600 mb-6">{success}</p>
                  
                  <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 mb-6 text-left">
                    <h3 className="font-semibold text-gray-900 mb-4 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Detalles de tu cita
                    </h3>
                    <div className="space-y-3 text-xs text-gray-700">
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Fecha:</span>
                        <span className="text-gray-600">{formData.fecha}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Hora:</span>
                        <span className="text-gray-600">{formData.horaInicio} - {formData.horaFin}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Servicio:</span>
                        <span className="text-gray-600">{servicios.find((s) => s.id === formData.servicioId)?.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">Sucursal:</span>
                        <span className="text-gray-600">{sucursales.find((s) => s.id === formData.sucursalId)?.nombre}</span>
                      </div>
                      {formData.empleadoId && (
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium">Empleado:</span>
                          <span className="text-gray-600">{empleados.find((e) => e.id === formData.empleadoId)?.nombre}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={reiniciarFormulario}
                    className="w-full px-6 py-2.5 bg-[#0490C8] text-white text-sm font-semibold rounded-xl hover:bg-[#037ba8] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agendar otra cita
                  </button>
                </div>
              )}
            </div>

            {/* Footer con botones - Minimalista */}
            {paso < 4 && (
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/30">
                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl text-xs mb-3 flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-2">
                  {paso > 1 && (
                    <button
                      type="button"
                      onClick={retrocederPaso}
                      disabled={submitting}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-white hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Atrás
                    </button>
                  )}

                  {paso < 3 ? (
                    <button
                      type="button"
                      onClick={avanzarPaso}
                      className="flex-1 px-4 py-2.5 bg-[#0490C8] hover:bg-[#037ba8] text-white font-medium rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                    >
                      Siguiente
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting || !formData.horaInicio}
                      className="flex-1 px-4 py-2.5 bg-[#0490C8] hover:bg-[#037ba8] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Agendando...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Confirmar Cita
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

export interface SuperAdmin {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Usuario {
  id: string;
  email: string;
  nombre: string; // Nombre del usuario
  rol: string;
  primerLogin: boolean;
  activo: boolean;
  negocio?: {
    id: string;
    nombre: string;
    telefono: string;
    logo?: string;
    descripcion?: string;
    estadoSuscripcion: string;
    fechaVencimiento?: string;
    diasRestantes?: number | null;
  };
  createdAt?: string;
  updatedAt?: string;
}

// User puede ser SuperAdmin o Usuario
export type User = SuperAdmin | Usuario;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  data: {
    token: string;
    user: User;
    requiereCodigoActivacion?: boolean;
  };
  message: string;
}

// ============================================================================
// CLIENTES
// ============================================================================

export interface Cliente {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  email?: string;
  notas?: string;
  negocioId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClienteDto {
  nombre: string;
  cedula: string;
  telefono: string;
  email?: string;
  notas?: string;
}

export interface UpdateClienteDto {
  nombre?: string;
  cedula?: string;
  telefono?: string;
  email?: string;
  notas?: string;
}

export interface ClientesListResponse {
  success: true;
  data: {
    clientes: Cliente[];
    total: number;
    pagina: number;
    totalPaginas: number;
  };
}

// ============================================================================
// SUCURSALES
// ============================================================================

export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string | null;
  provincia: string | null;
  telefono: string;
  email: string | null;
  estado: "ACTIVA" | "INACTIVA";
  negocioId: string;
  createdAt: string;
  updatedAt: string;
  horarios: HorarioSucursal[];
}

export interface HorarioSucursal {
  id: string;
  diaSemana: number;
  abierto: boolean;
  horaApertura: string | null;
  horaCierre: string | null;
  tieneDescanso?: boolean;
  descansoInicio?: string | null;
  descansoFin?: string | null;
}

export interface HorarioDto {
  diaSemana: number;
  abierto: boolean;
  horaApertura?: string;
  horaCierre?: string;
  tieneDescanso?: boolean;
  descansoInicio?: string;
  descansoFin?: string;
}

export interface CrearSucursalDto {
  nombre: string;
  direccion: string;
  ciudad?: string;
  provincia?: string;
  telefono: string;
  email?: string;
  horarios: HorarioDto[];
}

export interface ActualizarSucursalDto {
  nombre?: string;
  direccion?: string;
  ciudad?: string | null;
  provincia?: string | null;
  telefono?: string;
  email?: string | null;
}

export interface ActualizarHorariosDto {
  horarios: HorarioDto[];
}

// ============================================================================
// ONBOARDING
// ============================================================================

export interface OnboardingStatus {
  completado: boolean;
  pasoActual: number;
  pasos: OnboardingPaso[];
  negocio: {
    tieneSucursales: boolean;
    tieneServicios: boolean;
    tieneEmpleados: boolean;
  };
}

export interface OnboardingPaso {
  paso: number;
  nombre: string;
  completado: boolean;
  opcional: boolean;
}

export interface HorarioInput {
  diaSemana: number;
  abierto: boolean;
  horaApertura: string | null;
  horaCierre: string | null;
  tieneDescanso: boolean;
  descansoInicio: string | null;
  descansoFin: string | null;
}

export interface CreateSucursalDto {
  nombre: string;
  direccion: string;
  telefono: string;
  horarios: HorarioInput[];
}

export interface CreateServicioDto {
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  color?: string;
  sucursalIds: string[];
}

export interface CreateEmpleadoDto {
  nombre: string;
  cargo: string;
  telefono: string;
  email?: string;
  foto?: string;
  sucursalIds: string[];
  horarios?: HorarioInput[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User>;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiereCodigoActivacion: boolean;
}

// ============================================================================
// EMPLEADOS
// ============================================================================

export interface Empleado {
  id: string;
  nombre: string;
  cargo: string;
  telefono: string;
  email: string;
  foto?: string | null;
  estado: "ACTIVO" | "INACTIVO";
  negocioId: string;
  horarios?: HorarioEmpleado[];
  bloqueos?: BloqueoEmpleado[];
  createdAt: string;
  updatedAt: string;
}

export interface HorarioEmpleado {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  tieneDescanso?: boolean;
  descansoInicio?: string | null;
  descansoFin?: string | null;
  empleadoId: string;
  sucursalId?: string | null;
  sucursal?: {
    id: string;
    nombre: string;
  };
}

export interface BloqueoEmpleado {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  motivo?: string | null;
  todoElDia: boolean;
  horaInicio?: string | null;
  horaFin?: string | null;
  empleadoId: string;
  createdAt: string;
}

export interface EmpleadoDto {
  nombre: string;
  cargo: string;
  telefono: string;
  email: string;
  foto?: string;
}

export interface EmpleadoUpdateDto {
  nombre?: string;
  cargo?: string;
  telefono?: string;
  email?: string;
  foto?: string | null;
  estado?: "ACTIVO" | "INACTIVO";
}

export interface HorarioEmpleadoDto {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  tieneDescanso?: boolean;
  descansoInicio?: string;
  descansoFin?: string;
  sucursalId?: string | null;
}

export interface ActualizarHorariosEmpleadoDto {
  horarios: HorarioEmpleadoDto[];
}

export interface BloqueoEmpleadoDto {
  fechaInicio: Date | string;
  fechaFin: Date | string;
  motivo?: string;
  todoElDia?: boolean;
  horaInicio?: string;
  horaFin?: string;
}

export interface EmpleadoSucursal {
  empleadoId: string;
  sucursalId: string;
  asignadoEn: string;
  sucursal: {
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
    estado: "ACTIVA" | "INACTIVA";
  };
}

export interface AsignarSucursalesDto {
  sucursalIds: string[];
}

export interface EmpleadosListResponse {
  success: true;
  data: {
    empleados: Empleado[];
    total: number;
    pagina: number;
    totalPaginas: number;
  };
}

// ============================================================================
// API RESPONSE
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  error: string;
  message: string;
}

// ============================================================================
// CÓDIGOS DE SUSCRIPCIÓN
// ============================================================================

export enum PlanSuscripcion {
  PRUEBA = 'PRUEBA',
  MENSUAL = 'MENSUAL',
  TRIMESTRAL = 'TRIMESTRAL',
  SEMESTRAL = 'SEMESTRAL',
  ANUAL = 'ANUAL',
  PERSONALIZADO = 'PERSONALIZADO',
}

export interface CodigoSuscripcion {
  id: string;
  codigo: string;
  plan: PlanSuscripcion;
  duracionMeses: number;
  descripcion?: string;
  precio?: number;
  usado: boolean;
  fechaUso?: string;
  fechaExpiracion?: string;
  usoMaximo: number;
  vecesUsado: number;
  motivoCreacion?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCodigoDto {
  plan: PlanSuscripcion;
  duracionMeses: number;
  descripcion?: string;
  precio?: number;
  fechaExpiracion?: string;
  usoMaximo?: number;
  motivoCreacion?: string;
  notas?: string;
}

export interface GenerarCodigosDto {
  plan: PlanSuscripcion;
  duracionMeses: number;
  cantidad: number;
  descripcion?: string;
  precio?: number;
  fechaExpiracion?: string;
  usoMaximo?: number;
  motivoCreacion?: string;
  notas?: string;
}

export interface CodigoSuscripcionListResponse {
  codigos: CodigoSuscripcion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EstadisticasCodigos {
  total: number;
  usados: number;
  disponibles: number;
  expirados: number;
  porPlan: Record<PlanSuscripcion, {
    total: number;
    usados: number;
    disponibles: number;
  }>;
}

// ============================================================================
// SERVICIOS
// ============================================================================

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: number; // minutos
  precio: number;
  foto: string | null;
  color: string;
  estado: "ACTIVO" | "INACTIVO";
  negocioId: string;
  createdAt: string;
  updatedAt: string;
  sucursales?: ServicioSucursal[];
}

export interface ServicioSucursal {
  sucursalId: string;
  disponible: boolean;
  asignadoEn: string;
  sucursal?: {
    id: string;
    nombre: string;
    direccion: string;
    ciudad: string | null;
    estado: "ACTIVA" | "INACTIVA";
  };
}

export interface UpdateServicioDto {
  nombre?: string;
  descripcion?: string;
  duracion?: number;
  precio?: number;
  foto?: string | null;
  color?: string;
  estado?: "ACTIVO" | "INACTIVO";
}

export interface AsignarSucursalesServicioDto {
  sucursales: string[]; // Array de UUIDs de sucursales
}

export interface ToggleDisponibilidadDto {
  disponible: boolean;
}

// ============================================================================
// CITAS
// ============================================================================

export enum EstadoCita {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
  NO_ASISTIO = 'NO_ASISTIO',
}

export enum CanalOrigen {
  MANUAL = 'MANUAL',
  WEB = 'WEB',
  WHATSAPP = 'WHATSAPP',
}

export interface Cita {
  id: string;
  fecha: string; // "2024-10-23"
  horaInicio: string; // "09:00"
  horaFin: string; // "10:00"
  estado: EstadoCita;
  notas?: string;
  precioTotal: number;
  canalOrigen: CanalOrigen;
  clienteId: string;
  servicioId: string;
  empleadoId?: string;
  sucursalId: string;
  negocioId: string;
  creadoPor?: string;
  modificadoPor?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones expandidas
  cliente?: {
    id: string;
    nombre: string;
    telefono: string;
    email?: string;
    cedula: string;
  };
  servicio?: {
    id: string;
    nombre: string;
    duracion: number;
    precio: number;
    color: string;
  };
  empleado?: {
    id: string;
    nombre: string;
    cargo: string;
    foto?: string;
  };
  sucursal?: {
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
  };
}

export interface CreateCitaDto {
  fecha: string; // "2024-10-23"
  horaInicio: string; // "09:00"
  horaFin: string; // "10:00"
  clienteId: string;
  servicioId: string;
  empleadoId?: string;
  sucursalId: string;
  notas?: string;
  canalOrigen?: CanalOrigen;
}

export interface UpdateCitaDto {
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  servicioId?: string;
  empleadoId?: string;
  sucursalId?: string;
  notas?: string;
  estado?: EstadoCita;
}

export interface FiltrosCitasDto {
  fechaInicio?: string;
  fechaFin?: string;
  clienteId?: string;
  empleadoId?: string;
  sucursalId?: string;
  servicioId?: string;
  estado?: EstadoCita;
  canalOrigen?: CanalOrigen;
  page?: number;
  limit?: number;
}

export interface CitasListResponse {
  success: true;
  data: Cita[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DisponibilidadEmpleadoDto {
  empleadoId?: string;
  sucursalId: string;
  servicioId: string;
  fecha: string; // "2024-10-23"
}

export interface HorarioDisponible {
  horaInicio: string; // "09:00"
  horaFin: string; // "09:30"
  disponible: boolean;
}

export interface DisponibilidadResponse {
  success: true;
  data: HorarioDisponible[];
}

// ============================================================================
// AGENDA PÚBLICA
// ============================================================================

export interface NegocioPublico {
  id: string;
  nombre: string;
  telefono: string;
  logo?: string;
  descripcion?: string;
  agendaPublica: boolean;
}

export interface SucursalPublica {
  id: string;
  nombre: string;
  direccion: string;
  telefono?: string;
  ciudad: string;
  estado: string;
  horarios?: HorarioSucursal[]; // Horarios de la sucursal
}

export interface ServicioPublico {
  id: string;
  nombre: string;
  descripcion?: string;
  duracion: number;
  precio: number;
  color?: string;
}

export interface EmpleadoPublico {
  id: string;
  nombre: string;
  cargo?: string;
  foto?: string;
}

export interface DisponibilidadPublicaDto {
  empleadoId?: string;
  sucursalId: string;
  servicioId: string;
  fecha: string;
}

export interface CreateCitaPublicaDto {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  clienteCedula: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string;
  servicioId: string;
  empleadoId?: string;
  sucursalId: string;
  notas?: string;
}

export interface NegocioPublicoResponse {
  success: true;
  data: NegocioPublico;
}

export interface SucursalesPublicasResponse {
  success: true;
  data: SucursalPublica[];
}

export interface ServiciosPublicosResponse {
  success: true;
  data: ServicioPublico[];
}

export interface EmpleadosPublicosResponse {
  success: true;
  data: EmpleadoPublico[];
}
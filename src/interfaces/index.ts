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
  horaInicio: string;
  horaFin: string;
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

export interface ServicioExtraInput {
  nombre: string;
  precio: number;
}

export interface CreateServicioDto {
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  color: string;
  sucursalIds: string[];
  extras?: ServicioExtraInput[];
}

export interface CreateEmpleadoDto {
  nombre: string;
  cargo: string;
  telefono: string;
  email?: string;
  foto?: string;
  color: string;
  sucursalIds: string[];
  horarios?: HorarioInput[];
}

export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  estado: string;
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

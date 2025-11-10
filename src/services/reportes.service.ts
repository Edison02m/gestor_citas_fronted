// frontend/src/services/reportes.service.ts

import api from './api';

// ============================================================================
// INTERFACES (mismas del backend)
// ============================================================================

export interface FiltrosReportes {
  fechaInicio?: string; // YYYY-MM-DD
  fechaFin?: string; // YYYY-MM-DD
  empleadoId?: number;
  servicioId?: number;
  sucursalId?: number;
  clienteId?: string;
  estado?: string; // pendiente, confirmada, completada, cancelada
}

// Interfaces para los datos de filtros
export interface Empleado {
  id: number;
  nombre: string;
}

export interface Servicio {
  id: number;
  nombre: string;
}

export interface Sucursal {
  id: number;
  nombre: string;
}

export interface PeriodoStats {
  fechaInicio: string;
  fechaFin: string;
  totalCitas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  citasNoAsistio: number;
  citasPendientes: number;
  citasConfirmadas: number;
  tasaAsistencia: number;
  tasaCancelacion: number;
  ingresoTotal: number;
  ingresoPromedioPorCita: number;
}

export interface ComparacionPeriodo {
  variacionCitas: string;
  variacionIngresos: string;
  variacionTasaAsistencia: string;
}

export interface DashboardStats {
  periodoActual: PeriodoStats;
  comparacionPeriodoAnterior?: ComparacionPeriodo;
}

export interface ClienteFrecuente {
  clienteId: string;
  nombre: string;
  telefono: string;
  email?: string;
  totalCitas: number;
  ultimaCita?: string;
  ingresoGenerado: number;
  servicioFavorito?: string;
  servicioFavoritoId?: string;
}

export interface ServicioVendido {
  servicioId: string;
  nombre: string;
  color: string;
  foto?: string;
  totalVentas: number;
  ingresoGenerado: number;
  porcentajeDelTotal: number;
  duracionPromedio: number;
  precioPromedio: number;
}

export interface DatoTemporal {
  label: string;
  totalCitas: number;
  ingresos: number;
  citasCompletadas: number;
  citasCanceladas: number;
}

export interface OcupacionEmpleado {
  empleadoId: string;
  nombre: string;
  foto?: string;
  cargo: string;
  totalCitasAtendidas: number;
  horasTrabajadas: number;
  ingresoGenerado: number;
  tasaOcupacion?: number;
  citasPorDia: number;
  servicioMasRealizado?: string;
  servicioMasRealizadoId?: string;
}

// ============================================================================
// NUEVAS ESTADÍSTICAS - PRIORIDAD ALTA
// ============================================================================

export interface TasaUtilizacion {
  empleadoId?: string;
  empleadoNombre?: string;
  sucursalId?: string;
  sucursalNombre?: string;
  horasDisponibles: number;
  horasTrabajadas: number;
  tasaUtilizacion: number;
  citasTotales: number;
  espaciosVacios: number;
}

export interface IngresosPorHora {
  empleadoId?: string;
  empleadoNombre?: string;
  ingresoTotal: number;
  horasTrabajadas: number;
  ingresoPorHora: number;
  mejorDia: { dia: string; ingreso: number };
  mejorHorario: { hora: string; ingreso: number };
  tendencia: 'creciente' | 'estable' | 'decreciente';
}

export interface RankingEmpleado {
  posicion: number;
  empleadoId: string;
  nombre: string;
  foto?: string;
  cargo: string;
  totalCitas: number;
  ingresoGenerado: number;
  tasaCompletacion: number;
  tasaUtilizacion: number;
  ingresoPorHora: number;
  calificacionPromedio?: number;
  puntuacionTotal: number;
}

export interface HorasPico {
  diaMasConcurrido: string;
  diaMasConcurridoCitas: number;
  horaMasConcurrida: string;
  horaMasConcurridaCitas: number;
  citasPorDia: { dia: string; citas: number; ingresos: number }[];
  citasPorHora: { hora: string; citas: number; ingresos: number }[];
  horasMenosConcurridas: string[];
  recomendaciones?: string[];
}

export interface ValorVidaCliente {
  clv: number;
  clientesTotales: number;
  clientesNuevos: number;
  clientesRecurrentes: number;
  tasaRetencion: number;
  frecuenciaPromedio: number;
  ticketPromedio: number;
  topClientes: {
    clienteId: string;
    nombre: string;
    totalGastado: number;
    totalCitas: number;
  }[];
}

export interface DashboardReportesResponse {
  dashboard: DashboardStats;
  clientesFrecuentes: ClienteFrecuente[];
  serviciosMasVendidos: ServicioVendido[];
  citasPorDia: DatoTemporal[];
  // NUEVAS ESTADÍSTICAS
  tasaUtilizacion?: TasaUtilizacion[];
  ingresosPorHora?: IngresosPorHora[];
  rankingEmpleados?: RankingEmpleado[];
  horasPico?: HorasPico;
  valorVidaCliente?: ValorVidaCliente;
}

// ============================================================================
// SERVICIO DE REPORTES
// ============================================================================

class ReportesService {
  /**
   * Construir query params desde filtros
   */
  private buildQueryParams(filtros: FiltrosReportes): string {
    const params = new URLSearchParams();
    
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.empleadoId) params.append('empleadoId', filtros.empleadoId.toString());
    if (filtros.servicioId) params.append('servicioId', filtros.servicioId.toString());
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId.toString());
    if (filtros.clienteId) params.append('clienteId', filtros.clienteId);
    if (filtros.estado) params.append('estado', filtros.estado);
    
    return params.toString();
  }

  /**
   * Obtener dashboard completo con todas las métricas
   */
  async getDashboardCompleto(filtros: FiltrosReportes = {}): Promise<DashboardReportesResponse> {
    const queryParams = this.buildQueryParams(filtros);
    const url = `/reportes/dashboard-completo${queryParams ? `?${queryParams}` : ''}`;
    
    const response: any = await api.get(url);
    return response.data; // response ya es { success: true, data: {...} }
  }

  /**
   * Obtener solo estadísticas del dashboard
   */
  async getDashboardStats(filtros: FiltrosReportes = {}): Promise<DashboardStats> {
    const queryParams = this.buildQueryParams(filtros);
    const url = `/reportes/dashboard/stats${queryParams ? `?${queryParams}` : ''}`;
    
    const response: any = await api.get(url);
    return response.data;
  }

  /**
   * Obtener clientes frecuentes
   */
  async getClientesFrecuentes(filtros: FiltrosReportes = {}, limit: number = 10): Promise<ClienteFrecuente[]> {
    const params = new URLSearchParams(this.buildQueryParams(filtros));
    params.append('limit', limit.toString());
    
    const response: any = await api.get(`/reportes/clientes-frecuentes?${params.toString()}`);
    return response.data;
  }

  /**
   * Obtener servicios más vendidos
   */
  async getServiciosMasVendidos(filtros: FiltrosReportes = {}, limit: number = 10): Promise<ServicioVendido[]> {
    const params = new URLSearchParams(this.buildQueryParams(filtros));
    params.append('limit', limit.toString());
    
    const response: any = await api.get(`/reportes/servicios-vendidos?${params.toString()}`);
    return response.data;
  }

  /**
   * Obtener citas por día (análisis temporal)
   */
  async getCitasPorDia(filtros: FiltrosReportes = {}): Promise<DatoTemporal[]> {
    const queryParams = this.buildQueryParams(filtros);
    const url = `/reportes/citas-por-dia${queryParams ? `?${queryParams}` : ''}`;
    
    const response: any = await api.get(url);
    return response.data;
  }

  /**
   * Obtener ocupación de empleados
   */
  async getOcupacionEmpleados(filtros: FiltrosReportes = {}): Promise<OcupacionEmpleado[]> {
    const queryParams = this.buildQueryParams(filtros);
    const url = `/reportes/ocupacion-empleados${queryParams ? `?${queryParams}` : ''}`;
    
    const response: any = await api.get(url);
    return response.data;
  }

  /**
   * Obtener rango de fechas del mes actual
   */
  getMesActual(): { fechaInicio: string; fechaFin: string } {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    return {
      fechaInicio: primerDia.toISOString().split('T')[0],
      fechaFin: ultimoDia.toISOString().split('T')[0],
    };
  }

  /**
   * Obtener rango de fechas de la semana actual
   */
  getSemanaActual(): { fechaInicio: string; fechaFin: string } {
    const hoy = new Date();
    const dia = hoy.getDay();
    const primerDia = new Date(hoy);
    primerDia.setDate(hoy.getDate() - dia + (dia === 0 ? -6 : 1)); // Lunes
    
    const ultimoDia = new Date(primerDia);
    ultimoDia.setDate(primerDia.getDate() + 6); // Domingo
    
    return {
      fechaInicio: primerDia.toISOString().split('T')[0],
      fechaFin: ultimoDia.toISOString().split('T')[0],
    };
  }

  /**
   * Obtener rango de fechas del día actual
   */
  getHoy(): { fechaInicio: string; fechaFin: string } {
    const hoy = new Date();
    const fecha = hoy.toISOString().split('T')[0];
    
    return {
      fechaInicio: fecha,
      fechaFin: fecha,
    };
  }
}

export default new ReportesService();

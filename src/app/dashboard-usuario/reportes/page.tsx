// frontend/src/app/dashboard-usuario/reportes/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FiltrosReportes from '@/components/reportes/FiltrosReportes';
import DashboardStats from '@/components/reportes/DashboardStats';
import ClientesFrecuentes from '@/components/reportes/ClientesFrecuentes';
import ServiciosMasVendidos from '@/components/reportes/ServiciosMasVendidos';
import GraficoIngresos from '@/components/reportes/GraficoIngresos';
import TasaUtilizacionCard from '@/components/reportes/TasaUtilizacionCard';
import IngresosPorHoraCard from '@/components/reportes/IngresosPorHoraCard';
import RankingEmpleadosTable from '@/components/reportes/RankingEmpleadosTable';
import HorasPicoChart from '@/components/reportes/HorasPicoChart';
import ValorVidaClienteCard from '@/components/reportes/ValorVidaClienteCard';
import reportesService, {
  FiltrosReportes as FiltrosReportesType,
  DashboardReportesResponse,
} from '@/services/reportes.service';

export default function ReportesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Estados de datos
  const [dashboardData, setDashboardData] = useState<DashboardReportesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosReportesType>(() => {
    const { fechaInicio, fechaFin } = reportesService.getMesActual();
    return { fechaInicio, fechaFin };
  });

  // Cargar dashboard cuando cambien los filtros
  useEffect(() => {
    console.log('🔄 useEffect dashboard - authLoading:', authLoading, 'user:', user ? 'existe' : 'no existe', 'filtros:', filtros);
    if (!authLoading && user) {
      cargarDashboard();
    }
  }, [filtros, authLoading, user]);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Cargando dashboard con filtros:', filtros);
      const data = await reportesService.getDashboardCompleto(filtros);
      console.log('✅ Dashboard data recibida:', data);
      setDashboardData(data);
    } catch (err: any) {
      console.error('❌ Error al cargar dashboard:', err);
      console.error('❌ Error response:', err.response);
      setError(err.response?.data?.message || 'Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Verificar si tiene acceso a reportes avanzados
  useEffect(() => {
    if (!authLoading && user) {
      const isUsuario = 'negocio' in user;
      if (isUsuario) {
        const reportesHabilitados = user.negocio?.reportesAvanzados || false;
        if (!reportesHabilitados) {
          // Redirigir al dashboard principal si no tiene reportes habilitados
          router.push('/dashboard-usuario');
        }
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Estadísticas y Reportes
            </h1>
            <p className="mt-1 text-xs text-gray-600">
              Analiza el rendimiento de tu negocio con métricas detalladas
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Filtros */}
          <div className="mb-5">
            <FiltrosReportes
              filtros={filtros}
              onChange={setFiltros}
            />
          </div>

          {/* Dashboard Stats (KPIs) */}
          <div className="mb-6">
            {!loading && !dashboardData && !error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-800 font-medium">⚠️ No se pudieron cargar los datos</p>
                <button 
                  onClick={() => cargarDashboard()}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reintentar
                </button>
              </div>
            )}
            {(loading || dashboardData) && (
              <DashboardStats
                stats={dashboardData?.dashboard || { periodoActual: {} as any }}
                loading={loading}
              />
            )}
          </div>

          {/* Grid de 2 columnas para las listas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Clientes Frecuentes */}
            <ClientesFrecuentes
              clientes={dashboardData?.clientesFrecuentes || []}
              loading={loading}
            />

            {/* Servicios Más Vendidos */}
            <ServiciosMasVendidos
              servicios={dashboardData?.serviciosMasVendidos || []}
              loading={loading}
            />
          </div>

          {/* Gráfico de Ingresos */}
          <div className="mb-6">
            <GraficoIngresos
              datos={dashboardData?.citasPorDia || []}
              loading={loading}
            />
          </div>

          {/* NUEVAS ESTADÍSTICAS - PRIORIDAD ALTA */}
          
          {/* Sección 1: Análisis de Empleados - Grid 2 columnas */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">Análisis de Empleados</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tasa de Utilización */}
              <TasaUtilizacionCard
                data={dashboardData?.tasaUtilizacion || []}
                loading={loading}
              />

              {/* Ranking de Empleados */}
              <RankingEmpleadosTable
                data={dashboardData?.rankingEmpleados || []}
                loading={loading}
              />
            </div>
          </div>

          {/* Sección 2: Análisis de Ingresos - Grid 2 columnas */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">Análisis de Ingresos</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ingresos por Hora */}
              <IngresosPorHoraCard
                data={dashboardData?.ingresosPorHora || []}
                loading={loading}
              />

              {/* Valor de Vida del Cliente */}
              <ValorVidaClienteCard
                data={dashboardData?.valorVidaCliente || {
                  clv: 0,
                  clientesTotales: 0,
                  clientesNuevos: 0,
                  clientesRecurrentes: 0,
                  tasaRetencion: 0,
                  frecuenciaPromedio: 0,
                  ticketPromedio: 0,
                  topClientes: [],
                }}
                loading={loading}
              />
            </div>
          </div>

          {/* Sección 3: Análisis de Demanda - Full width */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">Análisis de Demanda</h2>
            <HorasPicoChart
              data={dashboardData?.horasPico || {
                diaMasConcurrido: 'Sin datos',
                diaMasConcurridoCitas: 0,
                horaMasConcurrida: 'Sin datos',
                horaMasConcurridaCitas: 0,
                citasPorDia: [],
                citasPorHora: [],
                horasMenosConcurridas: [],
                recomendaciones: [],
              }}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

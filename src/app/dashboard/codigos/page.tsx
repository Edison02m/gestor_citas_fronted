'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import codigosService, { CodigoFilters } from '@/services/codigos.service';
import { CodigoSuscripcion, PlanSuscripcion, EstadisticasCodigos } from '@/interfaces';
import CodigosTable from '@/components/codigos/CodigosTable';
import CrearCodigoModal from '@/components/codigos/CrearCodigoModal';
import GenerarMultiplesModal from '@/components/codigos/GenerarMultiplesModal';

export default function CodigosPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [codigos, setCodigos] = useState<CodigoSuscripcion[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasCodigos | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<CodigoFilters>({});
  
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showGenerarModal, setShowGenerarModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Proteger ruta
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Cargar códigos
  const cargarCodigos = async () => {
    try {
      setLoading(true);
      const response = await codigosService.listar(filters, currentPage, 20);
      setCodigos(response.codigos);
      setTotalPages(response.totalPages);
    } catch (error) {
      // Log removido
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      const stats = await codigosService.obtenerEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      // Log removido
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      cargarCodigos();
      cargarEstadisticas();
    }
  }, [isAuthenticated, filters, currentPage]);

  const handleCrearCodigo = async (data: any) => {
    try {
      await codigosService.crear(data);
      await cargarCodigos();
      await cargarEstadisticas();
      alert('Código creado exitosamente');
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Error al crear código');
    }
  };

  const handleGenerarMultiples = async (data: any) => {
    try {
      const nuevos = await codigosService.generarMultiples(data);
      await cargarCodigos();
      await cargarEstadisticas();
      alert(`${nuevos.length} códigos generados exitosamente`);
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Error al generar códigos');
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este código?')) return;
    
    try {
      await codigosService.eliminar(id);
      await cargarCodigos();
      await cargarEstadisticas();
      alert('Código eliminado');
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Error al eliminar código');
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm });
    setCurrentPage(1);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Códigos de Suscripción</h1>
              <p className="mt-1 text-sm text-gray-600">Gestiona los códigos de activación</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Volver al Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-semibold text-gray-900">{estadisticas.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Disponibles</p>
                  <p className="text-2xl font-semibold text-gray-900">{estadisticas.disponibles}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Usados</p>
                  <p className="text-2xl font-semibold text-gray-900">{estadisticas.usados}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Expirados</p>
                  <p className="text-2xl font-semibold text-gray-900">{estadisticas.expirados}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones y Filtros */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Búsqueda */}
              <div className="flex-1 max-w-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Buscar código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-400"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Buscar
                  </button>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGenerarModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  ⚡ Generar Múltiples
                </button>
                <button
                  onClick={() => setShowCrearModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  + Crear Código
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="mt-4 flex flex-wrap gap-3">
              <select
                value={filters.plan || ''}
                onChange={(e) => setFilters({ ...filters, plan: e.target.value as PlanSuscripcion || undefined })}
                className="rounded-md border-gray-300 text-sm text-gray-900 bg-white"
              >
                <option value="">Todos los planes</option>
                <option value={PlanSuscripcion.GRATIS}>Gratis</option>
                <option value={PlanSuscripcion.PRO_MENSUAL}>Pro Mensual</option>
                <option value={PlanSuscripcion.PRO_ANUAL}>Pro Anual</option>
                <option value={PlanSuscripcion.PRO_PLUS_MENSUAL}>Pro Plus Mensual</option>
                <option value={PlanSuscripcion.PRO_PLUS_ANUAL}>Pro Plus Anual</option>
                <option value={PlanSuscripcion.PERSONALIZADO}>Personalizado</option>
              </select>

              <button
                onClick={() => setFilters({ ...filters, disponible: !filters.disponible, usado: undefined })}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.disponible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Disponibles
              </button>

              <button
                onClick={() => setFilters({ ...filters, usado: !filters.usado, disponible: undefined })}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.usado ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Usados
              </button>

              <button
                onClick={() => setFilters({ ...filters, expirado: !filters.expirado })}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.expirado ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Expirados
              </button>

              {Object.keys(filters).length > 0 && (
                <button
                  onClick={() => setFilters({})}
                  className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando códigos...</p>
            </div>
          ) : (
            <>
              <CodigosTable
                codigos={codigos}
                onDelete={handleEliminar}
                onView={(codigo) => alert(`Ver detalles de: ${codigo.codigo}`)}
              />

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modales */}
      <CrearCodigoModal
        isOpen={showCrearModal}
        onClose={() => setShowCrearModal(false)}
        onSubmit={handleCrearCodigo}
      />

      <GenerarMultiplesModal
        isOpen={showGenerarModal}
        onClose={() => setShowGenerarModal(false)}
        onSubmit={handleGenerarMultiples}
      />
    </div>
  );
}

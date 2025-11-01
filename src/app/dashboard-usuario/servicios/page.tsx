'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Servicio, CreateServicioDto, UpdateServicioDto } from '@/interfaces';
import { ServiciosService } from '@/services/servicios.service';
import ServiciosTable from '@/components/servicios/ServiciosTable';
import ServicioModal from '@/components/servicios/ServicioModal';
import SucursalesServicioModal from '@/components/servicios/SucursalesServicioModal';
import DeleteServicioModal from '@/components/servicios/DeleteServicioModal';

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSucursalesModalOpen, setIsSucursalesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    loadServicios();
  }, []);

  // Auto-search cuando el usuario escribe
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        loadServicios();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const loadServicios = async () => {
    try {
      setLoading(true);
      const data = await ServiciosService.getServicios();
      setServicios(data);
    } catch (error: any) {
      // Log removido
      setError(error.message || 'Error al cargar los servicios');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadServicios();
      return;
    }

    try {
      setIsSearching(true);
      const data = await ServiciosService.searchServicios(searchTerm.trim());
      setServicios(data);
    } catch (error: any) {
      // Log removido
      setError(error.message || 'Error al buscar servicios');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedServicio(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setIsModalOpen(true);
  };

  const handleSucursalesClick = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setIsSucursalesModalOpen(true);
  };

  const handleDeleteClick = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleSaveServicio = async (data: CreateServicioDto | UpdateServicioDto) => {
    try {
      setModalLoading(true);
      
      if (selectedServicio) {
        // Actualizar
        await ServiciosService.updateServicio(selectedServicio.id, data as UpdateServicioDto);
        setSuccessMessage('Servicio actualizado exitosamente');
      } else {
        // Crear
        await ServiciosService.createServicio(data as CreateServicioDto);
        setSuccessMessage('Servicio creado exitosamente');
      }

      setIsModalOpen(false);
      setSelectedServicio(null);
      await loadServicios();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      throw error; // El modal manejará el error
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveSucursales = async () => {
    try {
      setSuccessMessage('Sucursales actualizadas exitosamente');
      await loadServicios();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedServicio) return;

    try {
      setModalLoading(true);
      setDeleteError('');
      await ServiciosService.deleteServicio(selectedServicio.id);
      setIsDeleteModalOpen(false);
      setSelectedServicio(null);
      setSuccessMessage('Servicio eliminado exitosamente');
      await loadServicios();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      // Log removido
      setDeleteError(error.message || 'Error al eliminar el servicio');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Servicios</h1>
          <p className="text-gray-600">Gestiona los servicios que ofreces en tu negocio</p>
        </div>

        {/* Mensajes de éxito/error */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-[#0490C8] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateClick}
              className="px-6 py-2.5 bg-[#0490C8] hover:bg-[#023664] text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Servicio
            </button>
          </div>
        </div>

        {/* Results Info */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            {searchTerm ? (
              <p>
                Se encontraron <span className="font-semibold text-gray-900">{servicios.length}</span> resultados
                para &quot;{searchTerm}&quot;
              </p>
            ) : (
              <p>
                Total: <span className="font-semibold text-gray-900">{servicios.length}</span> servicios
              </p>
            )}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#0490C8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando servicios...</p>
            </div>
          </div>
        ) : servicios.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No hay servicios registrados'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primer servicio'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateClick}
                className="px-6 py-2.5 bg-[#0490C8] hover:bg-[#023664] text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Primer Servicio
              </button>
            )}
          </div>
        ) : (
          <ServiciosTable
            servicios={servicios}
            onEdit={handleEditClick}
            onEditSucursales={handleSucursalesClick}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* Modals */}
      <ServicioModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedServicio(null);
        }}
        onSubmit={handleSaveServicio}
        servicio={selectedServicio}
        loading={modalLoading}
      />

      <SucursalesServicioModal
        isOpen={isSucursalesModalOpen}
        onClose={() => {
          setIsSucursalesModalOpen(false);
          setSelectedServicio(null);
        }}
        onSubmit={handleSaveSucursales}
        servicio={selectedServicio}
        loading={modalLoading}
      />

      <DeleteServicioModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedServicio(null);
          setDeleteError('');
        }}
        onConfirm={handleDeleteConfirm}
        servicio={selectedServicio}
        loading={modalLoading}
        error={deleteError}
      />
    </DashboardLayout>
  );
}

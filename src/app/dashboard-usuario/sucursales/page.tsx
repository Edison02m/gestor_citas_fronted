'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Sucursal, HorarioDto, CrearSucursalDto, ActualizarSucursalDto } from '@/interfaces';
import { SucursalesService } from '@/services/sucursales.service';
import SucursalesTable from '@/components/sucursales/SucursalesTable';
import SucursalModal from '@/components/sucursales/SucursalModal';
import HorariosModal from '@/components/sucursales/HorariosModal';
import DeleteSucursalModal from '@/components/sucursales/DeleteSucursalModal';

export default function SucursalesPage() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHorariosModalOpen, setIsHorariosModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    loadSucursales();
  }, []);

  // Auto-search cuando el usuario escribe
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        loadSucursales();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const loadSucursales = async () => {
    try {
      setLoading(true);
      const data = await SucursalesService.getSucursales();
      setSucursales(data);
    } catch (error: any) {
      console.error('Error al cargar sucursales:', error);
      alert(error.message || 'Error al cargar las sucursales');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadSucursales();
      return;
    }

    try {
      setIsSearching(true);
      const data = await SucursalesService.searchSucursales(searchTerm.trim());
      setSucursales(data);
    } catch (error: any) {
      console.error('Error al buscar sucursales:', error);
      alert(error.message || 'Error al buscar sucursales');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedSucursal(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (sucursal: Sucursal) => {
    setSelectedSucursal(sucursal);
    setIsModalOpen(true);
  };

  const handleHorariosClick = (sucursal: Sucursal) => {
    setSelectedSucursal(sucursal);
    setIsHorariosModalOpen(true);
  };

  const handleDeleteClick = (sucursal: Sucursal) => {
    setSelectedSucursal(sucursal);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleSaveSucursal = async (data: CrearSucursalDto | ActualizarSucursalDto) => {
    try {
      setModalLoading(true);
      
      if (selectedSucursal) {
        // Actualizar
        await SucursalesService.updateSucursal(selectedSucursal.id, data as ActualizarSucursalDto);
      } else {
        // Crear
        await SucursalesService.createSucursal(data as CrearSucursalDto);
      }

      setIsModalOpen(false);
      setSelectedSucursal(null);
      await loadSucursales();
    } catch (error: any) {
      throw error; // El modal manejará el error
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveHorarios = async (horarios: HorarioDto[]) => {
    if (!selectedSucursal) return;

    try {
      setModalLoading(true);
      await SucursalesService.updateHorarios(selectedSucursal.id, { horarios });
      setIsHorariosModalOpen(false);
      setSelectedSucursal(null);
      await loadSucursales();
    } catch (error: any) {
      throw error; // El modal manejará el error
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSucursal) return;

    try {
      setModalLoading(true);
      setDeleteError('');
      await SucursalesService.deleteSucursal(selectedSucursal.id);
      setIsDeleteModalOpen(false);
      setSelectedSucursal(null);
      await loadSucursales();
    } catch (error: any) {
      console.error('Error al eliminar sucursal:', error);
      setDeleteError(error.message || 'Error al eliminar la sucursal');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sucursales</h1>
          <p className="text-gray-600">Gestiona las sucursales de tu negocio</p>
        </div>

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
                placeholder="Buscar por nombre, ciudad, dirección o provincia..."
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
              Nueva Sucursal
            </button>
          </div>
        </div>

        {/* Results Info */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            {searchTerm ? (
              <p>
                Se encontraron <span className="font-semibold text-gray-900">{sucursales.length}</span> resultados
                para &quot;{searchTerm}&quot;
              </p>
            ) : (
              <p>
                Total: <span className="font-semibold text-gray-900">{sucursales.length}</span> sucursales
              </p>
            )}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#0490C8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando sucursales...</p>
            </div>
          </div>
        ) : sucursales.length === 0 ? (
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No hay sucursales registradas'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primera sucursal'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateClick}
                className="px-6 py-2.5 bg-[#0490C8] hover:bg-[#023664] text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Primera Sucursal
              </button>
            )}
          </div>
        ) : (
          <SucursalesTable
            sucursales={sucursales}
            onEdit={handleEditClick}
            onEditHorarios={handleHorariosClick}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* Modals */}
      <SucursalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSucursal(null);
        }}
        onSubmit={handleSaveSucursal}
        sucursal={selectedSucursal}
        loading={modalLoading}
      />

      <HorariosModal
        isOpen={isHorariosModalOpen}
        onClose={() => {
          setIsHorariosModalOpen(false);
          setSelectedSucursal(null);
        }}
        onSubmit={handleSaveHorarios}
        sucursal={selectedSucursal}
        loading={modalLoading}
      />

      <DeleteSucursalModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSucursal(null);
          setDeleteError('');
        }}
        onConfirm={handleDeleteConfirm}
        sucursal={selectedSucursal}
        loading={modalLoading}
        error={deleteError}
      />
    </DashboardLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ClientesTable from '@/components/clientes/ClientesTable';
import ClienteModal from '@/components/clientes/ClienteModal';
import DeleteClienteModal from '@/components/clientes/DeleteClienteModal';
import { ClientesService } from '@/services/clientes.service';
import { Cliente, CreateClienteDto, UpdateClienteDto } from '@/interfaces';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadClientes();
  }, [currentPage]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, clientes]);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await ClientesService.getClientes(currentPage, 50);
      setClientes(data.clientes);
      setFilteredClientes(data.clientes);
      setTotal(data.total);
      setTotalPages(data.totalPaginas);
    } catch (error: any) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredClientes(clientes);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(term) ||
        cliente.cedula.includes(term) ||
        cliente.telefono.includes(term) ||
        cliente.email?.toLowerCase().includes(term)
    );
    setFilteredClientes(filtered);
  };

  const handleCreate = () => {
    setSelectedCliente(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const handleDelete = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (data: CreateClienteDto | UpdateClienteDto) => {
    try {
      setModalLoading(true);
      
      if (selectedCliente) {
        // Actualizar
        await ClientesService.updateCliente(selectedCliente.id, data);
      } else {
        // Crear
        await ClientesService.createCliente(data as CreateClienteDto);
      }

      setIsModalOpen(false);
      setSelectedCliente(null);
      await loadClientes();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al guardar el cliente');
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCliente) return;

    try {
      setModalLoading(true);
      setDeleteError('');
      await ClientesService.deleteCliente(selectedCliente.id);
      setIsDeleteModalOpen(false);
      setSelectedCliente(null);
      await loadClientes();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar el cliente';
      setDeleteError(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clientes</h1>
          <p className="text-gray-600">Gestiona la información de tus clientes</p>
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
                placeholder="Buscar por nombre, cédula, teléfono o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
              />
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreate}
              className="px-6 py-2.5 bg-[#0490C8] hover:bg-[#023664] text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Results Info */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            {searchTerm ? (
              <p>
                Se encontraron <span className="font-semibold text-gray-900">{filteredClientes.length}</span> resultados
                para &quot;{searchTerm}&quot;
              </p>
            ) : (
              <p>
                Total: <span className="font-semibold text-gray-900">{total}</span> {total === 1 ? 'cliente' : 'clientes'}
              </p>
            )}
          </div>
        )}

        {/* Table */}
        <ClientesTable
          clientes={filteredClientes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCliente(null);
        }}
        onSubmit={handleSubmit}
        cliente={selectedCliente}
        loading={modalLoading}
      />

      <DeleteClienteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCliente(null);
          setDeleteError('');
        }}
        onConfirm={handleConfirmDelete}
        cliente={selectedCliente}
        loading={modalLoading}
        error={deleteError}
      />
    </DashboardLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import EmpleadosService from '@/services/empleados.service';
import { Empleado } from '@/interfaces';
import EmpleadosTable from '@/components/empleados/EmpleadosTable';
import EmpleadoModal from '@/components/empleados/EmpleadoModal';
import HorariosEmpleadoModal from '@/components/empleados/HorariosEmpleadoModal';
import BloqueosEmpleadoModal from '@/components/empleados/BloqueosEmpleadoModal';
import SucursalesEmpleadoModal from '@/components/empleados/SucursalesEmpleadoModal';
import DeleteEmpleadoModal from '@/components/empleados/DeleteEmpleadoModal';

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para modales
  const [modalEmpleadoOpen, setModalEmpleadoOpen] = useState(false);
  const [modalHorariosOpen, setModalHorariosOpen] = useState(false);
  const [modalBloqueosOpen, setModalBloqueosOpen] = useState(false);
  const [modalSucursalesOpen, setModalSucursalesOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Cargar empleados
  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await EmpleadosService.getAllEmpleados();
      // Asegurarse de que data sea un array
      setEmpleados(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setError('Error al cargar empleados');
      // Log removido
      setEmpleados([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleCrearEmpleado = () => {
    setEmpleadoSeleccionado(null);
    setModalEmpleadoOpen(true);
  };

  const handleEditarEmpleado = (empleado: Empleado) => {
    setEmpleadoSeleccionado(empleado);
    setModalEmpleadoOpen(true);
  };

  const handleEditarHorarios = async (empleado: Empleado) => {
    try {
      // Cargar los horarios del empleado antes de abrir el modal
      const horarios = await EmpleadosService.getHorarios(empleado.id);
      
      // Actualizar el empleado con sus horarios
      const empleadoConHorarios = {
        ...empleado,
        horarios: horarios
      };
      
      setEmpleadoSeleccionado(empleadoConHorarios);
      setModalHorariosOpen(true);
    } catch (error) {
      setError('Error al cargar los horarios del empleado');
    }
  };

  const handleEditarBloqueos = (empleado: Empleado) => {
    setEmpleadoSeleccionado(empleado);
    setModalBloqueosOpen(true);
  };

  const handleEditarSucursales = (empleado: Empleado) => {
    setEmpleadoSeleccionado(empleado);
    setModalSucursalesOpen(true);
  };

  const handleSubmitEmpleado = async (data: any, sucursalIds?: string[]) => {
    setSubmitting(true);
    setError('');

    try {
      if (empleadoSeleccionado) {
        await EmpleadosService.updateEmpleado(empleadoSeleccionado.id, data);
        setSuccessMessage('Empleado actualizado exitosamente');
      } else {
        // Crear empleado
        const nuevoEmpleado = await EmpleadosService.createEmpleado(data);
        
        // Si hay sucursales seleccionadas, asignarlas
        if (sucursalIds && sucursalIds.length > 0) {
          await EmpleadosService.asignarSucursales(nuevoEmpleado.id, { sucursalIds });
          setSuccessMessage(`Empleado creado y asignado a ${sucursalIds.length} sucursal(es) exitosamente`);
        } else {
          setSuccessMessage('Empleado creado exitosamente');
        }
      }
      
      setModalEmpleadoOpen(false);
      setEmpleadoSeleccionado(null);
      await cargarEmpleados();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitHorarios = async (horarios: any[]) => {
    if (!empleadoSeleccionado) return;

    setSubmitting(true);
    setError('');

    try {
      // Enviar array directamente, no envuelto en objeto
      await EmpleadosService.updateHorarios(empleadoSeleccionado.id, horarios);
      setSuccessMessage('Horarios actualizados exitosamente');
      setModalHorariosOpen(false);
      setEmpleadoSeleccionado(null);
      await cargarEmpleados();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarEmpleado = (empleado: Empleado) => {
    setEmpleadoSeleccionado(empleado);
    setDeleteError('');
    setModalDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!empleadoSeleccionado) return;

    try {
      setSubmitting(true);
      setDeleteError('');
      await EmpleadosService.deleteEmpleado(empleadoSeleccionado.id);
      setModalDeleteOpen(false);
      setEmpleadoSeleccionado(null);
      setSuccessMessage('Empleado eliminado exitosamente');
      await cargarEmpleados();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      // Log removido
      setDeleteError(error.response?.data?.message || 'Error al eliminar el empleado');
    } finally {
      setSubmitting(false);
    }
  };

  const empleadosFiltrados = Array.isArray(empleados) ? empleados.filter(empleado =>
    empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Empleados</h1>
          <p className="text-gray-600">Gestiona tu equipo de trabajo, horarios y disponibilidad</p>
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
                placeholder="Buscar por nombre, cargo o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
              />
            </div>

            {/* Create Button */}
            <button
              onClick={handleCrearEmpleado}
              className="px-6 py-2.5 bg-[#0490C8] hover:bg-[#023664] text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Empleado
            </button>
          </div>
        </div>

        {/* Results Info */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            {searchTerm ? (
              <p>
                Se encontraron <span className="font-semibold text-gray-900">{empleadosFiltrados.length}</span> resultados
                para &quot;{searchTerm}&quot;
              </p>
            ) : (
              <p>
                Total: <span className="font-semibold text-gray-900">{Array.isArray(empleados) ? empleados.length : 0}</span> empleados
                {' • '}
                <span className="text-[#0490C8] font-semibold">
                  {Array.isArray(empleados) ? empleados.filter(e => e.estado === 'ACTIVO').length : 0} activos
                </span>
                {' • '}
                <span className="text-gray-400 font-semibold">
                  {Array.isArray(empleados) ? empleados.filter(e => e.estado === 'INACTIVO').length : 0} inactivos
                </span>
              </p>
            )}
          </div>
        )}

        {/* Tabla de empleados */}
        <EmpleadosTable
          empleados={empleadosFiltrados}
          onEdit={handleEditarEmpleado}
          onEditHorarios={handleEditarHorarios}
          onEditBloqueos={handleEditarBloqueos}
          onEditSucursales={handleEditarSucursales}
          onDelete={handleEliminarEmpleado}
          loading={loading}
        />
      </div>

      {/* Modales */}
      <EmpleadoModal
        isOpen={modalEmpleadoOpen}
        onClose={() => {
          setModalEmpleadoOpen(false);
          setEmpleadoSeleccionado(null);
        }}
        onSubmit={handleSubmitEmpleado}
        empleado={empleadoSeleccionado}
        loading={submitting}
      />

      <HorariosEmpleadoModal
        isOpen={modalHorariosOpen}
        onClose={() => {
          setModalHorariosOpen(false);
          setEmpleadoSeleccionado(null);
        }}
        onSubmit={handleSubmitHorarios}
        empleado={empleadoSeleccionado}
        loading={submitting}
      />

      <BloqueosEmpleadoModal
        isOpen={modalBloqueosOpen}
        onClose={() => {
          setModalBloqueosOpen(false);
          setEmpleadoSeleccionado(null);
        }}
        empleado={empleadoSeleccionado}
        onUpdate={cargarEmpleados}
      />

      <SucursalesEmpleadoModal
        isOpen={modalSucursalesOpen}
        onClose={() => {
          setModalSucursalesOpen(false);
          setEmpleadoSeleccionado(null);
        }}
        empleado={empleadoSeleccionado}
        onSuccess={cargarEmpleados}
      />

      <DeleteEmpleadoModal
        isOpen={modalDeleteOpen}
        onClose={() => {
          setModalDeleteOpen(false);
          setEmpleadoSeleccionado(null);
          setDeleteError('');
        }}
        onConfirm={handleConfirmDelete}
        empleado={empleadoSeleccionado}
        loading={submitting}
        error={deleteError}
      />
    </DashboardLayout>
  );
}

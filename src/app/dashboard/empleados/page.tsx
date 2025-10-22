'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import EmpleadosService from '@/services/empleados.service';
import { Empleado } from '@/interfaces';
import EmpleadosTable from '@/components/empleados/EmpleadosTable';
import EmpleadoModal from '@/components/empleados/EmpleadoModal';
import HorariosEmpleadoModal from '@/components/empleados/HorariosEmpleadoModal';
import BloqueosEmpleadoModal from '@/components/empleados/BloqueosEmpleadoModal';
import SucursalesEmpleadoModal from '@/components/empleados/SucursalesEmpleadoModal';

export default function EmpleadosPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  
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
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Proteger la ruta
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Cargar empleados
  useEffect(() => {
    if (isAuthenticated) {
      cargarEmpleados();
    }
  }, [isAuthenticated]);

  const cargarEmpleados = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await EmpleadosService.getAllEmpleados();
      setEmpleados(data);
    } catch (error: any) {
      setError('Error al cargar empleados');
      console.error(error);
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

  const handleEditarHorarios = (empleado: Empleado) => {
    setEmpleadoSeleccionado(empleado);
    setModalHorariosOpen(true);
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
        const nuevoEmpleado = await EmpleadosService.createEmpleado(data);
        
        // Si se proporcionaron sucursales, asignarlas
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

    console.log('🚀 [Page] Iniciando actualización de horarios...');
    console.log('👤 [Page] Empleado ID:', empleadoSeleccionado.id);
    console.log('📊 [Page] Horarios recibidos:', JSON.stringify(horarios, null, 2));

    try {
      // Enviar array directo de horarios, no wrapper object
      const resultado = await EmpleadosService.updateHorarios(empleadoSeleccionado.id, horarios);
      
      console.log('✅ [Page] Horarios actualizados exitosamente');
      console.log('📦 [Page] Resultado:', resultado);
      
      setSuccessMessage('Horarios actualizados exitosamente');
      setModalHorariosOpen(false);
      setEmpleadoSeleccionado(null);
      await cargarEmpleados();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('❌ [Page] Error al actualizar horarios:', error);
      console.error('❌ [Page] Error response:', error.response?.data);
      console.error('❌ [Page] Error status:', error.response?.status);
      console.error('❌ [Page] Error completo:', JSON.stringify(error, null, 2));
      
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar horarios';
      setError(errorMessage);
      
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarEmpleado = async (empleado: Empleado) => {
    if (!confirm(`¿Estás seguro de eliminar a ${empleado.nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await EmpleadosService.deleteEmpleado(empleado.id);
      setSuccessMessage('Empleado eliminado exitosamente');
      await cargarEmpleados();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar empleado');
      setTimeout(() => setError(''), 5000);
    }
  };

  const empleadosFiltrados = empleados.filter(empleado =>
    empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0490C8]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h1>
              <p className="mt-1 text-sm text-gray-600">
                Administra tu equipo de trabajo, horarios y disponibilidad
              </p>
            </div>
            <button
              onClick={handleCrearEmpleado}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-[#0490C8] text-white font-medium rounded-xl hover:bg-[#037ab0] transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Empleado
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Barra de búsqueda y estadísticas */}
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, cargo o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent text-sm"
              />
            </div>

            {/* Estadísticas */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{empleados.length}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0490C8]">
                  {empleados.filter(e => e.estado === 'ACTIVO').length}
                </p>
                <p className="text-xs text-gray-600">Activos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">
                  {empleados.filter(e => e.estado === 'INACTIVO').length}
                </p>
                <p className="text-xs text-gray-600">Inactivos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de empleados */}
        <EmpleadosTable
          empleados={empleadosFiltrados}
          onEdit={handleEditarEmpleado}
          onEditHorarios={handleEditarHorarios}
          onEditSucursales={handleEditarSucursales}
          onEditBloqueos={handleEditarBloqueos}
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
    </div>
  );
}

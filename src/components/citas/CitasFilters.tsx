'use client';

import { useState, useEffect } from 'react';
import { EstadoCita } from '@/interfaces';
import { ServiciosService } from '@/services/servicios.service';
import { EmpleadosService } from '@/services/empleados.service';
import { SucursalesService } from '@/services/sucursales.service';

interface CitasFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  busqueda: string;
  estado: string;
  servicioId: string;
  empleadoId: string;
  sucursalId: string;
}

export default function CitasFilters({ onFilterChange }: CitasFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    busqueda: '',
    estado: '',
    servicioId: '',
    empleadoId: '',
    sucursalId: ''
  });

  const [servicios, setServicios] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadFilterData();
  }, []);

  const loadFilterData = async () => {
    try {
      const [serviciosRes, empleadosRes, sucursalesRes] = await Promise.all([
        ServiciosService.getServicios(),
        EmpleadosService.getEmpleados(),
        SucursalesService.getSucursales()
      ]);

      console.log('🔍 Datos de filtros cargados:', {
        servicios: serviciosRes,
        empleados: empleadosRes,
        sucursales: sucursalesRes
      });

      setServicios(serviciosRes);
      
      // Manejar la respuesta de empleados: { success: true, data: { empleados: [], total, pagina, totalPaginas } }
      let empleadosList = [];
      if ((empleadosRes as any).data?.empleados) {
        empleadosList = (empleadosRes as any).data.empleados;
      } else if ((empleadosRes as any).empleados) {
        empleadosList = (empleadosRes as any).empleados;
      } else if (Array.isArray(empleadosRes)) {
        empleadosList = empleadosRes;
      }
      
      const empleadosActivos = empleadosList.filter((e: any) => e.estado === 'ACTIVO');
      console.log('👥 Empleados activos:', empleadosActivos);
      setEmpleados(empleadosActivos);
      
      // Manejar la respuesta de sucursales (puede tener una estructura similar)
      let sucursalesList = [];
      if ((sucursalesRes as any).data?.sucursales) {
        sucursalesList = (sucursalesRes as any).data.sucursales;
      } else if (Array.isArray(sucursalesRes)) {
        sucursalesList = sucursalesRes;
      } else if ((sucursalesRes as any).data) {
        sucursalesList = (sucursalesRes as any).data;
      }
      
      console.log('🏢 Sucursales:', sucursalesList);
      setSucursales(sucursalesList);
    } catch (error) {
      console.error('Error cargando datos de filtros:', error);
    }
  };

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters: FilterValues = {
      busqueda: '',
      estado: '',
      servicioId: '',
      empleadoId: '',
      sucursalId: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '');
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case EstadoCita.PENDIENTE:
        return 'Pendiente';
      case EstadoCita.CONFIRMADA:
        return 'Confirmada';
      case EstadoCita.COMPLETADA:
        return 'Completada';
      case EstadoCita.CANCELADA:
        return 'Cancelada';
      case EstadoCita.NO_ASISTIO:
        return 'No asistió';
      default:
        return estado;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
      {/* Header colapsable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <span className="px-2 py-0.5 bg-[#0490C8] text-white text-xs font-semibold rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Contenido de filtros - Colapsable */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-3 items-end">
            {/* Búsqueda general */}
            <div className="lg:col-span-3">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Buscar Cliente
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.busqueda}
                  onChange={(e) => handleFilterChange('busqueda', e.target.value)}
                  placeholder="Nombre..."
                  className="w-full px-3 py-2 pl-9 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Estado */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Estado
              </label>
              <select
                value={filters.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent text-sm text-gray-900 transition-all"
              >
                <option value="">Todos</option>
                {Object.values(EstadoCita).map((estado) => (
                  <option key={estado} value={estado}>
                    {getEstadoLabel(estado)}
                  </option>
                ))}
              </select>
            </div>

            {/* Servicio */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Servicio
              </label>
              <select
                value={filters.servicioId}
                onChange={(e) => handleFilterChange('servicioId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent text-sm text-gray-900 transition-all"
              >
                <option value="">Todos</option>
                {servicios.map((servicio) => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Empleado */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Empleado
              </label>
              <select
                value={filters.empleadoId}
                onChange={(e) => handleFilterChange('empleadoId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent text-sm text-gray-900 transition-all"
              >
                <option value="">Todos</option>
                {empleados.map((empleado) => (
                  <option key={empleado.id} value={empleado.id}>
                    {empleado.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Sucursal */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Sucursal
              </label>
              <select
                value={filters.sucursalId}
                onChange={(e) => handleFilterChange('sucursalId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0490C8] focus:border-transparent text-sm text-gray-900 transition-all"
              >
                <option value="">Todas</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón limpiar - en la misma línea */}
            {hasActiveFilters() && (
              <div className="lg:col-span-1">
                <button
                  onClick={handleClearFilters}
                  className="w-full px-3 py-2 text-gray-700 hover:text-white hover:bg-red-500 rounded-xl bg-gray-100 hover:border-red-500 transition-all flex items-center justify-center border border-gray-200"
                  title="Limpiar filtros"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

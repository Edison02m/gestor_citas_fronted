'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UsageCard from './UsageCard';
import planesService from '@/services/planes.service';
import { ResumenUso } from '@/interfaces';

/**
 * Dashboard para mostrar el uso de recursos del negocio
 */
export default function UsageDashboard() {
  const router = useRouter();
  const [resumenUso, setResumenUso] = useState<ResumenUso | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarResumenUso();
  }, []);

  const cargarResumenUso = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await planesService.getResumenUso();
      setResumenUso(response.data);
    } catch (err: any) {
      console.error('Error al cargar resumen de uso:', err);
      setError(err.response?.data?.message || 'Error al cargar el uso de recursos');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-8">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="font-semibold text-red-900 text-lg">Error al cargar el uso</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={cargarResumenUso}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!resumenUso) {
    return null;
  }

  // Mapear recursos a iconos
  const recursos = [
    {
      nombre: 'Sucursales',
      icon: '🏢',
      usado: resumenUso.sucursales.usado,
      limite: resumenUso.sucursales.limite === null ? 'ilimitado' as const : resumenUso.sucursales.limite,
      porcentaje: resumenUso.sucursales.porcentaje,
    },
    {
      nombre: 'Empleados',
      icon: '👥',
      usado: resumenUso.empleados.usado,
      limite: resumenUso.empleados.limite === null ? 'ilimitado' as const : resumenUso.empleados.limite,
      porcentaje: resumenUso.empleados.porcentaje,
    },
    {
      nombre: 'Servicios',
      icon: '✂️',
      usado: resumenUso.servicios.usado,
      limite: resumenUso.servicios.limite === null ? 'ilimitado' as const : resumenUso.servicios.limite,
      porcentaje: resumenUso.servicios.porcentaje,
    },
    {
      nombre: 'Clientes',
      icon: '👤',
      usado: resumenUso.clientes.usado,
      limite: resumenUso.clientes.limite === null ? 'ilimitado' as const : resumenUso.clientes.limite,
      porcentaje: resumenUso.clientes.porcentaje,
    },
    {
      nombre: 'Citas este mes',
      icon: '📅',
      usado: resumenUso.citasMes.usado,
      limite: resumenUso.citasMes.limite === null ? 'ilimitado' as const : resumenUso.citasMes.limite,
      porcentaje: resumenUso.citasMes.porcentaje,
    },
    {
      nombre: 'WhatsApp este mes',
      icon: '💬',
      usado: resumenUso.whatsappMes.usado,
      limite: resumenUso.whatsappMes.limite === null ? 'ilimitado' as const : resumenUso.whatsappMes.limite,
      porcentaje: resumenUso.whatsappMes.porcentaje,
    },
    {
      nombre: 'Emails este mes',
      icon: '📧',
      usado: resumenUso.emailMes.usado,
      limite: resumenUso.emailMes.limite === null ? 'ilimitado' as const : resumenUso.emailMes.limite,
      porcentaje: resumenUso.emailMes.porcentaje,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Uso de Recursos
          </h2>
          <p className="text-sm text-gray-600">
            Plan actual:{' '}
            <span className="font-semibold text-[#0490C8] uppercase">
              {resumenUso.planActual}
            </span>
          </p>
        </div>

        <button
          onClick={() => router.push('/planes')}
          className="px-6 py-2.5 bg-[#0490C8] text-white rounded-lg hover:bg-[#023664] transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          Actualizar Plan
        </button>
      </div>

      {/* Grid de tarjetas de uso */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recursos.map((recurso, index) => (
          <UsageCard
            key={index}
            nombre={recurso.nombre}
            icon={recurso.icon}
            usado={recurso.usado}
            limite={recurso.limite}
            porcentaje={recurso.porcentaje}
          />
        ))}
      </div>

      {/* Footer con información adicional */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Los límites se renuevan según tu ciclo de facturación
          </span>
          <button
            onClick={cargarResumenUso}
            className="text-[#0490C8] hover:text-[#023664] font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
}

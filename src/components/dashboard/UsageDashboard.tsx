'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UsageCard from './UsageCard';
import planesService from '@/services/planes.service';
import { ResumenUso } from '@/interfaces';

type UsageDashboardProps = {
  variant?: 'standalone' | 'embedded';
};

/**
 * Dashboard para mostrar el uso de recursos del negocio
 */
export default function UsageDashboard({ variant = 'standalone' }: UsageDashboardProps) {
  const router = useRouter();
  const [resumenUso, setResumenUso] = useState<ResumenUso | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isStandalone = variant === 'standalone';

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
    if (isStandalone) {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-36"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-pulse space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-9 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    if (isStandalone) {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Error al cargar</h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={cargarResumenUso}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 mb-1">Error al cargar el uso de recursos</h3>
            <p className="text-xs text-red-700 mb-3">{error}</p>
            <button
              onClick={cargarResumenUso}
              className="px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!resumenUso) {
    return null;
  }

  // Mapear recursos con iconos SVG limpios
  const recursos = [
    {
      nombre: 'Sucursales',
      tipo: 'sucursales',
      usado: resumenUso.sucursales.usado,
      limite: resumenUso.sucursales.limite === null ? 'ilimitado' as const : resumenUso.sucursales.limite,
      porcentaje: resumenUso.sucursales.porcentaje,
    },
    {
      nombre: 'Empleados',
      tipo: 'empleados',
      usado: resumenUso.empleados.usado,
      limite: resumenUso.empleados.limite === null ? 'ilimitado' as const : resumenUso.empleados.limite,
      porcentaje: resumenUso.empleados.porcentaje,
    },
    {
      nombre: 'Servicios',
      tipo: 'servicios',
      usado: resumenUso.servicios.usado,
      limite: resumenUso.servicios.limite === null ? 'ilimitado' as const : resumenUso.servicios.limite,
      porcentaje: resumenUso.servicios.porcentaje,
    },
    {
      nombre: 'Clientes',
      tipo: 'clientes',
      usado: resumenUso.clientes.usado,
      limite: resumenUso.clientes.limite === null ? 'ilimitado' as const : resumenUso.clientes.limite,
      porcentaje: resumenUso.clientes.porcentaje,
    },
    {
      nombre: 'Citas este mes',
      tipo: 'citas',
      usado: resumenUso.citasMes.usado,
      limite: resumenUso.citasMes.limite === null ? 'ilimitado' as const : resumenUso.citasMes.limite,
      porcentaje: resumenUso.citasMes.porcentaje,
    },
    {
      nombre: 'WhatsApp este mes',
      tipo: 'whatsapp',
      usado: resumenUso.whatsappMes.usado,
      limite: resumenUso.whatsappMes.limite === null ? 'ilimitado' as const : resumenUso.whatsappMes.limite,
      porcentaje: resumenUso.whatsappMes.porcentaje,
    },
    {
      nombre: 'Emails este mes',
      tipo: 'emails',
      usado: resumenUso.emailMes.usado,
      limite: resumenUso.emailMes.limite === null ? 'ilimitado' as const : resumenUso.emailMes.limite,
      porcentaje: resumenUso.emailMes.porcentaje,
    },
  ];

  const headerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Plan actual</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {resumenUso.planActual.replace('_', ' ')}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">Controla tu consumo y límites disponibles</p>
      </div>

      <button
        onClick={() => router.push('/planes')}
        className="px-4 py-2 bg-[#0490C8] text-white text-xs font-semibold rounded-xl hover:bg-[#023664] transition-all duration-200 flex items-center gap-2 justify-center"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Actualizar Plan
      </button>
    </div>
  );

  const bodyContent = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recursos.map((recurso, index) => (
          <UsageCard
            key={index}
            nombre={recurso.nombre}
            tipo={recurso.tipo}
            usado={recurso.usado}
            limite={recurso.limite}
            porcentaje={recurso.porcentaje}
          />
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs sm:text-sm text-gray-500">
          Los límites se renuevan según tu ciclo de facturación
        </p>
        <button
          onClick={cargarResumenUso}
          className="text-[#0490C8] hover:text-[#023664] text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>
    </>
  );

  if (isStandalone) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 space-y-8">
        {headerContent}
        {bodyContent}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {headerContent}
      {bodyContent}
    </div>
  );
}

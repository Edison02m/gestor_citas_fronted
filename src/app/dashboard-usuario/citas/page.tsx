'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function CitasPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Citas</h1>
          <p className="text-sm text-gray-600 mt-1">Gestiona todas las citas de tu negocio</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Próximamente</h3>
          <p className="text-sm text-gray-500">La gestión de citas estará disponible pronto</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

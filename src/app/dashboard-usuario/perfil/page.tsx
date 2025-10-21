'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function PerfilPage() {
  const { user } = useAuth();
  const isUsuario = (user: any): user is any => user && 'negocio' in user;

  if (!isUsuario(user) || !user) return null;

  const usuarioData = user as any;

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
          <p className="text-sm text-gray-600 mt-1">Información de tu cuenta y negocio</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Nombre</label>
                <p className="text-sm text-gray-900 mt-1">{usuarioData.nombre}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900 mt-1">{usuarioData.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Rol</label>
                <p className="text-sm text-gray-900 mt-1">{usuarioData.rol}</p>
              </div>
            </div>
          </div>

          {/* Información del Negocio */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Negocio</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Nombre del Negocio</label>
                <p className="text-sm text-gray-900 mt-1">{usuarioData.negocio?.nombre}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Teléfono</label>
                <p className="text-sm text-gray-900 mt-1">{usuarioData.negocio?.telefono}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Estado Suscripción</label>
                <p className="text-sm text-gray-900 mt-1">{usuarioData.negocio?.estadoSuscripcion}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

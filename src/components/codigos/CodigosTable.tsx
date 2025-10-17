'use client';

import { CodigoSuscripcion, PlanSuscripcion } from '@/interfaces';
import { formatearFecha } from '@/utils/format';

interface CodigosTableProps {
  codigos: CodigoSuscripcion[];
  onDelete?: (id: string) => void;
  onView?: (codigo: CodigoSuscripcion) => void;
}

const planLabels: Record<PlanSuscripcion, string> = {
  PRUEBA: 'Prueba (7 días)',
  MENSUAL: 'Mensual',
  TRIMESTRAL: 'Trimestral',
  SEMESTRAL: 'Semestral',
  ANUAL: 'Anual',
  PERSONALIZADO: 'Personalizado',
};

const planColors: Record<PlanSuscripcion, string> = {
  PRUEBA: 'bg-purple-100 text-purple-800',
  MENSUAL: 'bg-blue-100 text-blue-800',
  TRIMESTRAL: 'bg-green-100 text-green-800',
  SEMESTRAL: 'bg-yellow-100 text-yellow-800',
  ANUAL: 'bg-red-100 text-red-800',
  PERSONALIZADO: 'bg-gray-100 text-gray-800',
};

export default function CodigosTable({ codigos, onDelete, onView }: CodigosTableProps) {
  const getEstadoBadge = (codigo: CodigoSuscripcion) => {
    // Verificar si está expirado
    if (codigo.fechaExpiracion && new Date(codigo.fechaExpiracion) < new Date()) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Expirado</span>;
    }

    // Verificar si ya se usó completamente
    if (codigo.vecesUsado >= codigo.usoMaximo) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Usado</span>;
    }

    // Disponible
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Disponible</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duración
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Uso
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expira
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Creado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {codigos.map((codigo) => (
            <tr key={codigo.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900 font-mono">
                      {codigo.codigo}
                    </div>
                    {codigo.descripcion && (
                      <div className="text-sm text-gray-500">{codigo.descripcion}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${planColors[codigo.plan]}`}>
                  {planLabels[codigo.plan]}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {codigo.plan === PlanSuscripcion.PRUEBA ? '7 días' : `${codigo.duracionMeses} mes${codigo.duracionMeses > 1 ? 'es' : ''}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {codigo.vecesUsado} / {codigo.usoMaximo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getEstadoBadge(codigo)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {codigo.fechaExpiracion ? formatearFecha(codigo.fechaExpiracion) : 'Sin límite'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatearFecha(codigo.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onView?.(codigo)}
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Ver
                </button>
                {codigo.vecesUsado === 0 && (
                  <button
                    onClick={() => onDelete?.(codigo.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {codigos.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay códigos</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo código de suscripción.</p>
        </div>
      )}
    </div>
  );
}

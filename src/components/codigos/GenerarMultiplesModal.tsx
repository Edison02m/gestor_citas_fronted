'use client';

import { useState } from 'react';
import { PlanSuscripcion } from '@/interfaces';

interface GenerarMultiplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function GenerarMultiplesModal({ isOpen, onClose, onSubmit }: GenerarMultiplesModalProps) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanSuscripcion>(PlanSuscripcion.GRATIS);
  const [duracionDias, setDuracionDias] = useState(14);
  const [cantidad, setCantidad] = useState(10);
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [usoMaximo, setUsoMaximo] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: any = {
        plan,
        duracionDias,
        cantidad,
        descripcion: descripcion || undefined,
        precio: precio ? parseFloat(precio) : undefined,
        usoMaximo,
      };

      await onSubmit(data);
      
      // Resetear formulario
      setPlan(PlanSuscripcion.GRATIS);
      setDuracionDias(14);
      setCantidad(10);
      setDescripcion('');
      setPrecio('');
      setUsoMaximo(1);
      onClose();
    } catch (error) {
      // Log removido
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Generar Múltiples Códigos</h3>
              <p className="mt-1 text-sm text-gray-500">Crea varios códigos a la vez con la misma configuración</p>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Cantidad de Códigos *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Máximo 100 códigos por lote</p>
              </div>

              {/* Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan *</label>
                <select
                  value={plan}
                  onChange={(e) => {
                    const newPlan = e.target.value as PlanSuscripcion;
                    setPlan(newPlan);
                    // Auto-ajustar duración según plan
                    if (newPlan === PlanSuscripcion.GRATIS) setDuracionDias(14);
                    else if (newPlan === PlanSuscripcion.PRO_MENSUAL) setDuracionDias(30);
                    else if (newPlan === PlanSuscripcion.PRO_ANUAL) setDuracionDias(365);
                    else if (newPlan === PlanSuscripcion.PRO_PLUS_MENSUAL) setDuracionDias(30);
                    else if (newPlan === PlanSuscripcion.PRO_PLUS_ANUAL) setDuracionDias(365);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
                  required
                >
                  <option value={PlanSuscripcion.GRATIS}>Gratis (14 días)</option>
                  <option value={PlanSuscripcion.PRO_MENSUAL}>PRO Mensual (30 días)</option>
                  <option value={PlanSuscripcion.PRO_ANUAL}>PRO Anual (365 días)</option>
                  <option value={PlanSuscripcion.PRO_PLUS_MENSUAL}>PRO PLUS Mensual (30 días)</option>
                  <option value={PlanSuscripcion.PRO_PLUS_ANUAL}>PRO PLUS Anual (365 días)</option>
                  <option value={PlanSuscripcion.PERSONALIZADO}>Personalizado</option>
                </select>
              </div>

              {/* Duración */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Duración (días) *</label>
                <input
                  type="number"
                  min="1"
                  value={duracionDias}
                  onChange={(e) => setDuracionDias(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción Base</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Se numerará automáticamente"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-400"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-400"
                />
              </div>

              {/* Uso Máximo */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Uso Máximo por Código *</label>
                <input
                  type="number"
                  min="1"
                  value={usoMaximo}
                  onChange={(e) => setUsoMaximo(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
                  required
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Generando...' : `Generar ${cantidad} Código${cantidad > 1 ? 's' : ''}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

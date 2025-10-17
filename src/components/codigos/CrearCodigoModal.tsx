'use client';

import { useState } from 'react';
import { PlanSuscripcion } from '@/interfaces';

interface CrearCodigoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function CrearCodigoModal({ isOpen, onClose, onSubmit }: CrearCodigoModalProps) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanSuscripcion>(PlanSuscripcion.MENSUAL);
  const [duracionMeses, setDuracionMeses] = useState(1);
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [usoMaximo, setUsoMaximo] = useState(1);
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [motivoCreacion, setMotivoCreacion] = useState('');
  const [notas, setNotas] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: any = {
        plan,
        duracionMeses: plan === PlanSuscripcion.PRUEBA ? 0 : duracionMeses,
        descripcion: descripcion || undefined,
        precio: precio ? parseFloat(precio) : undefined,
        usoMaximo,
        fechaExpiracion: fechaExpiracion || undefined,
        motivoCreacion: motivoCreacion || undefined,
        notas: notas || undefined,
      };

      await onSubmit(data);
      
      // Resetear formulario
      setPlan(PlanSuscripcion.MENSUAL);
      setDuracionMeses(1);
      setDescripcion('');
      setPrecio('');
      setUsoMaximo(1);
      setFechaExpiracion('');
      setMotivoCreacion('');
      setNotas('');
      onClose();
    } catch (error) {
      console.error('Error al crear código:', error);
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Crear Código de Suscripción</h3>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan *</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as PlanSuscripcion)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
                  required
                >
                  <option value={PlanSuscripcion.PRUEBA}>Prueba (7 días gratis)</option>
                  <option value={PlanSuscripcion.MENSUAL}>Mensual (1 mes)</option>
                  <option value={PlanSuscripcion.TRIMESTRAL}>Trimestral (3 meses)</option>
                  <option value={PlanSuscripcion.SEMESTRAL}>Semestral (6 meses)</option>
                  <option value={PlanSuscripcion.ANUAL}>Anual (12 meses)</option>
                  <option value={PlanSuscripcion.PERSONALIZADO}>Personalizado</option>
                </select>
              </div>

              {/* Duración (solo si no es PRUEBA) */}
              {plan !== PlanSuscripcion.PRUEBA && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duración (meses) *</label>
                  <input
                    type="number"
                    min="1"
                    value={duracionMeses}
                    onChange={(e) => setDuracionMeses(parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
                    required
                  />
                </div>
              )}

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: Código promocional Black Friday"
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

              <div className="grid grid-cols-2 gap-4">
                {/* Uso Máximo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Uso Máximo *</label>
                  <input
                    type="number"
                    min="1"
                    value={usoMaximo}
                    onChange={(e) => setUsoMaximo(parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Cuántas veces se puede usar este código</p>
                </div>

                {/* Fecha de expiración */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Expiración</label>
                  <input
                    type="date"
                    value={fechaExpiracion}
                    onChange={(e) => setFechaExpiracion(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
                  />
                  <p className="mt-1 text-xs text-gray-500">Opcional: después de esta fecha no se podrá usar</p>
                </div>
              </div>

              {/* Motivo de Creación */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Motivo de Creación</label>
                <input
                  type="text"
                  value={motivoCreacion}
                  onChange={(e) => setMotivoCreacion(e.target.value)}
                  placeholder="Ej: Campaña de lanzamiento"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-400"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Notas</label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={3}
                  placeholder="Notas adicionales..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-400"
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
                {loading ? 'Creando...' : 'Crear Código'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

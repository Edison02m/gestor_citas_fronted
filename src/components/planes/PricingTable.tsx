'use client';

import { useEffect, useState } from 'react';
import PlanCard from './PlanCard';
import planesService from '@/services/planes.service';
import { Plan, TipoPlan } from '@/interfaces';

interface PricingTableProps {
  currentPlanId?: TipoPlan | null;
  onPlanSelect: (planId: string) => Promise<void>;
}

/**
 * Tabla de comparación de planes
 */
export default function PricingTable({ currentPlanId, onPlanSelect }: PricingTableProps) {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'mensual' | 'anual'>('mensual');

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = async () => {
    try {
      setIsLoading(true);
      const response = await planesService.getPlanesDisponibles();
      setPlanes(response.data);
    } catch (error) {
      console.error('Error al cargar planes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = async (planId: string) => {
    try {
      setIsSelecting(planId);
      await onPlanSelect(planId);
    } catch (error) {
      console.error('Error al seleccionar plan:', error);
    } finally {
      setIsSelecting(null);
    }
  };

  // Filtrar planes por periodo seleccionado
  const planesFiltrados = planes.filter((plan) => {
    if (plan.periodo === 'gratis') return true;
    return plan.periodo === periodoSeleccionado;
  });

  // Agrupar por tipo de plan (GRATIS, PRO, PRO_PLUS)
  const planGratis = planesFiltrados.find((p) => p.id === 'GRATIS');
  const planPro = planesFiltrados.find((p) => p.id.startsWith('PRO_') && !p.id.startsWith('PRO_PLUS'));
  const planProPlus = planesFiltrados.find((p) => p.id.startsWith('PRO_PLUS'));

  const planesOrdenados = [planGratis, planPro, planProPlus].filter(Boolean) as Plan[];

  // Obtener precios mensuales para calcular ahorro en planes anuales
  const getPrecioMensualEquivalente = (plan: Plan): number | undefined => {
    if (plan.periodo !== 'anual') return undefined;
    
    // Buscar el plan mensual correspondiente
    if (plan.id.startsWith('PRO_PLUS_ANUAL')) {
      const planMensual = planes.find((p) => p.id === 'PRO_PLUS_MENSUAL');
      return planMensual?.precio;
    } else if (plan.id.startsWith('PRO_ANUAL')) {
      const planMensual = planes.find((p) => p.id === 'PRO_MENSUAL');
      return planMensual?.precio;
    }
    
    return undefined;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[600px] bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Toggle mensual/anual - estilo minimalista */}
      <div className="flex justify-center mb-12">
        <div className="bg-gray-50 rounded-full p-1 inline-flex border border-gray-200">
          <button
            onClick={() => setPeriodoSeleccionado('mensual')}
            className={`px-8 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
              periodoSeleccionado === 'mensual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setPeriodoSeleccionado('anual')}
            className={`px-8 py-2.5 rounded-full font-medium text-sm transition-all duration-200 relative ${
              periodoSeleccionado === 'anual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Anual
            <span className="absolute -top-2 -right-2 bg-[#0490C8] text-white text-xs px-2 py-0.5 rounded-full font-medium">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Grid de planes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {planesOrdenados.map((plan) => (
          <div key={plan.id} className={plan.esPopular ? 'md:scale-[1.02]' : ''}>
            <PlanCard
              plan={plan}
              isCurrentPlan={plan.id === currentPlanId}
              onSelect={handlePlanSelect}
              isLoading={isSelecting === plan.id}
              precioMensualEquivalente={getPrecioMensualEquivalente(plan)}
            />
          </div>
        ))}
      </div>

      {/* Tabla de comparación de características */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Compara todas las características
          </h3>
          <p className="text-sm text-gray-600">
            Encuentra el plan que mejor se adapte a tus necesidades
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header de la tabla */}
          <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
            <div className="font-semibold text-sm text-gray-900">Características</div>
            <div className="text-center font-semibold text-sm text-gray-900">Gratis</div>
            <div className="text-center font-semibold text-sm text-[#0490C8]">PRO</div>
            <div className="text-center font-semibold text-sm text-gray-900">PRO PLUS</div>
          </div>

          {/* Sección: Gestión de Agenda */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Gestión de Agenda</h4>
            
            <div className="grid grid-cols-4 gap-4 py-3 items-center">
              <div className="text-sm text-gray-700">Vista de calendario</div>
              <div className="flex justify-center">
                <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex justify-center">
                <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex justify-center">
                <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 py-3 items-center bg-gray-50">
              <div className="text-sm text-gray-700">Recordatorios automáticos</div>
              <div className="flex justify-center">
                <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex justify-center">
                <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex justify-center">
                <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 py-3 items-center">
              <div className="text-sm text-gray-700">Gestión de empleados</div>
              <div className="text-center text-sm font-semibold text-gray-700">
                {planGratis?.limiteEmpleados === 'ilimitado' ? '∞' : planGratis?.limiteEmpleados}
              </div>
              <div className="text-center text-sm font-semibold text-gray-700">
                {planPro?.limiteEmpleados === 'ilimitado' ? '∞' : planPro?.limiteEmpleados}
              </div>
              <div className="text-center text-sm font-semibold text-[#0490C8]">
                {planProPlus?.limiteEmpleados === 'ilimitado' ? '∞' : planProPlus?.limiteEmpleados}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 py-3 items-center bg-gray-50">
              <div className="text-sm text-gray-700">Múltiples sucursales</div>
              <div className="text-center text-sm font-semibold text-gray-700">
                {planGratis?.limiteSucursales === 'ilimitado' ? '∞' : planGratis?.limiteSucursales}
              </div>
              <div className="text-center text-sm font-semibold text-gray-700">
                {planPro?.limiteSucursales === 'ilimitado' ? '∞' : planPro?.limiteSucursales}
              </div>
              <div className="text-center text-sm font-semibold text-[#0490C8]">
                {planProPlus?.limiteSucursales === 'ilimitado' ? '∞' : planProPlus?.limiteSucursales}
              </div>
            </div>
          </div>

          {/* Sección: Clientes y Comunicación */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Clientes y Comunicación</h4>
            
            <div className="grid grid-cols-4 gap-4 py-3 items-center">
              <div className="text-sm text-gray-700">Base de clientes</div>
              <div className="text-center text-sm font-semibold text-gray-700">
                {planGratis?.limiteClientes === 'ilimitado' ? '∞' : planGratis?.limiteClientes}
              </div>
              <div className="text-center text-sm font-semibold text-gray-700">
                {planPro?.limiteClientes === 'ilimitado' ? '∞' : planPro?.limiteClientes}
              </div>
              <div className="text-center text-sm font-semibold text-[#0490C8]">
                {planProPlus?.limiteClientes === 'ilimitado' ? '∞' : planProPlus?.limiteClientes}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 py-3 items-center bg-gray-50">
              <div className="text-sm text-gray-700">Integración WhatsApp</div>
              <div className="flex justify-center">
                {planGratis?.limiteWhatsAppMes === 'ilimitado' || planGratis?.limiteWhatsAppMes === 0 || !planGratis?.limiteWhatsAppMes ? (
                  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold text-gray-700">{planGratis?.limiteWhatsAppMes}/mes</span>
                )}
              </div>
              <div className="text-center text-sm font-semibold text-gray-700">
                {planPro?.limiteWhatsAppMes === 'ilimitado' ? '∞' : `${planPro?.limiteWhatsAppMes}/mes`}
              </div>
              <div className="text-center text-sm font-semibold text-[#0490C8]">
                {planProPlus?.limiteWhatsAppMes === 'ilimitado' ? '∞' : planProPlus?.limiteWhatsAppMes}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 py-3 items-center">
              <div className="text-sm text-gray-700">Emails por mes</div>
              <div className="text-center text-sm font-semibold text-gray-700">
                {planGratis?.limiteEmailMes === 'ilimitado' ? '∞' : planGratis?.limiteEmailMes}
              </div>
              <div className="text-center text-sm font-semibold text-gray-700">
                {planPro?.limiteEmailMes === 'ilimitado' ? '∞' : planPro?.limiteEmailMes}
              </div>
              <div className="text-center text-sm font-semibold text-[#0490C8]">
                {planProPlus?.limiteEmailMes === 'ilimitado' ? '∞' : planProPlus?.limiteEmailMes}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 py-3 items-center bg-gray-50">
              <div className="text-sm text-gray-700">Citas por mes</div>
              <div className="text-center text-sm font-semibold text-gray-700">
                {planGratis?.limiteCitasMes === 'ilimitado' ? '∞' : planGratis?.limiteCitasMes}
              </div>
              <div className="text-center text-sm font-semibold text-[#0490C8]">
                {planPro?.limiteCitasMes === 'ilimitado' ? '∞' : planPro?.limiteCitasMes}
              </div>
              <div className="text-center text-sm font-semibold text-[#0490C8]">
                {planProPlus?.limiteCitasMes === 'ilimitado' ? '∞' : planProPlus?.limiteCitasMes}
              </div>
            </div>
          </div>

          {/* Sección: Análisis y Reportes */}
          <div className="p-6">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Análisis y Reportes</h4>
            
            <div className="grid grid-cols-4 gap-4 py-3 items-center">
              <div className="text-sm text-gray-700">Dashboard básico</div>
              <div className="flex justify-center">
                <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex justify-center">
                <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex justify-center">
                <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 py-3 items-center bg-gray-50">
              <div className="text-sm text-gray-700">Reportes avanzados</div>
              <div className="flex justify-center">
                {planGratis?.reportesAvanzados ? (
                  <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex justify-center">
                {planPro?.reportesAvanzados ? (
                  <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex justify-center">
                {planProPlus?.reportesAvanzados ? (
                  <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 py-3 items-center">
              <div className="text-sm text-gray-700">Exportar datos</div>
              <div className="flex justify-center">
                {planGratis?.reportesAvanzados ? (
                  <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex justify-center">
                {planPro?.reportesAvanzados ? (
                  <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex justify-center">
                {planProPlus?.reportesAvanzados ? (
                  <svg className="w-5 h-5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Garantía - estilo minimalista */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-50 text-gray-900 px-5 py-2.5 rounded-full border border-gray-200">
          <svg className="w-4 h-4 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium text-sm">
            Garantía de satisfacción - Cancela cuando quieras
          </span>
        </div>
      </div>
    </div>
  );
}

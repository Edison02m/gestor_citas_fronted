'use client';

import { Plan } from '@/interfaces';

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  onSelect: (planId: string) => void;
  isLoading?: boolean;
  precioMensualEquivalente?: number; // Precio del plan mensual para calcular ahorro
}

/**
 * Tarjeta individual de un plan de suscripción
 */
export default function PlanCard({ plan, isCurrentPlan = false, onSelect, isLoading = false, precioMensualEquivalente }: PlanCardProps) {
  const formatPrecio = (precio: number) => {
    if (precio === 0) return 'Gratis';
    return `$${precio}`;
  };

  const formatLimite = (limite: number | 'ilimitado') => {
    return limite === 'ilimitado' ? '∞' : limite.toString();
  };

  // Calcular ahorro real para planes anuales
  const calcularAhorro = () => {
    if (plan.periodo !== 'anual' || !precioMensualEquivalente || plan.precio === 0) {
      return null;
    }
    
    const costoMensual = precioMensualEquivalente * 12;
    const costoAnual = plan.precio * 12;
    const ahorroTotal = costoMensual - costoAnual;
    const mesesAhorrados = Math.round(ahorroTotal / precioMensualEquivalente);
    const porcentajeAhorro = Math.round((ahorroTotal / costoMensual) * 100);
    
    return { ahorroTotal, mesesAhorrados, porcentajeAhorro };
  };

  const ahorro = calcularAhorro();
  
  // Los planes PRO (Mensual y Anual) siempre son los más populares
  const esMasPopular = plan.id === 'PRO_ANUAL' || plan.id === 'PRO_MENSUAL' || 
                       plan.nombre === 'PRO Anual' || plan.nombre === 'PRO Mensual';

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden h-full flex flex-col ${
        esMasPopular
          ? 'border-[#0490C8] shadow-lg'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      } ${isCurrentPlan ? 'border-[#0490C8] shadow-lg' : ''}`}
    >
      {/* Badge de popular o plan actual */}
      {esMasPopular && !isCurrentPlan && (
        <div className="absolute top-0 right-0 bg-[#0490C8] text-white px-4 py-2 text-xs font-bold rounded-bl-xl flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Más Popular
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute top-0 right-0 bg-[#0490C8] text-white px-4 py-2 text-xs font-bold rounded-bl-xl flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Tu Plan
        </div>
      )}

      <div className="p-6 flex flex-col h-full">
        {/* Header del plan */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.nombre}</h3>
          <p className="text-sm text-gray-600 mb-5 min-h-[40px]">{plan.descripcion}</p>
          
          {/* Precio */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold text-gray-900">
              {formatPrecio(plan.precio)}
            </span>
            {plan.precio > 0 && (
              <span className="text-gray-500 text-base font-medium">
                /mes
              </span>
            )}
          </div>
          
          {plan.precio === 0 && (
            <p className="text-sm text-gray-600 mt-2 font-medium">14 días de prueba</p>
          )}
          
          {plan.periodo === 'anual' && plan.precio > 0 && (
            <>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                Total: ${(plan.precio * 12).toFixed(2)} USD/año
              </p>
              {ahorro && (
                <div className="inline-flex items-center gap-1.5 bg-[#59C7F3]/10 text-[#0490C8] px-3 py-1.5 rounded-full text-xs font-bold mt-2">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Ahorra {ahorro.mesesAhorrados} {ahorro.mesesAhorrados === 1 ? 'mes' : 'meses'} ({ahorro.porcentajeAhorro}%)
                </div>
              )}
            </>
          )}
        </div>

        {/* Límites - Formato compacto */}
        <div className="mb-5 pb-5 border-b border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{formatLimite(plan.limiteSucursales)} sucursales</span>
              <span className="text-gray-600">{formatLimite(plan.limiteEmpleados)} empleados</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{formatLimite(plan.limiteServicios)} servicios</span>
              <span className="text-gray-600">{formatLimite(plan.limiteClientes)} clientes</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{formatLimite(plan.limiteCitasMes)} citas/mes</span>
              <span className="text-gray-600">{formatLimite(plan.limiteWhatsAppMes)} WhatsApp/mes</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{formatLimite(plan.limiteEmailMes)} emails/mes</span>
              <span className="text-gray-600"></span>
            </div>
          </div>
        </div>

        {/* Características clave - Más concisas */}
        <div className="mb-6 flex-grow">
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-[#0490C8] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Agenda inteligente y recordatorios</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-[#0490C8] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Integración con WhatsApp Business</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-[#0490C8] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Gestión de múltiples sucursales</span>
            </li>
            {plan.reportesAvanzados && (
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-[#0490C8] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Reportes y análisis avanzados</span>
              </li>
            )}
          </ul>
        </div>

        {/* Botón de acción */}
        <div className="mt-auto">
        <button
          onClick={() => {
            // Temporalmente deshabilitado - cambio de planes próximamente
            alert('🚧 Cambio de planes próximamente\n\nEsta funcionalidad estará disponible muy pronto. Por ahora, puedes explorar los planes disponibles.');
          }}
          disabled={isCurrentPlan}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300 cursor-not-allowed'
          }`}
        >
          {isCurrentPlan ? (
            'Plan Actual'
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Próximamente
            </div>
          )}
        </button>

        {!isCurrentPlan && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-3 font-medium">
            <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Cambio de planes en desarrollo</span>
          </div>
        )}
        
        {isCurrentPlan && plan.precio === 0 && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-3 font-medium">
            <svg className="w-3.5 h-3.5 text-[#0490C8]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Sin tarjeta de crédito</span>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

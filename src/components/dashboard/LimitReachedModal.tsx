'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LimitReachedDetail {
  message: string;
  recurso: string;
  limiteActual?: number;
  planActual?: string;
}

/**
 * Modal que se muestra cuando se alcanza un límite del plan (HTTP 402)
 */
export default function LimitReachedModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState<LimitReachedDetail>({
    message: 'Has alcanzado el límite de tu plan actual',
    recurso: 'recurso',
  });

  useEffect(() => {
    const handleLimitReached = (event: CustomEvent<LimitReachedDetail>) => {
      setDetails(event.detail);
      setIsOpen(true);
    };

    // Escuchar el evento emitido por api.ts
    window.addEventListener('limitReached', handleLimitReached as EventListener);

    return () => {
      window.removeEventListener('limitReached', handleLimitReached as EventListener);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleVerPlanes = () => {
    setIsOpen(false);
    router.push('/planes');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Límite Alcanzado</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Icono de advertencia */}
          <div className="flex justify-center">
            <div className="bg-yellow-50 rounded-full p-3">
              <svg
                className="w-10 h-10 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Mensaje */}
          <div className="text-center">
            <p className="text-sm text-gray-700 mb-3">{details.message}</p>
            
            {details.limiteActual !== undefined && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-left">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recurso:</span>
                    <span className="font-medium text-gray-900 capitalize">{details.recurso}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Límite actual:</span>
                    <span className="font-medium text-gray-900">
                      {details.limiteActual === 0 ? 'Ilimitado' : details.limiteActual}
                    </span>
                  </div>
                  {details.planActual && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan actual:</span>
                      <span className="font-medium text-[#0490C8] uppercase text-xs">
                        {details.planActual}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Beneficios de actualizar */}
          <div className="bg-[#59C7F3]/10 rounded-lg p-4 border border-[#59C7F3]/30">
            <p className="text-sm font-medium text-gray-900 mb-2">
              💎 Actualiza tu plan para obtener:
            </p>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-[#0490C8] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Más {details.recurso}</span>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-[#0490C8] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Funcionalidades avanzadas</span>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-[#0490C8] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Soporte prioritario</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleVerPlanes}
            className="flex-1 px-4 py-2 bg-[#0490C8] text-white rounded-lg text-sm font-medium hover:bg-[#023664] transition-colors"
          >
            Ver Planes
          </button>
        </div>
      </div>
    </div>
  );
}

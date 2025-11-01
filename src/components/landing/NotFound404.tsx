'use client';

import { useEffect, useState } from 'react';

interface NotFound404Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function NotFound404({
  title = 'Página no encontrada',
  message = 'Lo sentimos, el enlace que estás buscando no existe o ha sido desactivado.',
  onRetry,
  showRetry = false
}: NotFound404Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 overflow-hidden">
      {/* Fondo animado con círculos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#0490C8]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        <div className="text-center">
          {/* Ilustración SVG moderna */}
          <div className={`mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <svg
              className="w-64 h-64 sm:w-80 sm:h-80 mx-auto"
              viewBox="0 0 400 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Planeta/Círculo principal */}
              <circle cx="200" cy="150" r="80" fill="#0490C8" opacity="0.1" />
              <circle cx="200" cy="150" r="60" fill="#0490C8" opacity="0.2" />
              
              {/* Astronauta simplificado */}
              <g className="animate-float">
                {/* Cuerpo */}
                <ellipse cx="200" cy="120" rx="25" ry="30" fill="white" stroke="#0490C8" strokeWidth="3"/>
                {/* Cabeza/Casco */}
                <circle cx="200" cy="85" r="20" fill="white" stroke="#0490C8" strokeWidth="3"/>
                <circle cx="200" cy="85" r="12" fill="#0490C8" opacity="0.3"/>
                {/* Brazos */}
                <line x1="175" y1="120" x2="160" y2="140" stroke="#0490C8" strokeWidth="3" strokeLinecap="round"/>
                <line x1="225" y1="120" x2="240" y2="140" stroke="#0490C8" strokeWidth="3" strokeLinecap="round"/>
                {/* Piernas */}
                <line x1="190" y1="150" x2="185" y2="170" stroke="#0490C8" strokeWidth="3" strokeLinecap="round"/>
                <line x1="210" y1="150" x2="215" y2="170" stroke="#0490C8" strokeWidth="3" strokeLinecap="round"/>
              </g>

              {/* Estrellas */}
              <g className="animate-pulse" opacity="0.6">
                <circle cx="100" cy="50" r="2" fill="#0490C8"/>
                <circle cx="150" cy="30" r="3" fill="#0490C8"/>
                <circle cx="280" cy="60" r="2" fill="#0490C8"/>
                <circle cx="320" cy="100" r="3" fill="#0490C8"/>
                <circle cx="90" cy="180" r="2" fill="#0490C8"/>
                <circle cx="300" cy="200" r="3" fill="#0490C8"/>
              </g>

              {/* Texto 404 integrado */}
              <text x="200" y="240" fontSize="72" fontWeight="bold" fill="#0490C8" opacity="0.2" textAnchor="middle" fontFamily="system-ui">404</text>
            </svg>
          </div>

          {/* Título */}
          <h1 className={`text-4xl sm:text-5xl font-bold text-gray-900 mb-4 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {title}
          </h1>

          {/* Mensaje */}
          <p className={`text-gray-600 text-lg mb-8 max-w-md mx-auto transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {message}
          </p>

          {/* Botones de acción */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="group relative px-8 py-3 bg-[#0490C8] text-white rounded-full font-medium overflow-hidden transition-all hover:shadow-xl hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0490C8] to-cyan-500 transition-opacity group-hover:opacity-100 opacity-0"></div>
                <div className="relative flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reintentar</span>
                </div>
              </button>
            )}
            
            <button
              onClick={() => window.location.href = '/'}
              className="group px-8 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-all hover:scale-105"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Volver al inicio</span>
              </div>
            </button>
          </div>

          {/* Mensaje adicional */}
          <p className={`mt-8 text-sm text-gray-400 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            Error 404 - Recurso no encontrado
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

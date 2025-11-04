'use client';

import { resetTour } from '@/utils/tours';

interface HelpButtonProps {
  tourKey: string;
  tooltip?: string;
}

/**
 * Botón flotante de ayuda para reiniciar tours
 */
export default function HelpButton({ tourKey, tooltip = 'Ver tutorial de esta página' }: HelpButtonProps) {
  const handleClick = () => {
    resetTour(tourKey);
    window.location.reload();
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-[#0490C8] text-white rounded-full shadow-lg hover:bg-[#037ab0] hover:scale-110 transition-all z-50 flex items-center justify-center group"
      title={tooltip}
      aria-label={tooltip}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      
      {/* Tooltip al hover */}
      <span className="absolute bottom-full right-0 mb-2 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {tooltip}
      </span>
    </button>
  );
}

import { useEffect } from 'react';
import { driver, DriveStep, Config } from 'driver.js';
import 'driver.js/dist/driver.css';
import '@/styles/driver-custom.css';
import { hasSeenTour, markTourCompleted } from '@/utils/tours';

interface UseTourOptions {
  tourKey: string;
  steps: DriveStep[];
  autoStart?: boolean;
  onComplete?: () => void;
}

/**
 * Hook para gestionar tours guiados en la aplicación
 * @param tourKey - Identificador único del tour
 * @param steps - Pasos del tour
 * @param autoStart - Si debe iniciar automáticamente (default: true)
 * @param onComplete - Callback cuando se completa el tour
 */
export const useTour = ({ 
  tourKey, 
  steps, 
  autoStart = true,
  onComplete 
}: UseTourOptions) => {
  useEffect(() => {
    // No ejecutar en servidor
    if (typeof window === 'undefined') return;
    
    // No iniciar si ya fue visto o autoStart está desactivado
    if (!autoStart || hasSeenTour(tourKey)) return;
    
    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: '¡Entendido!',
      steps: steps,
      animate: true,
      overlayOpacity: 0, // Sin fondo oscuro
      smoothScroll: true,
      onDestroyed: () => {
        markTourCompleted(tourKey);
        onComplete?.();
      },
    };
    
    const driverObj = driver(config);
    
    // Iniciar con un pequeño delay para asegurar que el DOM está listo
    const timeout = setTimeout(() => {
      driverObj.drive();
    }, 800);
    
    return () => clearTimeout(timeout);
  }, [tourKey, autoStart, steps, onComplete]);
};

/**
 * Función para iniciar manualmente un tour
 */
export const startTour = (tourKey: string, steps: DriveStep[], onComplete?: () => void) => {
  const config: Config = {
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    nextBtnText: 'Siguiente',
    prevBtnText: 'Anterior',
    doneBtnText: '¡Entendido!',
    steps: steps,
    onDestroyed: () => {
      markTourCompleted(tourKey);
      onComplete?.();
    },
  };
  
  const driverObj = driver(config);
  driverObj.drive();
};

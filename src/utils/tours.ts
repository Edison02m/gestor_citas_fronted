// Claves de tours disponibles
export const TOURS = {
  GENERAL: 'tour_general_completed',
  CITAS: 'tour_citas_completed',
  CONFIGURACION: 'tour_configuracion_completed',
  EMPLEADOS: 'tour_empleados_completed',
  SERVICIOS: 'tour_servicios_completed',
  SUCURSALES: 'tour_sucursales_completed',
  CLIENTES: 'tour_clientes_completed',
} as const;

/**
 * Verifica si un tour ya fue completado
 */
export const hasSeenTour = (tourKey: string): boolean => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(tourKey) === 'true';
};

/**
 * Marca un tour como completado
 */
export const markTourCompleted = (tourKey: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(tourKey, 'true');
};

/**
 * Reinicia un tour específico
 */
export const resetTour = (tourKey: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(tourKey);
};

/**
 * Reinicia todos los tours
 */
export const resetAllTours = (): void => {
  if (typeof window === 'undefined') return;
  Object.values(TOURS).forEach(resetTour);
};

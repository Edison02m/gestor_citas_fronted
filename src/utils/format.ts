/**
 * Parse a date string in YYYY-MM-DD format to a local Date object
 * Avoids UTC conversion issues
 */
export function parseDateLocal(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Convert string or Date to Date object safely
 */
export function toDate(date: string | Date): Date {
  if (date instanceof Date) {
    return date;
  }
  
  if (typeof date === 'string') {
    // Extract just the date part if it's an ISO datetime string
    // Handles: "2024-10-23", "2024-10-23T00:00:00", "2024-10-23T00:00:00.000Z"
    const dateMatch = date.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return parseDateLocal(dateMatch[1]);
    }
  }
  
  // Fallback to Date constructor (for other datetime formats)
  return new Date(date);
}

export function formatDateTime(date: string | Date): string {
  const d = toDate(date);
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(date: string | Date): string {
  const d = toDate(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatearFecha(date: string | Date): string {
  const d = toDate(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// Exported format object with utility functions
export const format = {
  date: (date: string | Date): string => {
    const d = toDate(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },
  
  currency: (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  },
  
  time: (time: string): string => {
    return time;
  },
};

// Formatear fecha para inputs (YYYY-MM-DD)
export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


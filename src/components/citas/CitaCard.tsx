import { Cita, EstadoCita } from '@/interfaces';
import { format } from '@/utils/format';

interface CitaCardProps {
  cita: Cita;
  onClick?: () => void;
}

export default function CitaCard({ cita, onClick }: CitaCardProps) {
  const getEstadoBadge = (estado: EstadoCita) => {
    const badges = {
      [EstadoCita.PENDIENTE]: '⏳',
      [EstadoCita.CONFIRMADA]: '✓',
      [EstadoCita.COMPLETADA]: '✓✓',
      [EstadoCita.CANCELADA]: '✕',
      [EstadoCita.NO_ASISTIO]: '⊘',
    };
    return badges[estado] || '';
  };

  const backgroundColor = cita.servicio?.color || '#0490C8';
  
  // Calcular si el color es claro u oscuro para ajustar el texto
  const isLightColor = (hex: string) => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 180;
  };

  const textColor = isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
  const borderColor = isLightColor(backgroundColor) 
    ? 'rgba(0, 0, 0, 0.1)' 
    : 'rgba(255, 255, 255, 0.2)';

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-2 rounded-lg mb-1 hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md border"
      style={{ 
        backgroundColor,
        color: textColor,
        borderColor: borderColor
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate">
            {cita.horaInicio} {getEstadoBadge(cita.estado)}
          </div>
          <div className="text-xs font-medium truncate">
            {cita.cliente?.nombre}
          </div>
          <div className="text-xs opacity-90 truncate">
            {cita.servicio?.nombre}
          </div>
          {cita.empleado && (
            <div className="text-xs opacity-75 truncate">
              {cita.empleado.nombre}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

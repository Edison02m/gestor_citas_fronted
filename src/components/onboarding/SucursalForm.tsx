'use client';

import { useState, useEffect } from 'react';
import { OnboardingService } from '@/services/onboarding.service';
import { CreateSucursalDto, HorarioInput } from '@/interfaces';

interface Props {
  onSuccess: () => void;
}

const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const diasCompletos = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function SucursalForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState<number>(1); // Lunes por defecto
  const [codigoPais, setCodigoPais] = useState('+593'); // Ecuador por defecto
  const [showCodigoPaisDropdown, setShowCodigoPaisDropdown] = useState(false);

  // Lista de códigos de países más comunes
  const codigosPaises = [
    { codigo: '+593', pais: 'Ecuador', bandera: '🇪🇨' },
    { codigo: '+54', pais: 'Argentina', bandera: '🇦🇷' },
    { codigo: '+591', pais: 'Bolivia', bandera: '🇧🇴' },
    { codigo: '+55', pais: 'Brasil', bandera: '🇧🇷' },
    { codigo: '+56', pais: 'Chile', bandera: '🇨🇱' },
    { codigo: '+57', pais: 'Colombia', bandera: '🇨🇴' },
    { codigo: '+506', pais: 'Costa Rica', bandera: '🇨🇷' },
    { codigo: '+34', pais: 'España', bandera: '🇪🇸' },
    { codigo: '+1', pais: 'Estados Unidos', bandera: '🇺🇸' },
    { codigo: '+52', pais: 'México', bandera: '🇲🇽' },
    { codigo: '+51', pais: 'Perú', bandera: '🇵🇪' },
    { codigo: '+598', pais: 'Uruguay', bandera: '🇺🇾' },
    { codigo: '+58', pais: 'Venezuela', bandera: '🇻🇪' },
  ];
  
  const [formData, setFormData] = useState<CreateSucursalDto>({
    nombre: '',
    direccion: '',
    telefono: '',
    googleMapsUrl: '',
    horarios: [
      { diaSemana: 0, abierto: false, horaApertura: null, horaCierre: null, tieneDescanso: false, descansoInicio: '12:00', descansoFin: '13:00' }, // Domingo cerrado
      { diaSemana: 1, abierto: true, horaApertura: '09:00', horaCierre: '18:00', tieneDescanso: false, descansoInicio: '12:00', descansoFin: '13:00' },
      { diaSemana: 2, abierto: true, horaApertura: '09:00', horaCierre: '18:00', tieneDescanso: false, descansoInicio: '12:00', descansoFin: '13:00' },
      { diaSemana: 3, abierto: true, horaApertura: '09:00', horaCierre: '18:00', tieneDescanso: false, descansoInicio: '12:00', descansoFin: '13:00' },
      { diaSemana: 4, abierto: true, horaApertura: '09:00', horaCierre: '18:00', tieneDescanso: false, descansoInicio: '12:00', descansoFin: '13:00' },
      { diaSemana: 5, abierto: true, horaApertura: '09:00', horaCierre: '18:00', tieneDescanso: false, descansoInicio: '12:00', descansoFin: '13:00' },
      { diaSemana: 6, abierto: false, horaApertura: null, horaCierre: null, tieneDescanso: false, descansoInicio: '12:00', descansoFin: '13:00' }  // Sábado cerrado
    ]
  });

  // Cerrar dropdown de código de país al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.codigo-pais-dropdown-container')) {
        setShowCodigoPaisDropdown(false);
      }
    };
    
    if (showCodigoPaisDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showCodigoPaisDropdown]);

  const updateHorario = (index: number, field: keyof HorarioInput, value: any) => {
    const newHorarios = [...formData.horarios];
    (newHorarios[index] as any)[field] = value;
    setFormData({ ...formData, horarios: newHorarios });
  };

  // Aplicar a todos los días
  const applyToAll = () => {
    const sourceHorario = formData.horarios[selectedDay];
    const newHorarios = formData.horarios.map((_, index) => ({
      ...sourceHorario,
      diaSemana: index
    }));
    setFormData({ ...formData, horarios: newHorarios });
  };

  // Aplicar a días de semana (L-V)
  const applyToWeekdays = () => {
    const sourceHorario = formData.horarios[selectedDay];
    const newHorarios = [...formData.horarios];
    for (let i = 1; i <= 5; i++) {
      newHorarios[i] = {
        ...sourceHorario,
        diaSemana: i
      };
    }
    setFormData({ ...formData, horarios: newHorarios });
  };

  // Aplicar a fin de semana (S-D)
  const applyToWeekend = () => {
    const sourceHorario = formData.horarios[selectedDay];
    const newHorarios = [...formData.horarios];
    newHorarios[0] = { ...sourceHorario, diaSemana: 0 };
    newHorarios[6] = { ...sourceHorario, diaSemana: 6 };
    setFormData({ ...formData, horarios: newHorarios });
  };

  // Toggle abierto/cerrado
  const toggleAbierto = (index: number) => {
    const newHorarios = [...formData.horarios];
    const isCurrentlyOpen = newHorarios[index].abierto;
    
    if (isCurrentlyOpen) {
      // Si está abierto, cerrar y limpiar horarios
      newHorarios[index] = {
        ...newHorarios[index],
        abierto: false,
        horaApertura: null,
        horaCierre: null,
        tieneDescanso: false,
        descansoInicio: '12:00',
        descansoFin: '13:00'
      };
    } else {
      // Si está cerrado, abrir con horarios por defecto
      newHorarios[index] = {
        ...newHorarios[index],
        abierto: true,
        horaApertura: '09:00',
        horaCierre: '18:00',
        tieneDescanso: false,
        descansoInicio: '12:00',
        descansoFin: '13:00'
      };
    }
    
    setFormData({ ...formData, horarios: newHorarios });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validar que los horarios abiertos tengan horas válidas
      for (const horario of formData.horarios) {
        if (horario.abierto) {
          if (!horario.horaApertura || !horario.horaCierre) {
            setError(`El día ${diasCompletos[horario.diaSemana]} está abierto pero falta la hora de apertura o cierre`);
            setLoading(false);
            return;
          }
          
          if (horario.horaApertura >= horario.horaCierre) {
            setError(`El día ${diasCompletos[horario.diaSemana]}: La hora de apertura debe ser menor que la hora de cierre`);
            setLoading(false);
            return;
          }

          // Validar descanso si está habilitado
          if (horario.tieneDescanso) {
            if (!horario.descansoInicio || !horario.descansoFin) {
              setError(`El día ${diasCompletos[horario.diaSemana]} tiene descanso activado pero falta la hora de inicio o fin del descanso`);
              setLoading(false);
              return;
            }
            
            if (horario.descansoInicio >= horario.descansoFin) {
              setError(`El día ${diasCompletos[horario.diaSemana]}: La hora de inicio del descanso debe ser menor que la hora de fin`);
              setLoading(false);
              return;
            }
            
            if (horario.descansoInicio <= horario.horaApertura || horario.descansoFin >= horario.horaCierre) {
              setError(`El día ${diasCompletos[horario.diaSemana]}: El horario de descanso debe estar dentro del horario de apertura y cierre`);
              setLoading(false);
              return;
            }
          }
        }
      }

      // Construir el DTO con formato condicional similar a HorariosModal
      const horariosDto: HorarioInput[] = formData.horarios.map(h => ({
        diaSemana: h.diaSemana,
        abierto: h.abierto,
        horaApertura: h.abierto ? h.horaApertura : null,
        horaCierre: h.abierto ? h.horaCierre : null,
        tieneDescanso: h.abierto ? h.tieneDescanso : false,
        descansoInicio: (h.abierto && h.tieneDescanso) ? h.descansoInicio : null,
        descansoFin: (h.abierto && h.tieneDescanso) ? h.descansoFin : null
      }));

      await OnboardingService.createSucursal({
        ...formData,
        telefono: `${codigoPais}${formData.telefono}`, // Concatenar código + teléfono
        horarios: horariosDto
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear ubicación');
    } finally {
      setLoading(false);
    }
  };

  const selectedHorario = formData.horarios[selectedDay];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header simplificado - Responsive */}
      <div className="mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
          Ubicación de tu negocio
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Podrás agregar más ubicaciones después
        </p>
      </div>

      {/* Información básica - Responsive: 1 columna en mobile, 2 en desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            Nombre de la ubicación
            <div className="group relative">
              <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-48 sm:w-56 p-2 bg-gray-900 text-white text-[10px] sm:text-xs rounded-lg shadow-lg z-10">
                Será visible para tus clientes al agendar citas
                <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
            placeholder="Ej: Matriz, Principal, Centro..."
            disabled={loading}
          />
        </div>

        <div className="sm:col-span-2 md:col-span-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            Teléfono
          </label>
          <div className="flex gap-2">
            {/* Selector de código de país - Responsive */}
            <div className="w-24 sm:w-28 md:w-32 relative codigo-pais-dropdown-container">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCodigoPaisDropdown(!showCodigoPaisDropdown);
                }}
                disabled={loading}
                className="w-full px-1.5 sm:px-2 py-2 text-[10px] sm:text-xs text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all flex items-center justify-between disabled:opacity-50"
              >
                <span className="truncate">
                  {codigosPaises.find(p => p.codigo === codigoPais)?.bandera} {codigoPais}
                </span>
                <svg className={`w-2.5 sm:w-3 h-2.5 sm:h-3 text-gray-400 flex-shrink-0 transition-transform ${showCodigoPaisDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showCodigoPaisDropdown && (
                <div className="absolute z-50 w-48 sm:w-56 mt-1 left-0 sm:left-auto bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {codigosPaises.map((pais) => (
                    <button
                      key={`${pais.codigo}-${pais.pais}`}
                      type="button"
                      onClick={() => {
                        setCodigoPais(pais.codigo);
                        setShowCodigoPaisDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg">{pais.bandera}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-900">{pais.pais}</div>
                          <div className="text-[10px] text-gray-500">{pais.codigo}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input de teléfono */}
            <input
              type="tel"
              required
              value={formData.telefono}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ''); // Solo números
                
                // Si el primer caracter es 0, quitarlo automáticamente
                if (value.startsWith('0')) {
                  value = value.substring(1);
                }
                
                // Limitar a 9 dígitos
                if (value.length <= 9) {
                  setFormData({ ...formData, telefono: value });
                }
              }}
              className="flex-1 px-3 py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
              placeholder="999999999"
              disabled={loading}
            />
          </div>
        </div>

        <div className="sm:col-span-2 md:col-span-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            Dirección
          </label>
          <input
            type="text"
            required
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
            placeholder="Av. Principal 123"
            disabled={loading}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            URL de Google Maps
            <span className="text-xs text-gray-400 font-normal">(opcional)</span>
            <div className="group relative">
              <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-48 sm:w-56 p-2 bg-gray-900 text-white text-[10px] sm:text-xs rounded-lg shadow-lg z-10">
                Ayuda a tus clientes a encontrar tu ubicación fácilmente
                <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </label>
          <input
            type="url"
            value={formData.googleMapsUrl}
            onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
            placeholder="https://maps.google.com/..."
            disabled={loading}
          />
        </div>
      </div>

      {/* Horarios de atención - Responsive */}
      <div>
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-3">Horarios de atención</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Columna Izquierda: Selector de días y resumen */}
          <div className="space-y-3 sm:space-y-4">
            {/* Selector de días - Responsive Grid */}
            <div>
              <h4 className="text-[10px] sm:text-xs font-medium text-gray-700 mb-2">Selecciona el día</h4>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
                {diasCompletos.map((dia, index) => {
                  const horario = formData.horarios[index];
                  const esSeleccionado = selectedDay === index;
                  const estaAbierto = horario?.abierto;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedDay(index);
                      }}
                      disabled={loading}
                      className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition-all ${
                        esSeleccionado
                          ? 'bg-[#0490C8] text-white shadow-md'
                          : estaAbierto
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-white border border-gray-300 text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-bold">{diasSemana[index]}</div>
                        <div className="text-[9px] sm:text-[10px] mt-0.5 opacity-90 hidden sm:block">{dia.slice(0, 3)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resumen semanal - Responsive */}
            <div>
              <h4 className="text-[10px] sm:text-xs font-medium text-gray-700 mb-2">Resumen</h4>
              <div className="space-y-1 sm:space-y-1.5">
                {formData.horarios.map((horario, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-[10px] sm:text-xs px-2 py-1 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDay(index)}
                  >
                    <span className="font-medium text-gray-700 w-12 sm:w-16">{diasCompletos[index].substring(0, 3)}</span>
                    {horario.abierto ? (
                      <div className="flex items-center gap-0.5 sm:gap-1 font-mono text-[9px] sm:text-[11px]">
                        <span className="text-gray-700">{horario.horaApertura}</span>
                        {horario.tieneDescanso ? (
                          <>
                            <span className="text-gray-400">→</span>
                            <span className="text-[#0490C8]">{horario.descansoInicio}-{horario.descansoFin}</span>
                            <span className="text-gray-400">→</span>
                          </>
                        ) : (
                          <span className="text-gray-400">━━</span>
                        )}
                        <span className="text-gray-700">{horario.horaCierre}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-[9px] sm:text-[11px]">Cerrado</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Configuración del día seleccionado */}
          <div>
            {selectedHorario && (
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-3 h-full">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                    {diasCompletos[selectedDay]}
                  </h4>
                  <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                    <span className="text-[10px] sm:text-xs font-medium text-gray-600">
                      {selectedHorario.abierto ? 'Abierto' : 'Cerrado'}
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedHorario.abierto}
                        onChange={() => toggleAbierto(selectedDay)}
                        disabled={loading}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-[18px] sm:w-10 sm:h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0490C8]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[14px] after:w-[14px] sm:after:h-4 sm:after:w-4 after:transition-all peer-checked:bg-[#0490C8]"></div>
                    </div>
                  </label>
                </div>

                {selectedHorario.abierto && (
                  <>
                    {/* Horarios principales */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">Apertura</label>
                        <input
                          type="time"
                          value={selectedHorario.horaApertura || ''}
                          onChange={(e) => updateHorario(selectedDay, 'horaApertura', e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20"
                          disabled={loading}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">Cierre</label>
                        <input
                          type="time"
                          value={selectedHorario.horaCierre || ''}
                          onChange={(e) => updateHorario(selectedDay, 'horaCierre', e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    {/* Descanso */}
                    <div className="pt-2 border-t border-gray-200">
                      <label className="flex items-center justify-between cursor-pointer mb-2">
                        <span className="text-[10px] sm:text-xs font-medium text-gray-700">Descanso</span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedHorario.tieneDescanso}
                            onChange={() => updateHorario(selectedDay, 'tieneDescanso', !selectedHorario.tieneDescanso)}
                            disabled={loading}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-[18px] sm:w-9 sm:h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0490C8]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 sm:after:h-3.5 sm:after:w-3.5 after:transition-all peer-checked:bg-[#0490C8]"></div>
                        </div>
                      </label>

                      {selectedHorario.tieneDescanso && (
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2">
                          <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1">Inicio</label>
                            <input
                              type="time"
                              value={selectedHorario.descansoInicio || '12:00'}
                              onChange={(e) => updateHorario(selectedDay, 'descansoInicio', e.target.value)}
                              className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20"
                              disabled={loading}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1">Fin</label>
                            <input
                              type="time"
                              value={selectedHorario.descansoFin || '13:00'}
                              onChange={(e) => updateHorario(selectedDay, 'descansoFin', e.target.value)}
                              className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20"
                              disabled={loading}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acciones rápidas */}
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Copiar a:</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={applyToAll}
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1 sm:gap-1.5"
                          title="Aplicar a todos los días"
                          disabled={loading}
                        >
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="hidden sm:inline">Toda la semana</span>
                          <span className="sm:hidden">Todos</span>
                        </button>
                        <button
                          type="button"
                          onClick={applyToWeekdays}
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1 sm:gap-1.5"
                          title="Aplicar de Lunes a Viernes"
                          disabled={loading}
                        >
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="hidden sm:inline">Entre semana</span>
                          <span className="sm:hidden">L-V</span>
                        </button>
                        <button
                          type="button"
                          onClick={applyToWeekend}
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1 sm:gap-1.5"
                          title="Aplicar Sábado y Domingo"
                          disabled={loading}
                        >
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span className="hidden sm:inline">Fin de semana</span>
                          <span className="sm:hidden">S-D</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message compacto */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm shadow-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0490C8] hover:bg-[#023664] text-white font-semibold py-2.5 sm:py-3 px-4 rounded-xl text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Guardando...' : 'Continuar'}
      </button>
    </form>
  );
}

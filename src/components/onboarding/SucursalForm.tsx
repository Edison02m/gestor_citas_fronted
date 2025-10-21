'use client';

import { useState } from 'react';
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
  const [showCopyOptions, setShowCopyOptions] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedDays, setCopiedDays] = useState<number[]>([]);
  
  const [formData, setFormData] = useState<CreateSucursalDto>({
    nombre: '',
    direccion: '',
    telefono: '',
    horarios: [
      { diaSemana: 0, abierto: false, horaApertura: null, horaCierre: null, tieneDescanso: false, descansoInicio: null, descansoFin: null }, // Domingo cerrado
      { diaSemana: 1, abierto: true, horaApertura: '09:00', horaCierre: '18:00', tieneDescanso: false, descansoInicio: null, descansoFin: null },
      { diaSemana: 2, abierto: true, horaApertura: '09:00', horaCierre: '18:00', tieneDescanso: false, descansoInicio: null, descansoFin: null },
      { diaSemana: 3, abierto: true, horaApertura: '09:00', horaCierre: '18:00', tieneDescanso: false, descansoInicio: null, descansoFin: null },
      { diaSemana: 4, abierto: true, horaApertura: '09:00', horaCierre: '18:00', tieneDescanso: false, descansoInicio: null, descansoFin: null },
      { diaSemana: 5, abierto: true, horaApertura: '09:00', horaCierre: '18:00', tieneDescanso: false, descansoInicio: null, descansoFin: null },
      { diaSemana: 6, abierto: false, horaApertura: null, horaCierre: null, tieneDescanso: false, descansoInicio: null, descansoFin: null }  // Sábado cerrado
    ]
  });

  const updateHorario = (index: number, field: keyof HorarioInput, value: any) => {
    const newHorarios = [...formData.horarios];
    (newHorarios[index] as any)[field] = value;
    setFormData({ ...formData, horarios: newHorarios });
  };

  // Mostrar mensaje de éxito temporal
  const showSuccessMessage = (message: string, days: number[]) => {
    setSuccessMessage(message);
    setCopiedDays(days);
    setTimeout(() => {
      setSuccessMessage('');
      setCopiedDays([]);
    }, 3000);
  };

  // Copiar horario actual a otros días
  const copyToDay = (targetDay: number) => {
    const sourceHorario = formData.horarios[selectedDay];
    const newHorarios = [...formData.horarios];
    newHorarios[targetDay] = {
      ...sourceHorario,
      diaSemana: targetDay
    };
    setFormData({ ...formData, horarios: newHorarios });
    showSuccessMessage(`Horario copiado a ${diasCompletos[targetDay]}`, [targetDay]);
    setShowCopyOptions(false);
  };

  // Aplicar a todos los días
  const applyToAll = () => {
    const sourceHorario = formData.horarios[selectedDay];
    const newHorarios = formData.horarios.map((_, index) => ({
      ...sourceHorario,
      diaSemana: index
    }));
    setFormData({ ...formData, horarios: newHorarios });
    showSuccessMessage('Horario aplicado a todos los días', [0, 1, 2, 3, 4, 5, 6]);
    setShowCopyOptions(false);
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
    showSuccessMessage('Horario aplicado de Lunes a Viernes', [1, 2, 3, 4, 5]);
    setShowCopyOptions(false);
  };

  // Aplicar a fin de semana (S-D)
  const applyToWeekend = () => {
    const sourceHorario = formData.horarios[selectedDay];
    const newHorarios = [...formData.horarios];
    newHorarios[0] = { ...sourceHorario, diaSemana: 0 };
    newHorarios[6] = { ...sourceHorario, diaSemana: 6 };
    setFormData({ ...formData, horarios: newHorarios });
    showSuccessMessage('Horario aplicado al fin de semana', [0, 6]);
    setShowCopyOptions(false);
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
        descansoInicio: null,
        descansoFin: null
      };
    } else {
      // Si está cerrado, abrir con horarios por defecto
      newHorarios[index] = {
        ...newHorarios[index],
        abierto: true,
        horaApertura: '09:00',
        horaCierre: '18:00',
        tieneDescanso: false,
        descansoInicio: null,
        descansoFin: null
      };
    }
    
    setFormData({ ...formData, horarios: newHorarios });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await OnboardingService.createSucursal(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear sucursal');
    } finally {
      setLoading(false);
    }
  };

  const selectedHorario = formData.horarios[selectedDay];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs text-green-800 font-medium">
            {successMessage}
          </p>
        </div>
      )}

      {/* Información básica - Layout compacto en 2 columnas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre de la sucursal
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
            placeholder="Sucursal Centro"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Teléfono
          </label>
          <input
            type="tel"
            required
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
            placeholder="+593 999 888 777"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Dirección
          </label>
          <input
            type="text"
            required
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all placeholder:text-gray-400"
            placeholder="Av. Principal 123"
            disabled={loading}
          />
        </div>
      </div>

      {/* Selector de días minimalista */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Horarios de atención
          </label>
          <button
            type="button"
            onClick={() => setShowCopyOptions(!showCopyOptions)}
            className="text-xs text-[#0490C8] hover:text-[#023664] font-medium flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copiar horario
          </button>
        </div>
        <div className="flex gap-1.5">
          {diasSemana.map((dia, index) => {
            const hasCustomSchedule = copiedDays.includes(index);
            const isClosed = !formData.horarios[index].abierto;
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setSelectedDay(index);
                  setShowCopyOptions(false);
                }}
                disabled={loading}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all relative ${
                  selectedDay === index
                    ? 'bg-[#0490C8] text-white shadow-sm'
                    : hasCustomSchedule
                    ? 'bg-green-100 text-green-700 border border-green-300 animate-pulse'
                    : isClosed
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {dia}
                {isClosed && selectedDay !== index && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Opciones de copiado */}
      {showCopyOptions && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-[#0490C8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-xs text-gray-900 font-semibold">
                Copiar horario de <span className="text-[#0490C8]">{diasCompletos[selectedDay]}</span>
              </p>
              {selectedHorario.abierto ? (
                <p className="text-[10px] text-gray-600 mt-0.5">
                  {selectedHorario.horaApertura} - {selectedHorario.horaCierre}
                  {selectedHorario.tieneDescanso && ' (con descanso)'}
                </p>
              ) : (
                <p className="text-[10px] text-red-600 font-medium mt-0.5">
                  Día cerrado
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wide">Aplicar rápidamente a:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={applyToAll}
                className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-[#0490C8] hover:text-white hover:border-[#0490C8] transition-all flex flex-col items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Todos</span>
              </button>
              <button
                type="button"
                onClick={applyToWeekdays}
                className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-[#0490C8] hover:text-white hover:border-[#0490C8] transition-all flex flex-col items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Lun-Vie</span>
              </button>
              <button
                type="button"
                onClick={applyToWeekend}
                className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-[#0490C8] hover:text-white hover:border-[#0490C8] transition-all flex flex-col items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Fin semana</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-blue-200">
            <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wide">O selecciona días específicos:</p>
            <div className="grid grid-cols-7 gap-1.5">
              {diasCompletos.map((dia, index) => (
                index !== selectedDay && (
                  <button
                    key={index}
                    type="button"
                    onClick={() => copyToDay(index)}
                    className="px-2 py-2 bg-white border border-gray-300 rounded-lg text-[10px] font-semibold text-gray-700 hover:bg-[#0490C8] hover:text-white hover:border-[#0490C8] transition-all"
                    title={`Copiar a ${dia}`}
                  >
                    {diasSemana[index]}
                  </button>
                )
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCopyOptions(false)}
            className="w-full text-xs text-gray-600 hover:text-gray-800 font-medium py-2 border-t border-blue-200"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Horarios del día seleccionado - Diseño compacto */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 space-y-3 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0490C8] flex items-center justify-center">
              <span className="text-xs font-bold text-white">{diasSemana[selectedDay]}</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">{diasCompletos[selectedDay]}</span>
              <p className="text-[10px] text-gray-600">Configuración de horario</p>
            </div>
          </div>
          <div className="text-right">
            {selectedHorario.abierto ? (
              <span className="text-xs font-mono text-gray-900 bg-white px-2 py-1 rounded-lg border border-gray-200">
                {selectedHorario.horaApertura} - {selectedHorario.horaCierre}
              </span>
            ) : (
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                Cerrado
              </span>
            )}
          </div>
        </div>

        {/* Toggle Abierto/Cerrado */}
        <div className="flex items-center justify-between py-2 border-y border-gray-200">
          <span className="text-sm font-medium text-gray-700">Estado del día</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${selectedHorario.abierto ? 'text-gray-500' : 'text-gray-900'}`}>
              Cerrado
            </span>
            <button
              type="button"
              onClick={() => toggleAbierto(selectedDay)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                selectedHorario.abierto ? 'bg-green-500' : 'bg-gray-300'
              }`}
              disabled={loading}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                  selectedHorario.abierto ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs font-medium ${selectedHorario.abierto ? 'text-green-600' : 'text-gray-500'}`}>
              Abierto
            </span>
          </div>
        </div>
        
        {/* Mostrar campos de hora solo si está abierto */}
        {selectedHorario.abierto && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Apertura</label>
                <input
                  type="time"
                  value={selectedHorario.horaApertura || ''}
                  onChange={(e) => updateHorario(selectedDay, 'horaApertura', e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-1 focus:ring-[#0490C8]/20"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cierre</label>
                <input
                  type="time"
                  value={selectedHorario.horaCierre || ''}
                  onChange={(e) => updateHorario(selectedDay, 'horaCierre', e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-1 focus:ring-[#0490C8]/20"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Toggle Descanso minimalista */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-600">Descanso intermedio</span>
              <button
                type="button"
                onClick={() => updateHorario(selectedDay, 'tieneDescanso', !selectedHorario.tieneDescanso)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  selectedHorario.tieneDescanso ? 'bg-[#0490C8]' : 'bg-gray-300'
                }`}
                disabled={loading}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    selectedHorario.tieneDescanso ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {selectedHorario.tieneDescanso && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
                  <input
                    type="time"
                    value={selectedHorario.descansoInicio || ''}
                    onChange={(e) => updateHorario(selectedDay, 'descansoInicio', e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-1 focus:ring-[#0490C8]/20"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
                  <input
                    type="time"
                    value={selectedHorario.descansoFin || ''}
                    onChange={(e) => updateHorario(selectedDay, 'descansoFin', e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-1 focus:ring-[#0490C8]/20"
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Mensaje cuando está cerrado */}
        {!selectedHorario.abierto && (
          <div className="text-center py-6">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm text-gray-500">Este día permanecerá cerrado</p>
          </div>
        )}
      </div>

      {/* Error Message compacto */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0490C8] hover:bg-[#023664] text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creando sucursal...' : 'Continuar'}
      </button>
    </form>
  );
}

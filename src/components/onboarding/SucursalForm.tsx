'use client';

import { useState } from 'react';
import { OnboardingService } from '@/services/onboarding.service';
import { CreateSucursalDto, HorarioInput } from '@/interfaces';

interface Props {
  onSuccess: () => void;
}

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const diasCompletostext = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function SucursalForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarHorarios, setMostrarHorarios] = useState(false);
  
  const [formData, setFormData] = useState<CreateSucursalDto>({
    nombre: '',
    direccion: '',
    telefono: '',
    horarios: [
      { diaSemana: 0, horaInicio: '09:00', horaFin: '18:00', tieneDescanso: false, descansoInicio: null, descansoFin: null },
      { diaSemana: 1, horaInicio: '09:00', horaFin: '18:00', tieneDescanso: false, descansoInicio: null, descansoFin: null },
      { diaSemana: 2, horaInicio: '09:00', horaFin: '18:00', tieneDescanso: false, descansoInicio: null, descansoFin: null },
      { diaSemana: 3, horaInicio: '09:00', horaFin: '18:00', tieneDescanso: false, descansoInicio: null, descansoFin: null },
      { diaSemana: 4, horaInicio: '09:00', horaFin: '18:00', tieneDescanso: false, descansoInicio: null, descansoFin: null },
      { diaSemana: 5, horaInicio: '09:00', horaFin: '18:00', tieneDescanso: false, descansoInicio: null, descansoFin: null },
      { diaSemana: 6, horaInicio: '09:00', horaFin: '14:00', tieneDescanso: false, descansoInicio: null, descansoFin: null }
    ]
  });

  const updateHorario = (index: number, field: keyof HorarioInput, value: any) => {
    const newHorarios = [...formData.horarios];
    (newHorarios[index] as any)[field] = value;
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu primera sucursal</h2>
        <p className="text-gray-600 text-sm">Configura los datos básicos y horarios de atención</p>
      </div>

      {/* Información básica */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Nombre de la sucursal *
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
            placeholder="Ej: Sucursal Centro"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Dirección *
          </label>
          <input
            type="text"
            required
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
            placeholder="Ej: Av. Principal 123, Centro"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            required
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 transition-all"
            placeholder="+593 999 888 777"
            disabled={loading}
          />
        </div>
      </div>

      {/* Sección de Horarios - Colapsable */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setMostrarHorarios(!mostrarHorarios)}
          className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between hover:from-gray-100 hover:to-gray-50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Horarios de atención</h3>
              <p className="text-xs text-gray-600">Configura tus días y horas de trabajo</p>
            </div>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${mostrarHorarios ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {mostrarHorarios && (
          <div className="p-6 space-y-4 bg-gray-50/50">
            {formData.horarios.map((horario, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#0490C8]/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <span className="text-xs font-bold text-[#0490C8]">{diasSemana[index]}</span>
                  </div>
                  <span className="font-medium text-gray-900">{diasCompletostext[index]}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Apertura</label>
                    <input
                      type="time"
                      value={horario.horaInicio}
                      onChange={(e) => updateHorario(index, 'horaInicio', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-1 focus:ring-[#0490C8]/20"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cierre</label>
                    <input
                      type="time"
                      value={horario.horaFin}
                      onChange={(e) => updateHorario(index, 'horaFin', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-1 focus:ring-[#0490C8]/20"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Toggle Descanso */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => updateHorario(index, 'tieneDescanso', !horario.tieneDescanso)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      horario.tieneDescanso ? 'bg-[#0490C8]' : 'bg-gray-200'
                    }`}
                    disabled={loading}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        horario.tieneDescanso ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-gray-600">Tiene descanso</span>
                </div>

                {horario.tieneDescanso && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Inicio descanso</label>
                      <input
                        type="time"
                        value={horario.descansoInicio || ''}
                        onChange={(e) => updateHorario(index, 'descansoInicio', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-1 focus:ring-[#0490C8]/20"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Fin descanso</label>
                      <input
                        type="time"
                        value={horario.descansoFin || ''}
                        onChange={(e) => updateHorario(index, 'descansoFin', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#0490C8] focus:ring-1 focus:ring-[#0490C8]/20"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0490C8] hover:bg-[#023664] text-white font-semibold py-4 px-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Creando sucursal...</span>
          </>
        ) : (
          <>
            <span>Continuar</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

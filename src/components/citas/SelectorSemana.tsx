'use client';

import { useState, useEffect } from 'react';

interface SelectorSemanaProps {
  onSelectFecha: (fecha: Date) => void;
  fechaSeleccionada: Date | null;
}

export default function SelectorSemana({ onSelectFecha, fechaSeleccionada }: SelectorSemanaProps) {
  const [semanaActual, setSemanaActual] = useState(0); // 0 = esta semana, 1 = siguiente, etc.

  const obtenerDiasSemana = (offset: number = 0) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Calcular el lunes de la semana actual
    const diaSemana = hoy.getDay();
    const diasHastaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    
    const lunesActual = new Date(hoy);
    lunesActual.setDate(hoy.getDate() + diasHastaLunes + (offset * 7));
    
    // Generar los 7 días de la semana
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(lunesActual);
      fecha.setDate(lunesActual.getDate() + i);
      dias.push(fecha);
    }
    
    return dias;
  };

  const [diasSemana, setDiasSemana] = useState(obtenerDiasSemana(0));

  useEffect(() => {
    setDiasSemana(obtenerDiasSemana(semanaActual));
  }, [semanaActual]);

  const esDiaPasado = (fecha: Date): boolean => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha < hoy;
  };

  const esDiaSeleccionado = (fecha: Date): boolean => {
    if (!fechaSeleccionada) return false;
    return (
      fecha.getFullYear() === fechaSeleccionada.getFullYear() &&
      fecha.getMonth() === fechaSeleccionada.getMonth() &&
      fecha.getDate() === fechaSeleccionada.getDate()
    );
  };

  const nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const handleSiguienteSemana = () => {
    setSemanaActual(prev => prev + 1);
  };

  const handleSemanaAnterior = () => {
    // Solo permitir retroceder si no es la semana actual
    if (semanaActual > 0) {
      setSemanaActual(prev => prev - 1);
    }
  };

  const formatearRangoSemana = () => {
    const primerDia = diasSemana[0];
    const ultimoDia = diasSemana[6];
    
    const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const inicio = primerDia.toLocaleDateString('es', opciones);
    const fin = ultimoDia.toLocaleDateString('es', opciones);
    
    return `${inicio} - ${fin}`;
  };

  return (
    <div className="space-y-3">
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={handleSemanaAnterior}
          disabled={semanaActual === 0}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold text-gray-700">
            {semanaActual === 0 ? 'Esta semana' : `Semana del ${formatearRangoSemana()}`}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSiguienteSemana}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1.5">
        {diasSemana.map((fecha, index) => {
          const pasado = esDiaPasado(fecha);
          const seleccionado = esDiaSeleccionado(fecha);
          const esHoy = fecha.toDateString() === new Date().toDateString();

          return (
            <button
              key={index}
              type="button"
              onClick={() => !pasado && onSelectFecha(fecha)}
              disabled={pasado}
              className={`
                relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all
                ${pasado 
                  ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' 
                  : seleccionado
                    ? 'bg-[#0490C8] border-[#0490C8] text-white shadow-md scale-105'
                    : esHoy
                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:border-[#0490C8]'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-[#0490C8] hover:bg-gray-50'
                }
              `}
            >
              {/* Nombre del día */}
              <span className={`text-[10px] font-medium mb-0.5 ${
                pasado ? 'text-gray-300' : seleccionado ? 'text-white' : 'text-gray-600'
              }`}>
                {nombresDias[index]}
              </span>
              
              {/* Número del día */}
              <span className={`text-sm font-bold ${
                pasado ? 'text-gray-300' : seleccionado ? 'text-white' : 'text-gray-900'
              }`}>
                {fecha.getDate()}
              </span>

              {/* Indicador de "Hoy" */}
              {esHoy && !seleccionado && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Fecha seleccionada (texto) */}
      {fechaSeleccionada && (
        <div className="mt-3 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center">
          <p className="text-xs text-gray-700">
            <span className="font-semibold text-gray-900">Fecha seleccionada: </span>
            {fechaSeleccionada.toLocaleDateString('es', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      )}
    </div>
  );
}

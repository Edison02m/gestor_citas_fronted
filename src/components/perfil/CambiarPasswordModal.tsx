'use client';

import { useState } from 'react';
import { UsuariosService } from '@/services/usuarios.service';

interface CambiarPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CambiarPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: CambiarPasswordModalProps) {
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordNuevaConfirm, setPasswordNuevaConfirm] = useState('');
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showPasswordNueva, setShowPasswordNueva] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validaciones en tiempo real
  const tieneLongitud = passwordNueva.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(passwordNueva);
  const tieneNumero = /\d/.test(passwordNueva);
  const passwordsCoinciden = passwordNueva === passwordNuevaConfirm && passwordNueva.length > 0;
  const passwordValida = tieneLongitud && tieneMayuscula && tieneNumero;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar campos vacíos
    if (!passwordActual.trim()) {
      setError('Debes ingresar tu contraseña actual');
      return;
    }

    if (!passwordNueva.trim()) {
      setError('Debes ingresar una nueva contraseña');
      return;
    }

    if (!passwordNuevaConfirm.trim()) {
      setError('Debes confirmar la nueva contraseña');
      return;
    }

    // Validar requisitos de contraseña
    if (!passwordValida) {
      setError('La nueva contraseña no cumple con los requisitos de seguridad');
      return;
    }

    // Validar que coincidan
    if (!passwordsCoinciden) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    setIsSubmitting(true);

    try {
      await UsuariosService.cambiarPassword({
        passwordActual: passwordActual.trim(),
        passwordNueva: passwordNueva.trim(),
        passwordNuevaConfirm: passwordNuevaConfirm.trim(),
      });

      setSuccess('¡Contraseña cambiada exitosamente!');
      
      // Limpiar campos
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordNuevaConfirm('');

      // Esperar 1.5 segundos y cerrar
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Error al cambiar contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0490C8] bg-opacity-10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-[#0490C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Cambiar Contraseña</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Contraseña Actual */}
          <div>
            <label htmlFor="passwordActual" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                id="passwordActual"
                type={showPasswordActual ? 'text' : 'password'}
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0490C8] focus:border-transparent transition duration-150 pr-12"
                placeholder="Ingresa tu contraseña actual"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPasswordActual(!showPasswordActual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswordActual ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label htmlFor="passwordNueva" className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="passwordNueva"
                type={showPasswordNueva ? 'text' : 'password'}
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                className={`appearance-none block w-full px-4 py-3 border rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 transition duration-150 pr-12 ${
                  passwordNueva.length > 0 && !passwordValida
                    ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                    : 'border-gray-300 focus:ring-[#0490C8] focus:border-transparent'
                }`}
                placeholder="Ingresa tu nueva contraseña"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPasswordNueva(!showPasswordNueva)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswordNueva ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Indicadores de requisitos */}
            {passwordNueva.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${tieneLongitud ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className={`text-xs ${tieneLongitud ? 'text-green-700' : 'text-gray-500'}`}>
                    Mínimo 8 caracteres
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${tieneMayuscula ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className={`text-xs ${tieneMayuscula ? 'text-green-700' : 'text-gray-500'}`}>
                    Al menos una mayúscula
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${tieneNumero ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className={`text-xs ${tieneNumero ? 'text-green-700' : 'text-gray-500'}`}>
                    Al menos un número
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirmar Nueva Contraseña */}
          <div>
            <label htmlFor="passwordNuevaConfirm" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="passwordNuevaConfirm"
                type={showPasswordConfirm ? 'text' : 'password'}
                value={passwordNuevaConfirm}
                onChange={(e) => setPasswordNuevaConfirm(e.target.value)}
                className={`appearance-none block w-full px-4 py-3 border rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 transition duration-150 pr-12 ${
                  passwordNuevaConfirm.length > 0 && !passwordsCoinciden
                    ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                    : 'border-gray-300 focus:ring-[#0490C8] focus:border-transparent'
                }`}
                placeholder="Confirma tu nueva contraseña"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswordConfirm ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordNuevaConfirm.length > 0 && passwordsCoinciden && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Las contraseñas coinciden
              </p>
            )}
            {passwordNuevaConfirm.length > 0 && !passwordsCoinciden && (
              <p className="mt-1 text-xs text-red-600">Las contraseñas no coinciden</p>
            )}
          </div>

          {/* Mensajes */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <svg className="h-4 w-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-green-800">{success}</span>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0490C8] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !passwordActual || !passwordValida || !passwordsCoinciden}
              className="flex-1 flex justify-center items-center gap-2 px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#0490C8] hover:bg-[#037aa8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0490C8] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Cambiando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cambiar Contraseña
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

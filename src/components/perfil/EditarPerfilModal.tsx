'use client';

import { useState } from 'react';
import { UsuariosService } from '@/services/usuarios.service';

interface EditarPerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNombre: string;
  currentEmail: string;
  onSuccess: () => void;
}

export default function EditarPerfilModal({
  isOpen,
  onClose,
  currentNombre,
  currentEmail,
  onSuccess,
}: EditarPerfilModalProps) {
  const [nombre, setNombre] = useState(currentNombre);
  const [email, setEmail] = useState(currentEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validaciones en tiempo real
  const nombreValido = nombre.trim().length >= 2;
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hayCambios = nombre !== currentNombre || email !== currentEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar campos
    if (!nombreValido) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    if (!emailValido) {
      setError('El correo electrónico no es válido');
      return;
    }

    if (!hayCambios) {
      setError('No hay cambios para guardar');
      return;
    }

    setIsSubmitting(true);

    try {
      await UsuariosService.actualizarPerfil({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
      });

      setSuccess('¡Perfil actualizado exitosamente!');
      
      // Esperar 1 segundo y cerrar
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (error: any) {
      setError(error.message || 'Error al actualizar perfil');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Editar Datos de Cuenta</h2>
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
          {/* Campo Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={`appearance-none block w-full px-4 py-3 border rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 transition duration-150 ${
                nombre.trim().length > 0 && !nombreValido
                  ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                  : 'border-gray-300 focus:ring-[#0490C8] focus:border-transparent'
              }`}
              placeholder="Ej: Juan Pérez"
              disabled={isSubmitting}
            />
            {nombre.trim().length > 0 && !nombreValido && (
              <p className="mt-1 text-xs text-red-600">Mínimo 2 caracteres</p>
            )}
          </div>

          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`appearance-none block w-full px-4 py-3 border rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 transition duration-150 ${
                email.trim().length > 0 && !emailValido
                  ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                  : 'border-gray-300 focus:ring-[#0490C8] focus:border-transparent'
              }`}
              placeholder="Ej: usuario@ejemplo.com"
              disabled={isSubmitting}
            />
            {email.trim().length > 0 && !emailValido && (
              <p className="mt-1 text-xs text-red-600">Correo electrónico inválido</p>
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
              disabled={isSubmitting || !nombreValido || !emailValido || !hayCambios}
              className="flex-1 flex justify-center items-center gap-2 px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#0490C8] hover:bg-[#037aa8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0490C8] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

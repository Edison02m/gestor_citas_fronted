'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import Image from 'next/image';
import Link from 'next/link';

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validaciones
    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.forgotPassword(email);
      setSuccessMessage(response.message);
      setEmail(''); // Limpiar formulario
      
      // Redirigir al login después de 5 segundos
      setTimeout(() => {
        router.push('/auth');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Error al solicitar recuperación de contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-10 shadow-sm">
          {/* Logo y Título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16">
                <Image
                  src="/Assets/logo_citaYA.png"
                  alt="CitaYA Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar Contraseña</h1>
            <p className="text-sm text-gray-600">
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
            </p>
          </div>

          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm mb-6">
              <p className="font-medium">{successMessage}</p>
              <p className="text-xs mt-1">
                Revisa tu bandeja de entrada y spam. Serás redirigido al login en 5 segundos...
              </p>
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm mb-6">
              {error}
            </div>
          )}

          {/* Formulario */}
          {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0490C8] focus:ring-2 focus:ring-[#0490C8]/20 text-gray-900 bg-white transition-all"
                  placeholder="tu-email@ejemplo.com"
                  disabled={isLoading}
                />
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0490C8] hover:bg-[#023664] text-white font-semibold py-3 px-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  'Enviar Instrucciones'
                )}
              </button>
            </form>
          )}

          {/* Volver al login */}
          <div className="text-center mt-6">
            <Link
              href="/auth"
              className="text-sm text-[#0490C8] hover:text-[#023664] font-medium transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            © 2024 CitaYA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ActivarCodigoPage() {
  const router = useRouter();

  useEffect(() => {
    // 🔄 REDIRIGIR A LA NUEVA UBICACIÓN DENTRO DEL DASHBOARD
    router.push('/dashboard-usuario/activar-codigo');
  }, [router]);

  // Mostrar loading mientras redirige
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0490C8] mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}

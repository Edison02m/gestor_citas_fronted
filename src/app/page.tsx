'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100" suppressHydrationWarning>
      <div className="text-center" suppressHydrationWarning>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto" suppressHydrationWarning></div>
        <p className="mt-4 text-xl text-gray-700">Cargando Gestor de Citas...</p>
      </div>
    </div>
  );
}

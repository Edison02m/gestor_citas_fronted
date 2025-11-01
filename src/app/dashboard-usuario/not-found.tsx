import NotFound404 from '@/components/landing/NotFound404';

export default function DashboardUsuarioNotFound() {
  return (
    <NotFound404
      title="Página no encontrada"
      message="La página del panel de usuario que buscas no existe. Verifica la URL o regresa al panel principal."
      showRetry={false}
    />
  );
}

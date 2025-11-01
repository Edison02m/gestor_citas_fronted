import NotFound404 from '@/components/landing/NotFound404';

export default function DashboardNotFound() {
  return (
    <NotFound404
      title="Página no encontrada"
      message="La página del dashboard que buscas no existe. Verifica la URL o regresa al panel principal."
      showRetry={false}
    />
  );
}

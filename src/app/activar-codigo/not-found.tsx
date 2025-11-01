import NotFound404 from '@/components/landing/NotFound404';

export default function ActivarCodigoNotFound() {
  return (
    <NotFound404
      title="Página no encontrada"
      message="La página de activación que buscas no existe. Verifica tu enlace de activación."
      showRetry={false}
    />
  );
}

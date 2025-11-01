import NotFound404 from '@/components/landing/NotFound404';

export default function NotFound() {
  return (
    <NotFound404
      title="Página no encontrada"
      message="Lo sentimos, la página que estás buscando no existe o ha sido movida."
      showRetry={false}
    />
  );
}

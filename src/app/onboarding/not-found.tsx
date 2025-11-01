import NotFound404 from '@/components/landing/NotFound404';

export default function OnboardingNotFound() {
  return (
    <NotFound404
      title="Página no encontrada"
      message="La página de configuración inicial que buscas no existe. Regresa al panel principal."
      showRetry={false}
    />
  );
}

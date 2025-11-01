import NotFound404 from '@/components/landing/NotFound404';

export default function AuthNotFound() {
  return (
    <NotFound404
      title="Página no encontrada"
      message="La página de autenticación que buscas no existe. Por favor, regresa al inicio de sesión."
      showRetry={false}
    />
  );
}

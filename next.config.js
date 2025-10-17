/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Suprimir warnings de hidratación causados por extensiones del navegador
  onRecoverableError: (error) => {
    // Ignorar errores de hidratación causados por extensiones
    if (error.message.includes('Hydration') || error.message.includes('hydration')) {
      return;
    }
  },
}

module.exports = nextConfig

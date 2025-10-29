/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Permitir solicitudes de desarrollo desde otras IPs de la red local
  allowedDevOrigins: [
    'http://192.168.0.108:3000',
    'http://localhost:3000',
  ],
  
  // Suprimir warnings de hidratación causados por extensiones del navegador
  onRecoverableError: (error) => {
    // Ignorar errores de hidratación causados por extensiones
    if (error.message.includes('Hydration') || error.message.includes('hydration')) {
      return;
    }
  },
}

module.exports = nextConfig

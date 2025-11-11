import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de CitaYA. Conoce cómo protegemos y manejamos tus datos personales.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center text-[#0490C8] hover:text-[#037ab0] font-semibold">
            ← Volver al inicio
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0490C8]/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-[#0490C8]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Política de Privacidad</h1>
          <p className="text-lg text-gray-600">Última actualización: 11 de noviembre de 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Introducción */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducción</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              En CitaYA, nos comprometemos a proteger tu privacidad y garantizar la seguridad de tu información personal. 
              Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos tus datos cuando utilizas nuestra plataforma.
            </p>
            <div className="bg-blue-50 border-l-4 border-[#0490C8] p-4 my-4">
              <p className="text-sm text-gray-700">
                <strong>Importante:</strong> Al usar CitaYA, aceptas las prácticas descritas en esta política.
              </p>
            </div>
          </section>

          {/* Información que recopilamos */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Información que Recopilamos</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1. Información Personal</h3>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Datos de registro:</strong> nombre, email, teléfono, nombre del negocio</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Información del negocio:</strong> dirección, horarios, servicios, empleados</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Datos de clientes:</strong> información ingresada sobre tus clientes (con su consentimiento)</span>
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2. Información Técnica</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Dirección IP, tipo de navegador, sistema operativo</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Cookies y tecnologías similares</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Datos de uso de la plataforma (páginas visitadas, tiempo de sesión)</span>
              </li>
            </ul>
          </section>

          {/* Cómo usamos tu información */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cómo Usamos tu Información</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Proporcionar el servicio:</strong> gestionar citas, enviar recordatorios, generar reportes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Comunicación:</strong> notificaciones por email y WhatsApp sobre citas y actualizaciones</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Mejora del servicio:</strong> análisis de uso para optimizar la plataforma</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Soporte técnico:</strong> resolver problemas y responder consultas</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Seguridad:</strong> prevenir fraudes y proteger la integridad del servicio</span>
              </li>
            </ul>
          </section>

          {/* Protección de datos */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Protección de Datos</h2>
            <p className="text-gray-700 mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Encriptación SSL/TLS para todas las comunicaciones</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Contraseñas encriptadas con bcrypt</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Bases de datos seguras con copias de respaldo</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Acceso restringido a datos personales (solo personal autorizado)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Monitoreo continuo de amenazas de seguridad</span>
              </li>
            </ul>
          </section>

          {/* Compartir información */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Compartir Información</h2>
            <p className="text-gray-700 mb-4">
              <strong>NO vendemos ni alquilamos tu información personal a terceros.</strong> Solo compartimos datos en casos específicos:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Proveedores de servicios:</strong> WhatsApp (Evolution API), email (Resend/SendGrid), hosting (Render.com, Vercel)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Requerimientos legales:</strong> cuando sea obligatorio por ley</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Con tu consentimiento:</strong> en cualquier otro caso, siempre pediremos tu autorización</span>
              </li>
            </ul>
          </section>

          {/* Tus derechos */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Tus Derechos</h2>
            <p className="text-gray-700 mb-4">Tienes derecho a:</p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Acceder</strong> a tus datos personales</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Rectificar</strong> información incorrecta o desactualizada</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Eliminar</strong> tu cuenta y datos asociados</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Exportar</strong> tus datos en formato legible</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Oponerte</strong> al procesamiento de tus datos en ciertos casos</span>
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              Para ejercer estos derechos, contáctanos en: <a href="mailto:citayaapp@gmail.com" className="text-[#0490C8] hover:underline">citayaapp@gmail.com</a>
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies y Tecnologías Similares</h2>
            <p className="text-gray-700 mb-4">
              Usamos cookies para mejorar tu experiencia. Puedes configurar tu navegador para rechazar cookies, 
              pero esto puede afectar la funcionalidad del sitio.
            </p>
            <p className="text-gray-700">
              <strong>Cookies que utilizamos:</strong> sesión, preferencias, análisis (Google Analytics), seguridad.
            </p>
          </section>

          {/* Retención de datos */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Retención de Datos</h2>
            <p className="text-gray-700">
              Conservamos tu información mientras mantengas una cuenta activa. Al eliminar tu cuenta, 
              borramos permanentemente tus datos personales en un plazo de 30 días, excepto cuando la ley 
              requiera su conservación.
            </p>
          </section>

          {/* Cambios en la política */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cambios en esta Política</h2>
            <p className="text-gray-700">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios 
              significativos por email o mediante un aviso en la plataforma.
            </p>
          </section>

          {/* Contacto */}
          <section className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tus datos, contáctanos:
            </p>
            <ul className="space-y-2">
              <li className="text-gray-700">
                <strong>Email:</strong> <a href="mailto:citayaapp@gmail.com" className="text-[#0490C8] hover:underline">citayaapp@gmail.com</a>
              </li>
              <li className="text-gray-700">
                <strong>WhatsApp:</strong> <a href="https://wa.me/593993527322" className="text-[#0490C8] hover:underline" target="_blank" rel="noopener noreferrer">+593 99 352 7322</a>
              </li>
              <li className="text-gray-700">
                <strong>Sitio web:</strong> <a href="https://citaya.site" className="text-[#0490C8] hover:underline">citaya.site</a>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Link href="/terminos" className="text-[#0490C8] hover:text-[#037ab0] font-medium">
              Ver Términos y Condiciones →
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>© 2025 CitaYA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

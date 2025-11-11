import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de CitaYA. Lee nuestros términos de servicio antes de usar la plataforma.',
};

export default function TermsPage() {
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
            <FileText className="w-8 h-8 text-[#0490C8]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Términos y Condiciones</h1>
          <p className="text-lg text-gray-600">Última actualización: 11 de noviembre de 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Aceptación */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Al acceder y utilizar CitaYA ("<strong>la Plataforma</strong>"), aceptas estar legalmente vinculado por estos 
              Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, 
              no debes usar nuestro servicio.
            </p>
            <div className="bg-blue-50 border-l-4 border-[#0490C8] p-4 my-4">
              <p className="text-sm text-gray-700">
                <strong>Importante:</strong> Al crear una cuenta o usar la plataforma, confirmas que has leído, 
                entendido y aceptado estos términos en su totalidad.
              </p>
            </div>
          </section>

          {/* Descripción del servicio */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descripción del Servicio</h2>
            <p className="text-gray-700 mb-4">
              CitaYA es una plataforma SaaS (Software as a Service) que permite a negocios gestionar citas, 
              clientes, empleados y servicios. El servicio incluye:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Gestión de citas y agenda digital</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Administración de clientes y empleados</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Recordatorios automáticos por WhatsApp y email</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Reportes y estadísticas de negocio</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Agenda pública para reservas online</span>
              </li>
            </ul>
          </section>

          {/* Periodo de prueba */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Período de Prueba Gratuito</h2>
            <p className="text-gray-700 mb-4">
              Al registrarte, recibes <strong>14 días de prueba gratuita</strong> con acceso completo al plan Negocios. 
              Durante este período:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">No se requiere información de pago</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Puedes cancelar en cualquier momento sin cargos</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Al finalizar el período, debes activar un plan de pago para continuar usando el servicio</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Si no activas un plan, tu cuenta quedará inactiva y perderás acceso a tus datos</span>
              </li>
            </ul>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4">
              <p className="text-sm text-gray-700">
                <strong>Nota:</strong> Limitamos los períodos de prueba a una cuenta por negocio/email. 
                No se permiten múltiples cuentas de prueba para el mismo negocio.
              </p>
            </div>
          </section>

          {/* Planes y pagos */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Planes y Pagos</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1. Suscripciones</h3>
            <p className="text-gray-700 mb-4">
              Ofrecemos planes de suscripción mensuales y anuales. Los precios actuales están disponibles en 
              <Link href="/planes" className="text-[#0490C8] hover:underline"> nuestra página de planes</Link>.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2. Activación de Códigos</h3>
            <p className="text-gray-700 mb-4">
              Puedes activar tu plan mediante códigos de suscripción. Cada código tiene una duración específica 
              (mensual o anual) y debe ser activado dentro del plazo de validez.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3. Renovación Automática</h3>
            <p className="text-gray-700 mb-4">
              Las suscripciones se renuevan automáticamente al final de cada período, excepto que canceles 
              antes de la fecha de renovación.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.4. Política de Reembolso</h3>
            <p className="text-gray-700 mb-2">
              Ofrecemos reembolsos completos dentro de los primeros <strong>7 días</strong> después de tu primer pago. 
              Para solicitar un reembolso:
            </p>
            <ul className="space-y-1 mb-4">
              <li className="text-gray-700 ml-6">• Contacta a <a href="mailto:citayaapp@gmail.com" className="text-[#0490C8] hover:underline">citayaapp@gmail.com</a></li>
              <li className="text-gray-700 ml-6">• Indica el motivo de insatisfacción</li>
              <li className="text-gray-700 ml-6">• Procesaremos el reembolso en 5-10 días hábiles</li>
            </ul>
            <p className="text-gray-700">
              Después de los 7 días, no ofrecemos reembolsos pero puedes cancelar tu suscripción en cualquier momento.
            </p>
          </section>

          {/* Uso aceptable */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Uso Aceptable</h2>
            <p className="text-gray-700 mb-4">Al usar CitaYA, te comprometes a:</p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Proporcionar información veraz y actualizada</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Mantener la confidencialidad de tus credenciales de acceso</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">No usar la plataforma para actividades ilegales o no autorizadas</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">No intentar acceder a cuentas o datos de otros usuarios</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">No realizar ingeniería inversa, modificar o distribuir el software</span>
              </li>
            </ul>

            <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
              <p className="text-sm text-gray-700">
                <strong>Prohibiciones:</strong> Spam, acoso, envío masivo no autorizado de mensajes, 
                sobrecarga de servidores, uso de bots no autorizados.
              </p>
            </div>
          </section>

          {/* Propiedad intelectual */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propiedad Intelectual</h2>
            <p className="text-gray-700 mb-4">
              CitaYA y todo su contenido (código, diseño, logotipos, textos, gráficos) son propiedad de CitaYA 
              y están protegidos por leyes de propiedad intelectual.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Tus datos:</strong> Conservas todos los derechos sobre la información que ingresas en la plataforma. 
              Nos concedes una licencia limitada para procesar tus datos únicamente con el fin de proporcionar el servicio.
            </p>
          </section>

          {/* Limitación de responsabilidad */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitación de Responsabilidad</h2>
            <p className="text-gray-700 mb-4">
              CitaYA se proporciona "<strong>tal cual</strong>" sin garantías de ningún tipo. No garantizamos que:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="text-gray-700 ml-6">• El servicio estará disponible 100% del tiempo sin interrupciones</li>
              <li className="text-gray-700 ml-6">• Todos los errores serán corregidos</li>
              <li className="text-gray-700 ml-6">• El servicio cumplirá todos tus requisitos específicos</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Exclusión de daños:</strong> En ningún caso CitaYA será responsable por daños indirectos, 
              incidentales, consecuentes o punitivos, incluida la pérdida de beneficios, datos o uso.
            </p>
            <p className="text-gray-700">
              <strong>Límite de responsabilidad:</strong> Nuestra responsabilidad total no excederá el monto 
              pagado por ti en los últimos 12 meses.
            </p>
          </section>

          {/* Disponibilidad del servicio */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disponibilidad del Servicio</h2>
            <p className="text-gray-700 mb-4">
              Nos esforzamos por mantener CitaYA disponible 24/7, pero pueden ocurrir:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Mantenimiento programado:</strong> te notificaremos con anticipación</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Interrupciones no planificadas:</strong> por problemas técnicos o causas fuera de nuestro control</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[#0490C8] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Actualizaciones:</strong> podemos actualizar la plataforma sin previo aviso</span>
              </li>
            </ul>
          </section>

          {/* Cancelación y terminación */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cancelación y Terminación</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1. Cancelación por tu Parte</h3>
            <p className="text-gray-700 mb-4">
              Puedes cancelar tu suscripción en cualquier momento desde tu panel de control. 
              La cancelación será efectiva al final del período de facturación actual.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2. Terminación por Nuestra Parte</h3>
            <p className="text-gray-700 mb-4">
              Podemos suspender o terminar tu cuenta si:
            </p>
            <ul className="space-y-2">
              <li className="text-gray-700 ml-6">• Violas estos Términos y Condiciones</li>
              <li className="text-gray-700 ml-6">• Realizas actividades fraudulentas o ilegales</li>
              <li className="text-gray-700 ml-6">• No pagas tu suscripción</li>
              <li className="text-gray-700 ml-6">• Usas el servicio de manera que perjudique a otros usuarios</li>
            </ul>
          </section>

          {/* Privacidad */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Privacidad y Protección de Datos</h2>
            <p className="text-gray-700 mb-4">
              El uso de CitaYA también está regido por nuestra{' '}
              <Link href="/privacidad" className="text-[#0490C8] hover:underline font-semibold">
                Política de Privacidad
              </Link>
              , que describe cómo recopilamos, usamos y protegemos tu información personal.
            </p>
            <p className="text-gray-700">
              Al usar la plataforma, también aceptas nuestra Política de Privacidad.
            </p>
          </section>

          {/* Modificaciones */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modificaciones a los Términos</h2>
            <p className="text-gray-700 mb-4">
              Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. 
              Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma.
            </p>
            <p className="text-gray-700">
              Te notificaremos sobre cambios significativos por email. El uso continuado de CitaYA después de 
              las modificaciones constituye tu aceptación de los nuevos términos.
            </p>
          </section>

          {/* Ley aplicable */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Ley Aplicable y Jurisdicción</h2>
            <p className="text-gray-700">
              Estos Términos se rigen por las leyes de la República del Ecuador. Cualquier disputa 
              será resuelta en los tribunales competentes de Ecuador.
            </p>
          </section>

          {/* Contacto */}
          <section className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Si tienes preguntas sobre estos Términos y Condiciones, contáctanos:
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

          {/* Aceptación final */}
          <div className="bg-[#0490C8] text-white rounded-xl p-6 my-8">
            <p className="text-center font-medium">
              Al usar CitaYA, confirmas que has leído, entendido y aceptado estos Términos y Condiciones, 
              así como nuestra Política de Privacidad.
            </p>
          </div>
        </div>

        {/* Footer navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Link href="/privacidad" className="text-[#0490C8] hover:text-[#037ab0] font-medium">
              Ver Política de Privacidad →
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

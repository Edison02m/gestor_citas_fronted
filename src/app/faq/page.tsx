import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes - CitaYA',
  description: 'Encuentra respuestas a las preguntas más comunes sobre CitaYA. Aprende cómo funciona nuestro sistema de gestión de citas.',
  alternates: {
    canonical: '/faq',
  },
};

const faqs = [
  {
    question: '¿Qué es CitaYA?',
    answer: 'CitaYA es un sistema de gestión de citas online diseñado para negocios que trabajan con agendamiento. Permite gestionar citas, clientes, empleados, servicios y enviar recordatorios automáticos por WhatsApp.'
  },
  {
    question: '¿Cómo funciona CitaYA?',
    answer: 'Después de registrarte, configuras tu negocio: servicios, empleados, horarios. Tus clientes pueden agendar citas desde tu agenda pública personalizada. Recibirás notificaciones y podrás enviar recordatorios automáticos.'
  },
  {
    question: '¿CitaYA tiene prueba gratis?',
    answer: 'Sí, CitaYA ofrece un plan gratuito con funcionalidades básicas para que pruebes el sistema. También puedes probar los planes premium durante 14 días sin costo.'
  },
  {
    question: '¿Qué tipos de negocios pueden usar CitaYA?',
    answer: 'CitaYA es ideal para peluquerías, salones de belleza, barberías, spas, centros estéticos, consultorios médicos, clínicas dentales, centros de masajes, estudios de tatuajes, gimnasios, academias y cualquier negocio que trabaje con citas.'
  },
  {
    question: '¿Puedo gestionar múltiples sucursales?',
    answer: 'Sí, con CitaYA puedes gestionar múltiples ubicaciones desde una sola cuenta. Cada sucursal puede tener sus propios horarios, empleados y servicios.'
  },
  {
    question: '¿Los recordatorios por WhatsApp son automáticos?',
    answer: 'Sí, puedes configurar recordatorios automáticos que se envían a tus clientes por WhatsApp antes de su cita. Tú decides cuándo enviarlos (24 horas antes, 1 hora antes, etc.).'
  },
  {
    question: '¿Mis clientes necesitan registrarse para agendar?',
    answer: 'No, tus clientes pueden agendar citas directamente desde tu agenda pública sin necesidad de crear una cuenta. Solo necesitan su nombre y número de teléfono.'
  },
  {
    question: '¿Puedo personalizar mi agenda pública?',
    answer: 'Sí, puedes personalizar los colores, logo, información de contacto y redes sociales de tu agenda pública para que coincida con la identidad de tu negocio.'
  },
  {
    question: '¿CitaYA tiene aplicación móvil?',
    answer: 'CitaYA es una aplicación web responsive que funciona perfectamente en cualquier dispositivo móvil. Puedes agregar un acceso directo a tu pantalla de inicio para usarla como una app.'
  },
  {
    question: '¿Cómo cancelo una cita?',
    answer: 'Puedes cancelar citas desde el calendario con un solo clic. Opcionalmente, puedes enviar una notificación automática al cliente informándole de la cancelación.'
  },
  {
    question: '¿Puedo ver estadísticas de mi negocio?',
    answer: 'Sí, CitaYA incluye reportes y estadísticas detalladas: ingresos, citas realizadas, clientes frecuentes, servicios más solicitados y métricas de rendimiento de tu negocio.'
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos tarjetas de crédito/débito y transferencias bancarias. Los pagos son procesados de forma segura a través de plataformas certificadas.'
  },
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer: 'Sí, puedes mejorar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente y ajustamos la facturación de forma proporcional.'
  },
  {
    question: '¿CitaYA guarda mis datos de forma segura?',
    answer: 'Sí, utilizamos encriptación SSL, almacenamiento seguro en la nube y cumplimos con las mejores prácticas de seguridad para proteger tus datos y los de tus clientes.'
  },
  {
    question: '¿Ofrecen soporte técnico?',
    answer: 'Sí, ofrecemos soporte por email y chat en vivo. Los planes premium incluyen soporte prioritario con tiempos de respuesta más rápidos.'
  }
];

export default function FAQPage() {
  // Schema markup para FAQ
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <>
      {/* Schema markup para rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
            Encuentra respuestas a las preguntas más comunes sobre CitaYA
          </p>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white list-none">
                  <span className="text-lg">{faq.question}</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">¿No encontraste tu respuesta?</h2>
            <p className="mb-6 opacity-90">
              Nuestro equipo de soporte está listo para ayudarte
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Comienza gratis
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

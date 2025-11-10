import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import GoogleAnalytics from '@/components/shared/GoogleAnalytics'
import Script from 'next/script'

export const metadata: Metadata = {
  title: {
    default: 'CitaYA - Sistema de Gestión de Citas Online | Agenda tu Negocio',
    template: '%s | CitaYA'
  },
  description: 'CitaYA es el sistema de gestión de citas más completo para tu negocio. Agenda online, recordatorios automáticos por WhatsApp, calendario inteligente y más. Prueba gratis.',
  keywords: [
    'agenda de citas',
    'sistema de citas online',
    'gestión de citas',
    'agendar citas',
    'calendario de citas',
    'software de citas',
    'app de citas',
    'reserva de citas',
    'citas online',
    'agenda para negocios',
    'gestión de clientes',
    'recordatorios automáticos',
    'WhatsApp citas',
    'peluquería agenda',
    'salón de belleza software',
    'consultorio médico citas',
    'spa agenda online',
    'barbería citas',
    'centro estético software',
    'CitaYA'
  ],
  authors: [{ name: 'CitaYA' }],
  creator: 'CitaYA',
  publisher: 'CitaYA',
  metadataBase: new URL('https://citaya.site'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://citaya.site',
    title: 'CitaYA - Sistema de Gestión de Citas Online para tu Negocio',
    description: 'Gestiona las citas de tu negocio de manera profesional. Agenda online, recordatorios automáticos por WhatsApp, reportes y más. ¡Prueba gratis!',
    siteName: 'CitaYA',
    images: [
      {
        url: '/Assets/logo_citaYA.png',
        width: 1200,
        height: 630,
        alt: 'CitaYA - Sistema de Gestión de Citas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CitaYA - Sistema de Gestión de Citas Online',
    description: 'Gestiona las citas de tu negocio de manera profesional. Agenda online, recordatorios automáticos por WhatsApp y más.',
    images: ['/Assets/logo_citaYA.png'],
    creator: '@CitaYA',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/Assets/logo_citaYA.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'eM6fLyuJ__3Rz6NRqziaf0HZyPFIIHzS3cWjmkiT4rI',
  },
  category: 'business',
  applicationName: 'CitaYA',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'CitaYA',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Structured Data (JSON-LD) para SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CitaYA',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Prueba gratis con planes premium disponibles'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '250'
    },
    description: 'Sistema de gestión de citas online con recordatorios automáticos por WhatsApp, calendario inteligente y gestión de clientes.',
    url: 'https://citaya.site',
    image: 'https://citaya.site/Assets/logo_citaYA.png',
    author: {
      '@type': 'Organization',
      name: 'CitaYA'
    },
    publisher: {
      '@type': 'Organization',
      name: 'CitaYA',
      logo: {
        '@type': 'ImageObject',
        url: 'https://citaya.site/Assets/logo_citaYA.png'
      }
    }
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TZTTRFFF');`
          }}
        />
        {/* End Google Tag Manager */}
        
        {/* JSON-LD Structured Data */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TZTTRFFF"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        {/* Google Analytics - Reemplaza con tu ID real cuando lo tengas */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

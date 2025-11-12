import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/dashboard-usuario', '/auth/', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/dashboard', '/dashboard-usuario', '/auth/', '/api/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/Assets/', '/*.jpg', '/*.jpeg', '/*.png', '/*.gif', '/*.svg', '/*.webp'],
      },
    ],
    sitemap: 'https://citaya.site/sitemap.xml',
  }
}

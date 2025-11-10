import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://citaya.site'
  const currentDate = new Date()
  
  // Páginas estáticas principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/planes`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/recuperar-contrasena`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  // TODO: Agendas públicas dinámicas
  // Cuando implementes la API para obtener negocios con agenda pública:
  // const negocios = await fetch('API_URL/negocios-publicos').then(r => r.json())
  // const agendasPublicas = negocios.map(negocio => ({
  //   url: `${baseUrl}/agenda/${negocio.slug}`,
  //   lastModified: new Date(negocio.updatedAt),
  //   changeFrequency: 'daily' as const,
  //   priority: 0.7,
  // }))
  // return [...staticPages, ...agendasPublicas]

  return staticPages
}

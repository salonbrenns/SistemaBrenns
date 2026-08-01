import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.AUTH_URL ?? "https://brennsbeauty.com"

  // Páginas estáticas
  const estaticas: MetadataRoute.Sitemap = [
    { url: base,                      lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/servicios`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/cursos`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/catalogo`,        lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/nosotros`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/aviso-privacidad`,lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/terminos`,        lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/faq`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]

  // Servicios dinámicos
  let servicios: MetadataRoute.Sitemap = []
  try {
    const data = await prisma.servicio.findMany({ where: { activo: true }, select: { id: true, updatedAt: true } })
    servicios = data.map(s => ({
      url: `${base}/servicio/${s.id}`,
      lastModified: s.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  } catch { /* si falla, no bloquear */ }

  // Cursos dinámicos
  let cursos: MetadataRoute.Sitemap = []
  try {
    const data = await prisma.curso.findMany({ where: { activo: true }, select: { id: true } })
    cursos = data.map(c => ({
      url: `${base}/curso/${c.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  } catch { /* si falla, no bloquear */ }

  // Productos dinámicos
  let productos: MetadataRoute.Sitemap = []
  try {
    const data = await prisma.producto.findMany({ where: { activo: true }, select: { id: true, updatedAt: true } })
    productos = data.map(p => ({
      url: `${base}/producto/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch { /* si falla, no bloquear */ }

  return [...estaticas, ...servicios, ...cursos, ...productos]
}

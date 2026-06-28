import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = process.env.AUTH_URL ?? "https://brennsbeauty.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/servicios", "/cursos", "/catalogo", "/nosotros", "/faq"],
        disallow: ["/admin/", "/empleado/", "/api/", "/perfil", "/mis-citas", "/mis-pedidos"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}

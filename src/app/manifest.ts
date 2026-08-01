import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Brenn's Beauty",
    short_name: "Brenn's",
    description:
      "Salón de uñas, academia de belleza y distribuidora oficial de marcas profesionales en México.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#be185d",
    orientation: "portrait",
    categories: ["beauty", "shopping", "lifestyle"],
    icons: [
      {
        src: "/logo/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/logo/portada.jpg",
        sizes: "1280x720",
        type: "image/jpeg",
      },
    ],
  }
}

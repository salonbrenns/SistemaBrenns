// src/app/layout.tsx
import "./globals.css"
import Providers from "@/components/ui/providers"
import type { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.AUTH_URL ?? "https://brennsbeauty.com"),
  title: {
    default: "Brenn's Beauty — Academia · Distribuidora · Salón",
    template: "%s | Brenn's Beauty",
  },
  description:
    "Salón de uñas, academia de belleza y distribuidora oficial de marcas profesionales en México. Agenda tu cita, inscríbete a cursos y compra en línea.",
  keywords: ["salón de uñas", "academia de belleza", "nail art", "cursos de uñas", "distribuidora", "México"],
  authors: [{ name: "Brenn's Beauty" }],
  creator: "Brenn's Beauty",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Brenn's Beauty",
    title: "Brenn's Beauty — Academia · Distribuidora · Salón",
    description: "Salón de uñas, academia y distribuidora oficial en México.",
    images: [{ url: "/logo/logo.png", width: 512, height: 512, alt: "Brenn's Beauty" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brenn's Beauty",
    description: "Salón de uñas, academia y distribuidora oficial en México.",
    images: ["/logo/logo.png"],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

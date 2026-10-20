// src/app/layout.tsx
import "./globals.css"
import Providers from "@/components/ui/providers"
import ToastContainer from "@/components/ui/ToastContainer"
import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#be185d" },
    { media: "(prefers-color-scheme: dark)",  color: "#9d174d" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

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
  icons: {
    icon: [
      { url: "/icons/brenns-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/brenns-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Brenn's Beauty",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      {/* El manifest va directo en <head>: si se deja en metadata, en páginas dinámicas
          como el Inicio Next lo manda al final del HTML y Chrome tarda en detectar la PWA */}
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  )
}

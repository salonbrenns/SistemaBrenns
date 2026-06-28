import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Servicios",
  description: "Descubre todos nuestros servicios de uñas: manicure, pedicure, nail art, gelish y más. Agenda tu cita en línea en Brenn's Beauty.",
  openGraph: { title: "Servicios | Brenn's Beauty", description: "Manicure, pedicure, nail art y más. Agenda en línea." },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

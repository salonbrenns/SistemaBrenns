import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cursos",
  description: "Aprende nail art y técnicas de uñas con nuestros cursos presenciales y en línea. Academia Brenn's Beauty — formación profesional en belleza.",
  openGraph: { title: "Cursos | Brenn's Beauty", description: "Cursos de nail art y belleza — Academia Brenn's." },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

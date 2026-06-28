import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce la historia de Brenn's Beauty — más de 10 años de experiencia en el mundo de la belleza. Salón, academia y distribuidora en México.",
  openGraph: { title: "Nosotros | Brenn's Beauty", description: "Conoce nuestra historia y equipo." },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

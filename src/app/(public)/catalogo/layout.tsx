import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Compra productos profesionales de uñas: esmaltes, geles, acrílicos y más. Distribuidora oficial de las mejores marcas en México.",
  openGraph: { title: "Catálogo | Brenn's Beauty", description: "Productos profesionales de uñas y belleza." },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

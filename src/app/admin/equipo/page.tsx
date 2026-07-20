// Esta página fue unificada dentro de /admin/empleadas (pestaña "Equipo en Nosotros").
// El redirect preserva cualquier bookmark o enlace viejo.
import { redirect } from "next/navigation"

export default function EquipoRedirect() {
  redirect("/admin/empleadas")
}

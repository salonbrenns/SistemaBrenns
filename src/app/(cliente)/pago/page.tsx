// Esta ruta ya no se usa en el flujo activo.
// El pago de servicios (citas) se gestiona directamente desde /agendar.
// Redirigimos para evitar páginas huérfanas.
import { redirect } from "next/navigation"

export default function PagoPage() {
  redirect("/agendar")
}

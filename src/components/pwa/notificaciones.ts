// Notificaciones del sistema (Notifications API).
// Se muestran a través del service worker porque Chrome en Android no permite `new Notification()`.

export type EstadoPermiso = NotificationPermission | "no-soportado"

export function notificacionesSoportadas() {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator
}

export function estadoPermiso(): EstadoPermiso {
  return notificacionesSoportadas() ? Notification.permission : "no-soportado"
}

// Avisa a los componentes que el permiso cambió (el navegador no tiene un evento para esto)
export function avisarCambioDePermiso() {
  window.dispatchEvent(new Event("pwa:permiso"))
}

export async function pedirPermiso(): Promise<EstadoPermiso> {
  if (!notificacionesSoportadas()) return "no-soportado"
  const resultado = await Notification.requestPermission()
  avisarCambioDePermiso()
  return resultado
}

interface OpcionesNotificacion {
  cuerpo: string
  url?: string      // página que se abre al tocar la notificación
  etiqueta?: string // misma etiqueta = reemplaza a la anterior en lugar de apilarse
}

export async function notificar(titulo: string, { cuerpo, url = "/", etiqueta }: OpcionesNotificacion) {
  if (estadoPermiso() !== "granted") return false

  const opciones: NotificationOptions = {
    body: cuerpo,
    icon: "/icons/brenns-192.png",
    badge: "/icons/brenns-192.png",
    lang: "es-MX",
    tag: etiqueta,
    data: { url },
  }

  const registro = await navigator.serviceWorker.getRegistration()
  if (registro) {
    await registro.showNotification(titulo, opciones)
  } else {
    // En desarrollo no hay service worker; en escritorio esto también funciona
    new Notification(titulo, opciones)
  }
  return true
}

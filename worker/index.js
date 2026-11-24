// Código propio del service worker. next-pwa lo compila y lo agrega a sw.js en cada build.

// Al tocar una notificación se abre la página que trae en data.url,
// o se enfoca la ventana de la app si ya está abierta en esa página
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const destino = new URL((event.notification.data && event.notification.data.url) || "/", self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      const abierta = ventanas.find((v) => v.url === destino)
      if (abierta) return abierta.focus()
      return self.clients.openWindow(destino)
    })
  )
})

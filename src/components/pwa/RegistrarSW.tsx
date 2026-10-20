"use client"
// next-pwa no registra el service worker solo cuando se usa la carpeta app/,
// así que lo registramos aquí al cargar la página.
// Además, en cuanto el SW toma el control, descargamos las páginas públicas
// para que funcionen sin internet aunque el usuario todavía no las haya abierto.

import { useEffect } from "react"

// Páginas que deben abrir offline desde el primer momento
const PAGINAS_OFFLINE = [
  "/", "/nosotros", "/politicas", "/aviso-privacidad",
  "/terminos", "/faq", "/catalogo", "/cursos", "/servicios",
]

// Datos que esas páginas piden al cargar
const APIS_OFFLINE = [
  "/api/config-sitio", "/api/faq", "/api/equipo", "/api/promociones",
  "/api/productos", "/api/cursos", "/api/servicios", "/api/marcas", "/api/categorias",
]

// Espera a que el service worker controle la página
function esperarControl(): Promise<void> {
  if (navigator.serviceWorker.controller) return Promise.resolve()
  return new Promise((resolve) => {
    navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true })
  })
}

async function precargarPaginas() {
  await navigator.serviceWorker.ready
  await esperarControl()

  // Pasan por el service worker, que las guarda en "paginas-publicas" y "api-publica"
  const urls = [...PAGINAS_OFFLINE, ...APIS_OFFLINE]
  const resultados = await Promise.allSettled(
    urls.map((url) => fetch(url, { credentials: "same-origin" }))
  )
  const guardadas = resultados.filter((r) => r.status === "fulfilled" && r.value.ok).length
  console.log(`[PWA] Páginas y datos guardados para usar sin conexión: ${guardadas}/${urls.length}`)
}

export default function RegistrarSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    // En desarrollo next-pwa no genera sw.js, así que no hay nada que registrar
    if (process.env.NODE_ENV !== "production") return

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        console.log("[PWA] Service worker registrado:", reg.scope)
        // Solo si hay internet y una vez por sesión; si no, se usa lo que ya estaba guardado
        let yaPrecargo = false
        try { yaPrecargo = sessionStorage.getItem("pwa-precarga") === "1" } catch {}
        if (navigator.onLine && !yaPrecargo) {
          precargarPaginas()
            .then(() => { try { sessionStorage.setItem("pwa-precarga", "1") } catch {} })
            .catch(() => {})
        }
      })
      .catch((err) => console.error("[PWA] Error al registrar el service worker:", err))
  }, [])

  return null
}

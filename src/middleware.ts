import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// ── Rate Limiter RASP ─────────────────────────────────────────
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(ip)
  if (!record || now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
    return false
  }
  record.count++
  if (record.count > MAX_ATTEMPTS) {
    console.warn(`[RASP] {"level":"WARNING","message":"Fuerza bruta detectada - IP bloqueada","ip":"${ip}","timestamp":"${new Date().toISOString()}"}`)
    return true
  }
  return false
}
// ─────────────────────────────────────────────────────────────

export default auth((req) => {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
  const path = req.nextUrl.pathname
  const { nextUrl } = req
  const session = req.auth
  const isLoggedIn = !!session
  const role = session?.user?.role

  // ── RASP: Protección fuerza bruta ──────────────────────────
  if (path.includes("/auth/callback/credentials")) {
    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera un momento." },
        { status: 429 }
      )
    }
  }
  // ──────────────────────────────────────────────────────────

  // ── Rutas de Admin (solo ADMIN) ─────────────────────────────
  if (path.startsWith("/admin")) {
    if (!isLoggedIn) {
      const url = new URL("/login", nextUrl.origin)
      url.searchParams.set("next", path)
      return NextResponse.redirect(url)
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl.origin))
    }
  }

  // ── Rutas de Empleado (EMPLEADO o ADMIN) ────────────────────
  if (path.startsWith("/empleado")) {
    if (!isLoggedIn) {
      const url = new URL("/login", nextUrl.origin)
      url.searchParams.set("next", path)
      return NextResponse.redirect(url)
    }
    if (role !== "EMPLEADO" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl.origin))
    }
  }

  // ── Rutas de Cliente (requieren sesión activa) ──────────────
  const rutasCliente = [
    "/perfil",
    "/carrito",
    "/checkout",
    "/pago",
    "/agendar",
    "/inscribirse",
    "/favoritos",
    "/mis-citas",
    "/mis-cursos",
    "/mis-mensajes",
    "/mis-pedidos",
    "/pedido",
  ]
  if (rutasCliente.some(r => path.startsWith(r)) && !isLoggedIn) {
    const url = new URL("/login", nextUrl.origin)
    url.searchParams.set("next", path)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/api/auth/callback/credentials",
    "/admin/:path*",
    "/empleado/:path*",
    // Rutas protegidas del grupo (cliente)
    "/perfil/:path*",
    "/carrito/:path*",
    "/checkout/:path*",
    "/pago/:path*",
    "/agendar/:path*",
    "/inscribirse/:path*",
    "/favoritos/:path*",
    "/mis-citas/:path*",
    "/mis-cursos/:path*",
    "/mis-mensajes/:path*",
    "/mis-pedidos/:path*",
    "/pedido/:path*",
  ],
}
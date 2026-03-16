import { auth } from "../auth"  // ← sube un nivel porque auth.ts está en la raíz
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const path = req.nextUrl.pathname
  const isLoggedIn = !!session
  const role = session?.user?.role

  console.log("🛡️ path:", path, "| role:", role, "| loggedIn:", isLoggedIn)

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

  if (path.startsWith("/docente")) {
    if (!isLoggedIn) {
      const url = new URL("/login", nextUrl.origin)
      url.searchParams.set("next", path)
      return NextResponse.redirect(url)
    }
    if (role !== "DOCENTE" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl.origin))
    }
  }

  const rutasCliente = ["/perfil", "/carrito", "/checkout", "/pago", "/mis-cursos", "/agendar", "/inscribirse"]
  if (rutasCliente.some(r => path.startsWith(r)) && !isLoggedIn) {
    const url = new URL("/login", nextUrl.origin)
    url.searchParams.set("next", path)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/admin/:path*",
    "/docente/:path*",
    "/perfil/:path*",
    "/carrito/:path*",
    "/checkout/:path*",
    "/pago/:path*",
    "/mis-cursos/:path*",
    "/agendar/:path*",
    "/inscribirse/:path*",
  ],
}
// src/lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      credentials: {
        correo: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.password) {
          throw new Error("Correo y contraseña requeridos")
        }

        // Llamada a la API Route (esto corre en Node.js, no en Edge)
        const baseUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

        const res = await fetch(`${baseUrl}/api/auth/credentials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo: credentials.correo,
            password: credentials.password,
          }),
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || "Error de autenticación")
        }

        return await res.json()
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id  = user.id
        token.sub = user.id as string  // respaldo nativo de NextAuth
        if ("role" in user) token.role = user.role as string
        if ("telefono" in user) token.telefono = user.telefono as string | null
      }

      // Consultar BD cuando:
      // 1. Login con Google (siempre en el primer sign-in)
      // 2. token.id es inválido (UUID de NextAuth en vez del ID numérico de la BD)
      //    → Esto sana sesiones viejas sin necesidad de que el usuario vuelva a iniciar sesión
      const tokenIdInvalido = !token.id || isNaN(Number(token.id as string))
      if ((account?.provider === "google" || tokenIdInvalido) && token.email) {
        try {
          const { prisma } = await import("@/lib/prisma")
          const dbUser = await prisma.usuario.findUnique({
            where:  { correo: token.email },
            select: { id: true, rol: true, telefono: true, activo: true, cuenta_bloqueada: true },
          })
          if (dbUser && dbUser.activo && !dbUser.cuenta_bloqueada) {
            token.id       = String(dbUser.id)
            token.role     = dbUser.rol
            token.telefono = dbUser.telefono
          }
        } catch (err) {
          console.error("Error consultando usuario en BD:", err)
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        // token.sub es el ID que NextAuth guarda automáticamente; token.id es el nuestro
        session.user.id       = (token.id ?? token.sub) as string
        session.user.role     = token.role as string
        session.user.telefono = token.telefono as string | null
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
})

export const runtime = "nodejs"
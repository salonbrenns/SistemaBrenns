// src/lib/auth.config.ts
// ⚠️ Este archivo NO debe importar Prisma ni nada de Node.js puro.
// Lo usa el middleware (Edge runtime) para validar sesiones.
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const authConfig = {
  trustHost: true,

  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      credentials: {
        correo:   { label: "Correo",     type: "email"    },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.password) {
          throw new Error("Correo y contraseña requeridos")
        }

        const baseUrl =
          process.env.NEXTAUTH_URL ??
          process.env.AUTH_URL ??
          process.env.NEXT_PUBLIC_BASE_URL ??
          "http://localhost:3000"

        const res = await fetch(`${baseUrl}/api/auth/credentials`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            correo:   credentials.correo,
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
    async jwt({ token, user }) {
      // Solo reasignamos cuando llega el usuario por primera vez (credentials)
      if (user) {
        token.id = user.id
        if ("role"     in user) token.role     = user.role     as string
        if ("telefono" in user) token.telefono = user.telefono as string | null
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id       = token.id       as string
        session.user.role     = token.role     as string
        session.user.telefono = token.telefono as string | null
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  session: {
    strategy: "jwt",
    maxAge:   24 * 60 * 60, // 24 horas
  },
} satisfies NextAuthConfig

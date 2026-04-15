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
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

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
        token.id = user.id
        // Sin 'any' para evitar error de ESLint
        if ("role" in user) token.role = user.role as string
        if ("telefono" in user) token.telefono = user.telefono as string | null
      }

      // Para usuarios de Google (se ejecuta en servidor, no en Edge)
      if (account?.provider === "google" && token.email) {
        // Aquí puedes llamar a otra API si quieres, pero por ahora lo dejamos simple
        // Si necesitas lógica pesada, crea otra ruta /api/auth/google-callback
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
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
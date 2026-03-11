import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        correo: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.password) {
          throw new Error("Correo y contraseña requeridos")
        }

        const usuario = await prisma.usuario.findUnique({
          where: { correo: credentials.correo as string },
        })

        if (!usuario) {
          throw new Error("Correo o contraseña incorrectos")
        }

        if (usuario.cuenta_bloqueada) {
          throw new Error("Tu cuenta está bloqueada. Contacta al administrador.")
        }

        if (!usuario.activo) {
          throw new Error("Tu cuenta está desactivada.")
        }

        const passwordValida = await bcrypt.compare(
          credentials.password as string,
          usuario.password
        )

        if (!passwordValida) {
          const intentos = usuario.intentos_fallidos + 1
          await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
              intentos_fallidos: intentos,
              cuenta_bloqueada: intentos >= 5,
            },
          })
          throw new Error("Correo o contraseña incorrectos")
        }

        // Resetear intentos al login exitoso
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { intentos_fallidos: 0 },
        })

        return {
          id: String(usuario.id),
          name: usuario.nombre,
          email: usuario.correo,
          role: usuario.rol,
        telefono: usuario.telefono,
        }
      },
    }),
  ],

  callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id // ← agregar
      token.role = (user as { role?: string }).role
      token.telefono = (user as { telefono?: string | null }).telefono
    }
    return token
  },
  async session({ session, token }) {
    session.user.id = token.id as string
    session.user.role = token.role as string
    session.user.telefono = token.telefono as string | null  // ← agregar
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
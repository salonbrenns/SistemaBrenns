import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// Definimos una interfaz para el usuario que retorna authorize
interface CustomUser {
  id: string
  name: string
  email: string
  role: string
}

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

        // Retornamos el objeto con el tipo esperado
        return {
          id: String(usuario.id),
          name: usuario.nombre,
          email: usuario.correo,
          role: usuario.rol,
        } as CustomUser
      },
    }),
  ],

 callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as CustomUser
        token.id = u.id
        token.role = u.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Asignamos el ID
        session.user.id = token.id as string
      
       Object.assign(session.user, { role: token.role as string })
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
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "./src/lib/prisma"
import bcrypt from "bcryptjs"

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
        try {
          const usuario = await prisma.usuario.findUnique({
            where: { correo: credentials.correo as string },
          })

          console.log("👤 Usuario:", usuario?.correo)
          console.log("🔑 Hash en BD:", usuario?.password?.substring(0, 20))
          console.log("📝 Password ingresada:", credentials.password)

          if (!usuario) throw new Error("Correo o contraseña incorrectos")
          if (usuario.cuenta_bloqueada) throw new Error("Tu cuenta está bloqueada.")
          if (!usuario.activo) throw new Error("Tu cuenta está desactivada.")

          const passwordValida = await bcrypt.compare(
            credentials.password as string,
            usuario.password
          )

          console.log("✅ Válida:", passwordValida)

          if (!passwordValida) {
            const intentos = usuario.intentos_fallidos + 1
            await prisma.usuario.update({
              where: { id: usuario.id },
              data: { intentos_fallidos: intentos, cuenta_bloqueada: intentos >= 5 },
            })
            throw new Error("Correo o contraseña incorrectos")
          }

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
        } catch (error) {
          throw error
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existe = await prisma.usuario.findUnique({
            where: { correo: user.email! },
          })
          if (!existe) {
            await prisma.$executeRaw`
              INSERT INTO seguridad.tblusuarios 
                (nombre, correo, password, rol, activo, intentos_fallidos, cuenta_bloqueada)
              VALUES 
                (${user.name ?? "Usuario Google"}, ${user.email!}, ${''},'CLIENTE', true, 0, false)
            `
          }
          return true
        } catch (err) {
          console.error("❌ Error creando usuario Google:", err)
          return false
        }
      }
      return true
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        token.telefono = (user as { telefono?: string | null }).telefono
      }
      if (account?.provider === "google" && token.email) {
        const usuario = await prisma.usuario.findUnique({
          where: { correo: token.email },
        })
        if (usuario) {
          token.id = String(usuario.id)
          token.role = usuario.rol
        }
      }
      return token
    },

    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      session.user.telefono = token.telefono as string | null
      return session
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
})
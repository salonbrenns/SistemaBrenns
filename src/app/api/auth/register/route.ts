import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { withRasp } from "@/lib/withRasp"
import { sendVerificacionEmail } from "@/lib/email"

// Rate limit: máx 5 registros por IP en 10 minutos
const intentos = new Map<string, { count: number; first: number }>()
const MAX_REGISTROS = 5
const VENTANA_MS    = 10 * 60 * 1000

function excedeLimite(ip: string): boolean {
  const ahora = Date.now()
  const rec   = intentos.get(ip)
  if (!rec || ahora - rec.first > VENTANA_MS) {
    intentos.set(ip, { count: 1, first: ahora })
    return false
  }
  rec.count++
  return rec.count > MAX_REGISTROS
}

async function registerHandler(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown"
  if (excedeLimite(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta de nuevo en unos minutos." },
      { status: 429 }
    )
  }
  try {
    const { name, email: emailRaw, password, telefono } = await req.json()

    // Normalizamos el correo: sin espacios y en minúsculas
    const email = String(emailRaw ?? "").trim().toLowerCase()

    if (!name || !email || !password || !telefono) {
      return NextResponse.json(
        { error: "Nombre, correo, teléfono y contraseña son requeridos" },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El formato del correo electrónico no es válido" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      )
    }

    // El registro público siempre crea un CLIENTE — nunca se acepta rol del body
    const rolFinal = "CLIENTE"

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo: email },
    })

    if (usuarioExistente) {
      const filas = await prisma.$queryRaw<{ correo_verificado: boolean }[]>`
        SELECT correo_verificado FROM seguridad.tblusuarios WHERE id = ${usuarioExistente.id}
      `

      // Si ya verificó su correo, la cuenta es de alguien más: no se puede registrar de nuevo
      if (filas[0]?.correo_verificado) {
        return NextResponse.json(
          { error: "Ya existe una cuenta con ese correo" },
          { status: 409 }
        )
      }

      // Cuenta sin verificar: generamos token nuevo y reenviamos el correo.
      // No tocamos la contraseña original para que nadie pueda pisar una cuenta ajena.
      const tokenNuevo  = crypto.randomBytes(32).toString("hex")
      const expiraNuevo = new Date(Date.now() + 60 * 60 * 1000)

      await prisma.$executeRaw`
        INSERT INTO seguridad.tbltoken_verificacion (usuario_id, token, expira)
        VALUES (${usuarioExistente.id}, ${tokenNuevo}, ${expiraNuevo})
        ON CONFLICT (usuario_id) DO UPDATE SET token = ${tokenNuevo}, expira = ${expiraNuevo}
      `

      const reenviado = await sendVerificacionEmail({
        to:     usuarioExistente.correo,
        nombre: usuarioExistente.nombre,
        token:  tokenNuevo,
      })

      if (!reenviado) {
        console.error(`No se pudo reenviar la verificación a ${usuarioExistente.correo}`)
      }

      return NextResponse.json(
        {
          message: "Te reenviamos el correo de verificación.",
          requiresVerification: true,
          emailEnviado: reenviado,
        },
        { status: 201 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // correo_verificado = false — debe verificar antes de iniciar sesión
    await prisma.$executeRaw`
      INSERT INTO seguridad.tblusuarios
        (nombre, correo, password, telefono, rol, activo, correo_verificado, intentos_fallidos, cuenta_bloqueada)
      VALUES
        (${name}, ${email}, ${passwordHash}, ${telefono}, ${rolFinal}::"Rol", true, false, 0, false)
    `

    const nuevoUsuario = await prisma.usuario.findUnique({
      where: { correo: email },
    })

    if (!nuevoUsuario) throw new Error("No se pudo recuperar el usuario creado")

    // Generar token de verificación (1 hora)
    const token  = crypto.randomBytes(32).toString("hex")
    const expira = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.$executeRaw`
      INSERT INTO seguridad.tbltoken_verificacion (usuario_id, token, expira)
      VALUES (${nuevoUsuario.id}, ${token}, ${expira})
      ON CONFLICT (usuario_id) DO UPDATE SET token = ${token}, expira = ${expira}
    `

    // Esperamos el envío: en Vercel la función se congela apenas responde,
    // y si el fetch a Brevo no terminó, el correo nunca sale.
    const enviado = await sendVerificacionEmail({
      to:     nuevoUsuario.correo,
      nombre: nuevoUsuario.nombre,
      token,
    })

    if (!enviado) {
      console.error(`No se pudo enviar la verificación a ${nuevoUsuario.correo}`)
    }

    // Aunque el correo falle, la cuenta ya existe: el usuario puede pedir el reenvío
    return NextResponse.json(
      {
        message: enviado
          ? "Cuenta creada. Revisa tu correo para verificarla."
          : "Cuenta creada, pero no pudimos enviar el correo. Solicita el reenvío.",
        requiresVerification: true,
        emailEnviado: enviado,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export const POST = withRasp(registerHandler);
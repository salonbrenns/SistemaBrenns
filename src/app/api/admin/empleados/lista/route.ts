// src/app/api/admin/empleados/lista/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Traer todos los activos y filtrar en JS para evitar el problema del enum
    const todos = await prisma.usuario.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, correo: true, rol: true },
      orderBy: { nombre: "asc" },
    })

    // Filtrar en JavaScript
    const empleados = todos.filter(u =>
      u.rol === "EMPLEADO" || u.rol === "ADMIN"
    )

    return NextResponse.json(empleados)
  } catch (e) {
    console.error("ERROR LISTA EMPLEADOS:", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
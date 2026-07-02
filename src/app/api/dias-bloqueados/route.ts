// src/app/api/dias-bloqueados/route.ts
// Ruta pública — el cliente la usa para deshabilitar fechas en el calendario

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const dias = await prisma.diaBloqueado.findMany({
    orderBy: { fecha: "asc" },
    select:  { id: true, fecha: true, motivo: true },
  })
  return NextResponse.json(dias)
}
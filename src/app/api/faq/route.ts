import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Solo preguntas activas para el público
export async function GET() {
  try {
    const faqs = await prisma.preguntaFrecuente.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      select: {
        id: true,
        pregunta: true,
        respuesta: true,
      },
    });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Error al obtener FAQ:", error);
    return NextResponse.json({ error: "Error al obtener preguntas" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todas las preguntas
export async function GET() {
  try {
    const faqs = await prisma.preguntaFrecuente.findMany({
      orderBy: { orden: "asc" },
    });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Error al obtener FAQ:", error);
    return NextResponse.json({ error: "Error al obtener preguntas" }, { status: 500 });
  }
}

// POST - Crear nueva pregunta
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pregunta, respuesta, orden, activo } = body;

    if (!pregunta || !respuesta) {
      return NextResponse.json({ error: "Pregunta y respuesta son requeridas" }, { status: 400 });
    }

    const faq = await prisma.preguntaFrecuente.create({
      data: {
        pregunta,
        respuesta,
        orden: orden ?? 0,
        activo: activo ?? true,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error("Error al crear FAQ:", error);
    return NextResponse.json({ error: "Error al crear pregunta" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Editar pregunta
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }   // ← Cambiado a Promise
) {
  try {
    const { id } = await params;                    // ← Await obligatorio
    const faqId = parseInt(id);

    const body = await req.json();
    const { pregunta, respuesta, orden, activo } = body;

    if (!pregunta || !respuesta) {
      return NextResponse.json(
        { error: "Pregunta y respuesta son requeridas" },
        { status: 400 }
      );
    }

    const faq = await prisma.preguntaFrecuente.update({
      where: { id: faqId },
      data: { pregunta, respuesta, orden, activo },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Error al editar FAQ:", error);
    return NextResponse.json(
      { error: "Error al editar pregunta" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar pregunta
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }   // ← Cambiado a Promise
) {
  try {
    const { id } = await params;                    // ← Await obligatorio
    const faqId = parseInt(id);

    await prisma.preguntaFrecuente.delete({ where: { id: faqId } });

    return NextResponse.json({ message: "Pregunta eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar FAQ:", error);
    return NextResponse.json(
      { error: "Error al eliminar pregunta" },
      { status: 500 }
    );
  }
}
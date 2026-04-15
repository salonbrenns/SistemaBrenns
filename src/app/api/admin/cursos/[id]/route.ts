import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }   // ← Cambiado a Promise
) {
  try {
    const { id } = await params;                     // ← Await obligatorio
    const data = await req.json();

    const curso = await prisma.curso.update({
      where: { id: Number(id) },
      data: {
        codigo: data.codigo,
        titulo: data.titulo,
        descripcion: data.descripcion || null,

        precio_total: Number(data.precio_total),
        cupo_maximo: Number(data.cupo_maximo),

        duracion_horas: data.duracion_horas
          ? Number(data.duracion_horas)
          : null,

        nivel: data.nivel || null,

        activo: Boolean(data.activo),

        fecha_inicio: data.fecha_inicio
          ? new Date(data.fecha_inicio)
          : null,

        fecha_fin: data.fecha_fin
          ? new Date(data.fecha_fin)
          : null,

        imagenes: Array.isArray(data.imagenes)
          ? data.imagenes
          : [],
      },
    });

    return NextResponse.json(curso);

  } catch (error) {
    console.error("ERROR UPDATE CURSO:", error);
    return NextResponse.json(
      { error: "Error al actualizar curso" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }   // ← Cambiado a Promise
) {
  try {
    const { id } = await params;                     // ← Await obligatorio
    const { activo } = await req.json();

    const curso = await prisma.curso.update({
      where: { id: Number(id) },
      data: { activo: Boolean(activo) },
    });

    return NextResponse.json(curso);

  } catch (error) {
    console.error("ERROR PATCH CURSO:", error);
    return NextResponse.json(
      { error: "Error al cambiar estado" },
      { status: 500 }
    );
  }
}
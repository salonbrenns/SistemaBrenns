import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return false
  return true
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const { id } = await params;
    const data = await req.json();

    if (!data.titulo?.trim())
      return NextResponse.json({ error: "El título es requerido" }, { status: 400 })
    if (!data.codigo?.trim())
      return NextResponse.json({ error: "El código es requerido" }, { status: 400 })
    if (!data.precio_total || Number(data.precio_total) <= 0)
      return NextResponse.json({ error: "El precio total debe ser mayor a 0" }, { status: 400 })
    if (!data.cupo_maximo || Number(data.cupo_maximo) < 1)
      return NextResponse.json({ error: "El cupo máximo debe ser al menos 1" }, { status: 400 })
    if (data.fecha_inicio && data.fecha_fin && new Date(data.fecha_fin) <= new Date(data.fecha_inicio))
      return NextResponse.json({ error: "La fecha de fin debe ser posterior a la de inicio" }, { status: 400 })

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
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
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
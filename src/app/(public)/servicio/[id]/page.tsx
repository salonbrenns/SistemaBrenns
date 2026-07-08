// src/app/(frontend)/servicio/[id]/page.tsx
import Image from "next/image"
import { Clock, Layers, CalendarCheck } from "lucide-react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import BotonAccion from "@/components/ui/BotonAccion"
import DetalleTabs from "@/components/ui/DetalleTabs"
import { FavoritoServicioBoton } from "@/components/ui/FavoritoServicioBoton"
import BackButton from "@/components/ui/BackButton"

export default async function DetalleServicio({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const servicio = await prisma.servicio.findUnique({
    where: { id: Number(id), activo: true },
    include: { categoria: { select: { nombre: true } } },
  }) as {
    id: number; nombre: string; descripcion: string | null
    precio: number; duracion: string; activo: boolean
    categoria: { nombre: string } | null
    imagen: string | null; beneficios: string | null; incluye: string | null
  } | null

  if (!servicio) return notFound()

  const precio = Number(servicio.precio).toLocaleString('es-MX')

  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 transition-colors">

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
        <BackButton fallbackHref="/servicios" label="Volver a todos los servicios" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* ── Imagen ── */}
          <div className="lg:sticky lg:top-8">
            <div className="relative rounded-3xl overflow-hidden bg-pink-50 dark:bg-gray-800 shadow-2xl aspect-square">
              {servicio.imagen ? (
                <Image src={servicio.imagen} alt={servicio.nombre} fill
                  sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl">✨</div>
              )}

              {/* Duración */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-gray-900/75 backdrop-blur-sm text-white px-4 py-1.5 rounded-full font-bold shadow-lg text-xs border border-white/10">
                <Clock className="w-3.5 h-3.5 text-pink-400" />
                {servicio.duracion}
              </div>

              {/* Favorito */}
              <div className="absolute top-4 right-4">
                <FavoritoServicioBoton
                  servicioId={servicio.id}
                  className="bg-gray-900/60 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-pink-600 text-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* ── Info ── */}
          <div className="space-y-7">

            {/* Categoría */}
            {servicio.categoria && (
              <span className="inline-flex items-center gap-1.5 bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                <Layers className="w-3 h-3" /> {servicio.categoria.nombre}
              </span>
            )}

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
              {servicio.nombre}
            </h1>

            {/* Precio — rediseñado */}
            <div className="flex items-end gap-4 bg-pink-700 dark:bg-pink-800 rounded-2xl px-7 py-5 shadow-lg shadow-pink-900/20">
              <div>
                <p className="text-xs font-bold text-pink-200 uppercase tracking-widest mb-1">Precio del servicio</p>
                <p className="text-5xl font-black text-white leading-none">
                  ${precio}
                </p>
              </div>
              <span className="text-lg font-bold text-pink-200 mb-1">MXN</span>
            </div>

            {/* Tabs */}
            <DetalleTabs
              descripcion={servicio.descripcion || ""}
              beneficios={servicio.beneficios   || ""}
              incluye={servicio.incluye         || ""}
            />

            {/* CTA */}
            <div className="pt-2 space-y-3">
              <BotonAccion
                tipo="agendar"
                href={`/agendar?servicioId=${servicio.id}`}
                textoLogueado="Agendar Cita Ahora"
              textoNoLogueado="Inicia sesión para agendar"
            />
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5" /> Elige fecha y hora al agendar
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
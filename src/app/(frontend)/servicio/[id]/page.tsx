// src/app/(frontend)/servicio/[id]/page.tsx
import Image from "next/image"
import Link from "next/link"
import { Clock, Heart, ArrowLeft, Star } from "lucide-react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import BotonAccion from "@/components/ui/BotonAccion"
import DetalleTabs from "@/components/ui/DetalleTabs"

type Servicio = {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  duracion: string
  categoria: string
  imagen: string | null
  activo: boolean
  // ← Nuevos campos agregados
  beneficios: string | null
  incluye: string | null
}

export default async function DetalleServicio({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const servicio = await prisma.servicio.findUnique({
    where: { id: Number(id), activo: true },
  })as Servicio | null;

  if (!servicio) return notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        <Link 
          href="/servicios" 
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium mb-10 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
          Volver a todos los servicios
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Imagen */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square lg:aspect-auto lg:min-h-[560px] bg-pink-100">
            {servicio.imagen ? (
              <Image 
                src={servicio.imagen} 
                alt={servicio.nombre} 
                fill 
                className="object-cover" 
                priority 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-9xl bg-pink-50">✨</div>
            )}

            <button className="absolute top-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl hover:bg-white transition hover:scale-110">
              <Heart className="w-7 h-7 text-pink-600" />
            </button>
          </div>

          {/* Información */}
          <div className="flex flex-col">
            <div>
              <span className="inline-block bg-pink-100 text-pink-700 px-5 py-2 rounded-full text-sm font-bold tracking-wide">
                {servicio.categoria}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 leading-tight">
                {servicio.nombre}
              </h1>
            </div>

            <div className="flex items-center gap-6 mt-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-pink-600" />
                <span className="font-medium text-lg">{servicio.duracion}</span>
              </div>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>

            {/* Precio */}
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-1">Precio del servicio</p>
              <p className="text-5xl font-black text-pink-600">
                ${Number(servicio.precio).toLocaleString()}
                <span className="text-2xl font-normal text-gray-500"> MXN</span>
              </p>
            </div>

            {/* Pestañas Dinámicas */}
            <div className="mt-10 flex-1">
              <DetalleTabs 
                descripcion={servicio.descripcion || ""} 
                beneficios={servicio.beneficios || ""} 
                incluye={servicio.incluye || ""} 
              />
            </div>

            {/* Botón Agendar */}
            <div className="mt-12">
              <BotonAccion
                tipo="agendar"
                href={`/agendar?servicioId=${servicio.id}`}
                textoLogueado="Agendar Cita Ahora"
                textoNoLogueado="Inicia sesión para agendar"
                //className="w-full py-4 text-lg font-bold rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import Link from "next/link" //Este
import PromoBanner from "@/components/ui/PromoBanner"
import Hero from "@/components/ui/Hero"
import CarruselServicios from "@/components/ui/CarruselServicios"
import CarruselProductos from "@/components/ui/CarruselProductos"
import CarruselMarcas from "@/components/ui/CarruselMarcas"
import { ArrowRight, Clock, GraduationCap } from "lucide-react"
import { prisma } from "@/lib/prisma"

async function getServicios() {
  try {
    const servicios = await prisma.servicio.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, precio: true, duracion: true, imagen: true, categoria: true },
      orderBy: { nombre: "asc" },
    })
    return servicios.map(s => ({ ...s, precio: Number(s.precio) }))
  } catch { return [] }
}

async function getProductos() {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      select: {
        id: true, nombre: true, precio_venta: true, imagen: true,
        marca: { select: { nombre: true } },
      },
      orderBy: { id: "desc" },
    })
    return productos.map(p => ({ ...p, precio_venta: Number(p.precio_venta) }))
  } catch { return [] }
}

export default async function Home() {
  const [servicios, productos] = await Promise.all([getServicios(), getProductos()])

  const marcas = [
    { nombre: "Sara Apolinar", img: "sara-apolinar.png" },
    { nombre: "GC Nails",      img: "gc-nails.png" },
    { nombre: "MC Nails",      img: "mc-nails.jpg" },
    { nombre: "Fantasy Nails", img: "fantasy-nails.png" },
    { nombre: "NGHIA",         img: "nghia.png" },
    { nombre: "Maria Cibeles", img: "maria-cibeles.jpg" },
    { nombre: "Lovely Nails",  img: "lovely-nails.png" },
    { nombre: "NailTech",      img: "nailtech.png" },
    { nombre: "Kalanzi",       img: "kalanzi.jpg" },
    { nombre: "Le MUSSA",      img: "mussa.jpg" },
    { nombre: "Golden Nails",  img: "golden-nails.png" },
    { nombre: "Miss Cherry",   img: "miss-cherry.png" },
    { nombre: "Wapizima",      img: "wapizima.png" },
    { nombre: "SUNUV",         img: "sunuv.png" },
    { nombre: "Manikura Pro",  img: "manikura.jpg" },
    { nombre: "Sweet",         img: "sweet.png" },
  ]

  return (
    <div className="min-h-screen bg-white">
      <PromoBanner />
      <Hero />

       <CarruselMarcas marcas={marcas} />
    

      {/* ── 1. SERVICIOS con carrusel ── */}
      <CarruselServicios servicios={servicios} />

      {/* ── 2. PRODUCTOS con carrusel ── */}
    <CarruselProductos productos={productos.map(p => ({
  ...p,
  imagen: typeof p.imagen === 'string' ? p.imagen : null
}))} />

      {/* ── 4. ACADEMIA ── */}
      <section className="bg-pink-50/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-pink-600 text-xs font-bold uppercase tracking-widest mb-1">Aprende con nosotras</p>
              <h2 className="text-3xl font-bold text-gray-900">Academia Brenn&apos;s</h2>
            </div>
            <Link href="/cursos" className="inline-flex items-center gap-1.5 text-pink-600 font-semibold hover:text-pink-700 transition text-sm group">
              Ver todos los cursos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 1, nombre: "Manicura Básica",   categoria: "Principiante", precio: 1500, duracion: "4 Semanas" },
              { id: 2, nombre: "Nail Art Avanzado", categoria: "Intermedio",   precio: 2200, duracion: "2 Semanas" },
              { id: 3, nombre: "Pedicura Spa",      categoria: "Especialidad", precio: 1800, duracion: "3 Semanas" },
            ].map(c => (
              <Link key={c.id} href="/cursos"
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-pink-200 hover:shadow-lg transition-all">
                <div className="relative h-48 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                  <GraduationCap className="w-12 h-12 text-pink-300 group-hover:scale-110 transition-transform" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-pink-500 uppercase tracking-wide">{c.categoria}</span>
                  <h3 className="font-bold text-gray-900 mt-1 mb-3">{c.nombre}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-pink-600">${c.precio.toLocaleString()} MXN</span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />{c.duracion}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
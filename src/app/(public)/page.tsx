// src/app/(frontend)/page.tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Inicio",
  description: "Bienvenida a Brenn's Beauty — salón de uñas, academia de belleza y distribuidora oficial en México. Agenda tu cita o inscríbete a nuestros cursos.",
  openGraph: { title: "Brenn's Beauty — Inicio", description: "Salón · Academia · Distribuidora en México" },
}

export const revalidate = 0
import PromoBanner from "@/components/ui/PromoBanner"
import Hero from "@/components/ui/Hero"
import CarruselServicios from "@/components/ui/CarruselServicios"
import CarruselProductos from "@/components/ui/CarruselProductos"
import MarcasUniverso from "@/components/ui/MarcasUniverso"
import CarruselCursos from "@/components/ui/CarruselCursos"

import { prisma } from "@/lib/prisma"

async function getServicios() {
  try {
    const servicios = await prisma.servicio.findMany({
      where: { activo: true },
      select: {
        id:       true,
        nombre:   true,
        precio:   true,
        duracion: true,
        imagen:   true,
        categoria: { select: { id: true, nombre: true, activo: true } },
      },
      orderBy: { nombre: "asc" },
    })
    return servicios.map((s: typeof servicios[number]) => ({ ...s, precio: Number(s.precio) }))
  } catch { return [] }
}

async function getProductos() {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      select: {
        id:     true,
        nombre: true,
        imagen: true,
        marca:  { select: { nombre: true } },
        variantes: {
          where:  { activo: true },
          select: { precio_venta: true },
        },
      },
      orderBy: { id: "desc" },
      take: 12,
    })

    return productos.map((p: typeof productos[number]) => {
      const precios = p.variantes.map((v: typeof p.variantes[number]) => Number(v.precio_venta))
      return {
        id:           p.id,
        nombre:       p.nombre,
        imagen:       p.imagen,
        marca:        p.marca,
        precio_venta: precios.length > 0 ? Math.min(...precios) : 0,
      }
    })
  } catch { return [] }
}

async function getCursos() {
  try {
    const cursos = await prisma.curso.findMany({
      where: { activo: true },
      select: {
        id: true,
        titulo: true,
        precio_total: true,
        duracion_horas: true,
        nivel: true,
        imagenes: true,
      },
      orderBy: { id: "desc" },
      take: 9,
    });

    return cursos.map((c: typeof cursos[number]) => ({
      ...c,
      precio_total: Number(c.precio_total),
      // Aquí hacemos la conversión explícita para que TypeScript no se queje
      imagenes: (c.imagenes as string[]) || [] 
    }));
  } catch (error) {
    console.error("Error cargando cursos:", error);
    return [];
  }
}

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

type ProductoCarrusel = {
  id: number
  nombre: string
  imagen: string | null
  marca: { nombre: string } | null
  precio_venta: number
}

export default async function Home() {
  const [servicios, productos, cursos] = await Promise.all([getServicios(), getProductos(), getCursos()])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <PromoBanner />
      <Hero />

      {/* ── SERVICIOS ── */}
      <CarruselServicios servicios={servicios} />

      {/* ── PRODUCTOS ── */}
      <CarruselProductos productos={productos as ProductoCarrusel[]} />

      <MarcasUniverso marcas={marcas} />

      {/* ── CURSOS ── */}
      <CarruselCursos cursos={cursos} />
    </div>
  )
}

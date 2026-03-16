"use client"

import { useState, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { useSession } from "next-auth/react"
import { ChevronLeft, Star, Plus, Minus, ShoppingBag } from "lucide-react"

const productos = {
  "1": { id: 1, nombre: "Esmalte Rojo", precio: 15000, categoria: "Nail Art", marca: "Renova Matte", img: "/catalogo/Rojo.jpg", rating: 4.5, reviews: 128, descripcion: "Un hermoso esmalte de color rojo que aporta un toque de elegancia a tus uñas." },
  "2": { id: 2, nombre: "Removedor Sin Acetona", precio: 16000, categoria: "Foot Care", marca: "Brenn's Care", img: "/catalogo/renovador.jpg", rating: 4.8, reviews: 89, descripcion: "Removedor suave sin acetona, ideal para uñas sensibles." },
  "3": { id: 3, nombre: "Kit Manicura Profesional", precio: 45000, categoria: "Salon Pro", marca: "Brenn's", img: "/catalogo/kit.jpg", rating: 5.0, reviews: 203, descripcion: "Kit completo con todo lo necesario para manicura profesional." }
}

export default function ProductoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const producto = productos[id as keyof typeof productos]
  const { data: session, status } = useSession()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [agregado, setAgregado] = useState(false)

  if (!producto) return notFound()

  // Mientras carga la sesión no mostrar nada para evitar parpadeo
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  const autenticado = !!session

  type CartItem = {
  id: number
  nombre: string
  precio: number
  cantidad: number
  img: string
}
  const agregarAlCarrito = () => {
    const stored = localStorage.getItem("nail_store_cart") || "[]"
    const carrito = JSON.parse(stored)
    const existe = carrito.find((item: CartItem) => item.id === producto.id)
const nuevoCarrito = existe
  ? carrito.map((item: CartItem) =>
      item.id === producto.id ? { ...item, cantidad: item.cantidad + quantity } : item
    )
      : [...carrito, { ...producto, cantidad: quantity }]

    localStorage.setItem("nail_store_cart", JSON.stringify(nuevoCarrito))
    window.dispatchEvent(new Event("carrito-actualizado"))
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <Link href="/catalogo" className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold mb-8">
          <ChevronLeft className="w-5 h-5" />
          Volver al Catálogo
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Imagen */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-pink-100">
            <Image src={producto.img} alt={producto.nombre} width={600} height={600} className="object-cover w-full h-auto" priority />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <span className="bg-pink-100 text-pink-700 px-4 py-1 rounded-full text-xs font-bold w-fit mb-4">{producto.categoria}</span>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{producto.nombre}</h1>
            <p className="text-pink-600 font-medium mb-6">{producto.marca}</p>

            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-bold">{producto.rating}</span>
              <span className="text-gray-400 text-sm">({producto.reviews} reseñas)</span>
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">{producto.descripcion}</p>

            <div className="text-3xl font-bold text-pink-600 mb-8">${(producto.precio / 100).toFixed(2)} MXN</div>

            {autenticado ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-pink-100 rounded-full p-1">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 hover:bg-pink-50 rounded-full transition">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="p-2 hover:bg-pink-50 rounded-full transition">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={agregarAlCarrito}
                    className={`flex-1 py-4 rounded-full font-bold shadow-lg transition flex items-center justify-center gap-2 ${
                      agregado
                        ? "bg-green-500 text-white"
                        : "bg-pink-600 hover:bg-pink-700 text-white"
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {agregado ? "¡Agregado!" : "Agregar al Carrito"}
                  </button>
                </div>
                <button
                  onClick={() => router.push("/carrito")}
                  className="w-full border-2 border-pink-300 text-pink-600 py-4 rounded-full font-bold hover:bg-pink-50 transition"
                >
                  Ver Carrito
                </button>
              </div>
            ) : (
              <Link
                href={`/login?next=/producto/${id}`}
                className="w-full bg-gray-800 text-white py-4 rounded-full font-bold text-center block hover:bg-gray-900 transition"
              >
                Inicia sesión para comprar
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
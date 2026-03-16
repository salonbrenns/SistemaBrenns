"use client"

import Image from "next/image"
import Link from "next/link"
import AuthGuard from "@/components/ui/AuthGuard"
import Breadcrumb from "@/components/Breadcrumb"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { useState, useEffect, useMemo } from "react"

const ENVIO_GRATIS_DESDE = 150000
const COSTO_ENVIO = 10000

type CartItem = {
  id: number
  nombre: string
  categoria: string
  precio: number
  cantidad: number
  img: string
}

export default function CarritoPage() {
  // Estado movido aquí para que el título pueda acceder al contador
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Calculamos el total de artículos basado en el estado
  const totalArticulos = useMemo(() => 
    items.reduce((sum, item) => sum + item.cantidad, 0), 
  [items])

 useEffect(() => {
  const stored = localStorage.getItem("nail_store_cart")
  const parsed = stored ? JSON.parse(stored) : []
  setItems(parsed)
  setIsLoaded(true)
}, [])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <Breadcrumb items={[
            { label: "Catálogo", href: "/catalogo-privada" },
            { label: "Carrito", href: "#", active: true }
          ]} />

          <div className="flex items-center gap-3 mb-10">
            <ShoppingBag className="w-10 h-10 text-pink-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Tu Carrito de Compras ({isLoaded ? totalArticulos : 0} Artículos)
            </h1>
          </div>

          <div suppressHydrationWarning>
            <CarritoClient items={items} setItems={setItems} totalArticulos={totalArticulos} />
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

/* ====================== CLIENT COMPONENT ====================== */

function CarritoClient({ 
  items, 
  setItems, 
  totalArticulos 
}: { 
  items: CartItem[], 
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>,
  totalArticulos: number
}) {
  
  const actualizarCantidad = (id: number, delta: number) => {
    const nuevos = items
      .map(item => item.id === id ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item)
      .filter(item => item.cantidad > 0)
    
    setItems(nuevos)
    localStorage.setItem("nail_store_cart", JSON.stringify(nuevos))
    window.dispatchEvent(new Event("carrito-actualizado"))
  }

  const eliminar = (id: number) => {
    const nuevos = items.filter(item => item.id !== id)
    setItems(nuevos)
    localStorage.setItem("nail_store_cart", JSON.stringify(nuevos))
    window.dispatchEvent(new Event("carrito-actualizado"))
  }

  const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
  const envio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO
  const total = subtotal + envio

  if (items.length === 0) {
    return (
      <div className="text-center py-32">
        <ShoppingBag className="w-24 h-24 mx-auto text-pink-200 mb-6" />
        <p className="text-2xl font-semibold text-gray-600">Tu carrito está vacío</p>
        <Link href="/catalogo-privada" className="mt-6 inline-block bg-pink-600 text-white font-bold px-8 py-4 rounded-full">
          Ir al Catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Productos */}
      <div className="lg:col-span-2 space-y-6">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 flex gap-6">
              <div className="relative w-28 h-36 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                <Image src={item.img} alt={item.nombre} fill className="object-cover" />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">{item.nombre}</h3>
                <p className="text-pink-600 text-sm font-medium">{item.categoria}</p>
                <p className="text-3xl font-bold text-gray-900 mt-3">
                  ${(item.precio / 100).toFixed(2)}
                </p>
              </div>

              <div className="flex flex-col justify-between items-end">
                <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                  <button onClick={() => actualizarCantidad(item.id, -1)} className="p-3 hover:bg-gray-100 rounded-full">
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 font-bold text-lg">{item.cantidad}</span>
                  <button onClick={() => actualizarCantidad(item.id, +1)} className="p-3 hover:bg-gray-100 rounded-full">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <button onClick={() => eliminar(item.id)} className="text-red-500 hover:text-red-700 mt-4">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100 sticky top-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumen del Pedido</h2>

          <div className="space-y-4 text-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal ({totalArticulos} artículo{totalArticulos !== 1 && "s"}):</span>
              <span className="font-bold">${(subtotal / 100).toFixed(2)}</span>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <span className="text-gray-600">Envío:</span>
              {envio === 0 ? (
                <span className="text-green-600 font-bold">GRATIS</span>
              ) : (
                <span className="font-bold">${(envio / 100).toFixed(2)}</span>
              )}
            </div>

            {subtotal < ENVIO_GRATIS_DESDE && subtotal > 0 && (
              <p className="text-sm text-gray-500 pt-3">
                Te faltan ${((ENVIO_GRATIS_DESDE - subtotal) / 100).toFixed(2)} para envío gratis
              </p>
            )}
          </div>

          <div className="mt-8 pt-6 border-t-2 border-pink-200">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-800">Total:</span>
              <span className="text-3xl font-bold text-pink-600">
                ${(total / 100).toFixed(2)}
              </span>
            </div>
          </div>

          <Link href="/checkout">
            <button className="w-full mt-8 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xl py-5 rounded-full shadow-lg transition transform hover:scale-105">
              Proceder al Pago
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
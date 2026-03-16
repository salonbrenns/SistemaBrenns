"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import Breadcrumb from "./Breadcrumb"

type Producto = {
  id: number
  nombre: string
  precio: number
  categoria: string
  marca?: string
  img?: string
  rating?: number
  reviews?: number
  descripcion?: string
  qr?: string
}

export default function ProductDetailPublic({ producto }: { producto: Producto }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <Breadcrumb items={[
          { label: "Catálogo", href: "/catalogo" },
          { label: producto.nombre, href: "#", active: true }
        ]} />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              {producto.img ? (
                <Image src={producto.img} alt={producto.nombre} width={600} height={600} className="object-cover w-full h-auto" />
              ) : (
                <div className="w-full h-60 bg-gray-100 flex items-center justify-center">Imagen no disponible</div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <span className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-bold mb-4">
                {producto.categoria}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{producto.nombre}</h1>
              {producto.marca && <p className="text-lg text-pink-600 font-medium">{producto.marca}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(producto.rating ?? 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-gray-600 text-sm">({producto.rating ?? "0"}) • {producto.reviews ?? 0} reseñas</span>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed">{producto.descripcion}</p>

            <div className="bg-gradient-to-r from-pink-100 to-pink-50 rounded-2xl p-6 text-center">
              <p className="text-4xl font-bold text-pink-600">${(producto.precio / 100).toFixed(2)}<span className="text-xl font-normal text-gray-600"> MXN</span></p>
            </div>

            {/* Botón para iniciar sesión y comprar */}
            <Link href="/login">
              <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg py-4 rounded-full shadow-xl transition-all active:scale-95">
                Inicia Sesión para Comprar
              </button>
            </Link>

            {producto.qr && (
              <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Escanea el QR</h3>
                <p className="text-sm text-gray-600 mb-4">Comparte este producto con tus amigos</p>
                <div className="flex justify-center">
                  <div className="relative rounded-xl overflow-hidden max-w-[200px]">
                    <Image src={producto.qr} alt={`QR Code de ${producto.nombre}`} width={200} height={200} className="object-cover w-full h-full" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

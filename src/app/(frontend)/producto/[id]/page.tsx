import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Heart, ShoppingBag, Tag, Layers, Package } from 'lucide-react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function DetalleProducto({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const producto = await prisma.producto.findUnique({
    where: { id: Number(id), activo: true },
    include: {
      marca: true,
      categoria: true,
    },
  })

  if (!producto) return notFound()

  // Normalizar imágenes desde JsonValue
  const imagenes: string[] = Array.isArray(producto.imagen)
    ? (producto.imagen as string[]).filter(u => typeof u === 'string')
    : typeof producto.imagen === 'string'
    ? [producto.imagen]
    : []

  const imagenPrincipal = imagenes[0] ?? null
  const imagenesSecundarias = imagenes.slice(1)
  const sinStock = producto.stock === 0

  return (
    <div className="min-h-screen bg-[#fffafa]">

      {/* Nav breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-800 font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al catálogo
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* ── Galería de imágenes ── */}
          <div className="space-y-3 lg:sticky lg:top-8">
            {/* Imagen principal */}
            <div className="relative rounded-3xl overflow-hidden bg-rose-50 shadow-xl aspect-square">
              {imagenPrincipal ? (
                <Image
                  src={imagenPrincipal}
                  alt={producto.nombre}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-24 h-24 text-rose-200" />
                </div>
              )}

              {/* Badge agotado */}
              {sinStock && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="bg-white text-gray-800 text-sm font-black px-6 py-3 rounded-full shadow-lg uppercase tracking-widest">
                    Agotado
                  </span>
                </div>
              )}

              {/* Favorito */}
              <button
                aria-label="Añadir a favoritos"
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl hover:bg-rose-600 hover:text-white transition-all text-rose-600"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Miniaturas */}
            {imagenesSecundarias.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {imagenesSecundarias.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-rose-50 border-2 border-rose-100 hover:border-rose-400 transition-colors cursor-pointer shadow-sm"
                  >
                    <Image
                      src={url}
                      alt={`${producto.nombre} vista ${i + 2}`}
                      fill
                      sizes="(max-width: 1024px) 33vw, 15vw"
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Info del producto ── */}
          <div className="space-y-6">

            {/* Marca + categoría */}
            <div className="flex items-center gap-3 flex-wrap">
              {producto.marca && (
                <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                  <Tag className="w-3 h-3" />
                  {producto.marca.nombre}
                </span>
              )}
              {producto.categoria && (
                <span className="inline-flex items-center gap-1.5 bg-pink-100 text-pink-700 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                  <Layers className="w-3 h-3" />
                  {producto.categoria.nombre}
                </span>
              )}
            </div>

            {/* Nombre */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">
                Cód. {producto.codigo}
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                {producto.nombre}
              </h1>
            </div>

            {/* Precio */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
              <p className="text-4xl font-black text-gray-900">
                ${Number(producto.precio_venta).toLocaleString('es-MX')}
                <span className="text-lg font-semibold text-gray-400 ml-2">MXN</span>
              </p>
            </div>

            {/* Descripción */}
            {producto.descripcion && (
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Descripción
                </p>
                <p className="text-gray-600 leading-relaxed text-base">
                  {producto.descripcion}
                </p>
              </div>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              {sinStock ? (
                <span className="text-sm font-semibold text-red-500">Sin stock disponible</span>
              ) : producto.stock <= 5 ? (
                <span className="text-sm font-semibold text-amber-600">
                  ¡Solo quedan {producto.stock} unidades!
                </span>
              ) : (
                <span className="text-sm font-semibold text-green-600">En stock</span>
              )}
            </div>

            {/* CTA */}
            <button
              disabled={sinStock}
              className="w-full bg-gray-900 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-base uppercase tracking-wide"
            >
              {sinStock ? 'Producto agotado' : 'Agregar al carrito'}
            </button>

            {/* Volver */}
            <Link href="/productos" className="block text-center text-sm text-gray-400 hover:text-rose-600 transition-colors font-medium">
              ← Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
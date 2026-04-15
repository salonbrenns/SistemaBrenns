"use client"
// src/components/ui/MarcasUniverso.tsx
import Image from 'next/image'
interface Marca {
  nombre: string
  img: string
}

interface Props {
  marcas: Marca[]
}

export default function MarcasUniverso({ marcas }: Props) {
  return (
    <section className="bg-white py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Encabezado */}
        <div className="text-center mb-14">
          <p className="text-pink-500 text-xs font-black uppercase tracking-[0.25em] mb-3">
            Distribuidora oficial
          </p>
          <h2 className="text-3xl font-bold text-gray-900">
            Conoce nuestro{" "}
            <span className="text-[#FF5BA8]">universo</span>{" "}
            de marcas
          </h2>
          <p className="text-gray-400 text-sm mt-3">
            {marcas.length} marcas profesionales disponibles
          </p>
        </div>

        {/* Grid de logos */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-px bg-gray-100 border border-gray-100 rounded-3xl overflow-hidden">
          {marcas.map((marca) => (
            <div
  key={marca.nombre}
  className="group bg-white flex items-center justify-center p-5 aspect-square hover:bg-pink-50 transition-colors duration-200 relative" // 👈 agrega "relative"
>
  <Image 
    src={`/marcas/${marca.img}`}
    alt={marca.nombre}
    fill
    className="object-contain mix-blend-multiply grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-300"
    sizes="72px"
  />
</div>
          ))}
        </div>

      </div>
    </section>
  )
}
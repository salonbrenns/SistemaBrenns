import Link from "next/link"
import { Scissors, Sparkles, Heart, ArrowRight } from "lucide-react"

const services = [
  {
    icon: Sparkles,
    title: "Manicura & Pedicura",
    description: "Cuidado profesional completo de manos y pies con productos de alta calidad.",
    color: "bg-pink-50 text-pink-600",
    href: "/servicios",
  },
  {
    icon: Scissors,
    title: "Corte y Peinado",
    description: "Estilismo profesional adaptado a tu personalidad y estilo de vida.",
    color: "bg-rose-50 text-rose-600",
    href: "/servicios",
  },
  {
    icon: Heart,
    title: "Maquillaje Social",
    description: "Look perfecto para cada ocasión especial de tu vida.",
    color: "bg-fuchsia-50 text-fuchsia-600",
    href: "/servicios",
  },
]

export default function Services() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-pink-600 text-sm font-semibold uppercase tracking-widest mb-2">Lo que ofrecemos</p>
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Nuestros Servicios
            </h2>
          </div>
          <Link href="/servicios"
            className="inline-flex items-center gap-2 text-pink-600 font-semibold hover:text-pink-700 transition-colors group">
            Ver todos los servicios
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s, i) => {
            const Icon = s.icon
            return (
              <Link key={i} href={s.href}
                className="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-50 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{s.description}</p>
                <div className="mt-6 flex items-center gap-2 text-pink-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Saber más <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
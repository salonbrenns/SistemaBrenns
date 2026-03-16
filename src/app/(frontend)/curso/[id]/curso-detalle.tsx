// src/app/(frontend)/curso/[id]/page.tsx
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, User, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import BotonAccion from "@/components/ui/BotonAccion"

const cursosData = {
  "1": {
    id: 1, titulo: "Acrílico Escultural: Nivel Intermedio", instructora: "Brenda García",
    imagen: "/cursos/curso-aclirico.jpg", nivel: "Intermedio", duracion: "4 Semanas",
    precio: 2500, cuposDisponibles: 3, cuposTotales: 10,
    fecha: "Próximo 19 de Octubre", horario: "Domingo • 10:00 AM", pagoUnico: true,
    descripcion: "Domina las técnicas avanzadas de acrílico escultural. Aprenderás a crear diseños 3D, formas estructuradas y efectos profesionales.",
    temario: ["Módulo 1: Preparación Avanzada y Adherencia", "Anatomía de la uña (repaso)", "Técnicas de preparación para una adherencia superior", "Uso correcto de primers y deshidratadores"],
  },
  "2": {
    id: 2, titulo: "Gelish Artist: Nivel Avanzado", instructora: "Brenda García",
    imagen: "/cursos/curso-gelish.jpg", nivel: "Avanzado", duracion: "3 Semanas",
    precio: 3200, cuposDisponibles: 5, cuposTotales: 12,
    fecha: "Próximo 26 de Octubre", horario: "Sábado • 4:00 PM", pagoUnico: false,
    descripcion: "Domina las técnicas más vanguardistas de diseño con Gelish. Efectos 3D, degradados perfectos y uso profesional de pigmentos.",
    temario: ["Técnicas de aplicación y sellado avanzado", "Diseño en relieve 3D y 4D con geles", "Manejo de pigmentos camaleón y espejos", "Creación de efectos mármol y ojo de gato"],
  },
  "3": {
    id: 3, titulo: "Manicure Clásica Semipermanente", instructora: "Brenda García",
    imagen: "/cursos/curso-nail.jpg", nivel: "Principiante", duracion: "1 Día",
    precio: 380, cuposDisponibles: 15, cuposTotales: 20,
    fecha: "Próximo 1 de Noviembre", horario: "Viernes • 9:00 AM", pagoUnico: true,
    descripcion: "Inicia tu camino en el mundo de la manicura profesional. Aprenderás desde la esterilización hasta la aplicación perfecta del esmalte semipermanente.",
    temario: ["Higiene y Bioseguridad en el salón", "Anatomía de la mano y la uña", "Técnica de retirado seguro y correcto", "Aplicación de color y Top Coat de larga duración"],
  },
}

export default async function CursoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const curso = cursosData[id as keyof typeof cursosData]

  if (!curso) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-6">Curso no encontrado</h1>
        <Link href="/cursos" className="text-pink-600 hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Volver a cursos
        </Link>
      </div>
    </div>
  )

  const cuposPorcentaje = (curso.cuposDisponibles / curso.cuposTotales) * 100

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-16">
      <div className="max-w-7xl mx-auto px-6">

        <Link href="/cursos" className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium mb-8">
          <ArrowLeft className="w-5 h-5" /> Volver a cursos
        </Link>

        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-pink-600 leading-tight">{curso.titulo}</h1>
          <p className="text-xl text-gray-700 mt-4 flex items-center justify-center gap-3">
            <User className="w-6 h-6 text-pink-600" />
            Impartido por: <span className="font-bold text-pink-600">{curso.instructora}</span>
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-96">
              <Image src={curso.imagen} alt={curso.titulo} fill className="object-cover" priority />
            </div>

            <section className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
              <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-3">
                <Calendar className="w-7 h-7" /> Información General
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                <div className="flex items-center gap-4"><Calendar className="w-6 h-6 text-pink-600" /><div><p className="font-semibold">Próxima fecha</p><p>{curso.fecha}</p></div></div>
                <div className="flex items-center gap-4"><Clock className="w-6 h-6 text-pink-600" /><div><p className="font-semibold">Duración</p><p>{curso.duracion}</p></div></div>
                <div className="flex items-center gap-4"><Clock className="w-6 h-6 text-pink-600" /><div><p className="font-semibold">Horario</p><p>{curso.horario}</p></div></div>
                <div className="flex items-center gap-4"><CheckCircle className="w-6 h-6 text-pink-600" /><div><p className="font-semibold">Nivel</p><p>{curso.nivel}</p></div></div>
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
              <h2 className="text-2xl font-bold text-pink-600 mb-6">Descripción del curso</h2>
              <p className="text-gray-700 leading-relaxed">{curso.descripcion}</p>
            </section>

            <section className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
              <h2 className="text-2xl font-bold text-pink-600 mb-6">Temario</h2>
              <ul className="space-y-4">
                {curso.temario.map((tema, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700 text-lg">{tema}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-pink-100 sticky top-24">
              <div className="text-center mb-8">
                <p className="text-5xl font-bold text-pink-600">${curso.precio.toLocaleString()} <span className="text-2xl">MXN</span></p>
                <p className="text-gray-600 mt-2">{curso.pagoUnico ? "Pago único" : "Anticipo disponible"}</p>
              </div>

              <div className="mb-8">
                <div className="flex justify-between text-lg font-bold mb-3">
                  <span>Cupos disponibles</span>
                  <span className={curso.cuposDisponibles <= 3 ? "text-red-600" : "text-pink-600"}>
                    {curso.cuposDisponibles} de {curso.cuposTotales}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div className={`h-full transition-all duration-700 ${curso.cuposDisponibles <= 3 ? "bg-red-500" : "bg-pink-600"}`} style={{ width: `${cuposPorcentaje}%` }} />
                </div>
                {curso.cuposDisponibles <= 3 && (
                  <p className="text-red-600 font-bold mt-3 flex items-center justify-center gap-2 animate-pulse">
                    <AlertCircle className="w-5 h-5" /> ¡Últimos {curso.cuposDisponibles} cupos!
                  </p>
                )}
              </div>

              {/* Botón condicional — no duplica páginas */}
              <BotonAccion
                tipo="inscribirse"
                href={`/inscribirse?id=${curso.id}&titulo=${encodeURIComponent(curso.titulo)}&instructora=${encodeURIComponent(curso.instructora)}&precio=${curso.precio}&cupos=${curso.cuposDisponibles}`}
                textoLogueado="Inscribirme Ahora"
                textoNoLogueado="Inicia sesión para inscribirte"
              />

              <p className="text-center text-gray-600 text-sm mt-6">¡No dejes pasar tu lugar! Cupos limitados</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
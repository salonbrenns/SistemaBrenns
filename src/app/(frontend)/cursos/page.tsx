"use client"

import Image from "next/image"
import Link from "next/link"
import { Loader2, Sparkles, SearchX, Heart } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import FiltroServicios from "@/components/ui/FiltroCursos"
import Paginacion from "@/components/ui/paginacion"

type Curso = {
  id: number
  titulo: string
  precio_total: number
  nivel: string | null
  imagenes: string[] | null
}

const POR_PAGINA = 12

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [nivelesSeleccionados, setNivelesSeleccionados] = useState<string[]>([])
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    fetch("/api/cursos")
      .then(r => r.json())
      .then(data => {
        setCursos(data.cursos || [])
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])

  const nivelesDisponibles = useMemo(() =>
    Array.from(new Set(cursos.map(c => c.nivel).filter(Boolean))) as string[]
    , [cursos])

  const toggleNivel = (nivel: string) => {
    setNivelesSeleccionados(prev =>
      prev.includes(nivel) ? prev.filter(n => n !== nivel) : [...prev, nivel]
    )
    setPagina(1)
  }

  const limpiarFiltros = () => {
    setBusqueda("")
    setNivelesSeleccionados([])
    setPagina(1)
  }

  const cursosFiltrados = useMemo(() =>
    cursos
      .filter(c => c.titulo.toLowerCase().includes(busqueda.toLowerCase()))
      .filter(c => nivelesSeleccionados.length === 0 || (c.nivel && nivelesSeleccionados.includes(c.nivel)))
    , [cursos, busqueda, nivelesSeleccionados])

  const totalPaginas = Math.ceil(cursosFiltrados.length / POR_PAGINA)
  const cursosPagina = cursosFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const handleBusqueda = (valor: string) => { setBusqueda(valor); setPagina(1) }

  // Función para validar que la imagen sea un string con contenido
  const obtenerImagenSegura = (imagenes: string[] | null): string | null => {
    if (!imagenes || !Array.isArray(imagenes) || imagenes.length === 0) return null;
    const primera = imagenes[0];
    return (typeof primera === 'string' && primera.trim().length > 0) ? primera : null;
  }

  return (
    <main className="min-h-screen bg-[#fffafa]">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-rose-900 via-pink-800 to-rose-700 py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-300 rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-[1400px] mx-auto text-center">
          <p className="text-rose-300 text-xs font-bold uppercase tracking-[0.3em] mb-3">Formación</p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Nuestros Cursos
          </h1>
          <p className="text-rose-200 text-lg max-w-xl mx-auto">
            Aprende con los mejores profesionales en belleza y cuidado personal
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10">

        <FiltroServicios
          busqueda={busqueda}
          setBusqueda={handleBusqueda}
          categoriasDisponibles={nivelesDisponibles}
          categoriasSeleccionadas={nivelesSeleccionados}
          toggleCategoria={toggleNivel}
          limpiarFiltros={limpiarFiltros}
        />

        {!cargando && (
          <p className="text-sm text-gray-400 mb-6">
            {cursosFiltrados.length === cursos.length
              ? `${cursos.length} cursos`
              : `${cursosFiltrados.length} de ${cursos.length} cursos`}
            {totalPaginas > 1 && ` · página ${pagina} de ${totalPaginas}`}
          </p>
        )}

        {cargando && (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-rose-400 animate-spin" />
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <p className="text-rose-600 font-medium animate-pulse mt-4">Cargando cursos...</p>
          </div>
        )}

        {!cargando && cursosPagina.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cursosPagina.map((curso) => {
              const imagenSrc = obtenerImagenSegura(curso.imagenes)

              return (
                <article
                  key={curso.id}
                  className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl border border-pink-50 overflow-hidden transition-all duration-500 hover:-translate-y-2"
                >
                  <Link href={`/curso/${curso.id}`}>
                    <div className="relative h-64 bg-pink-50 overflow-hidden">
                      {imagenSrc ? (
                        <Image
                          src={imagenSrc}
                          alt={curso.titulo}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-1000"
                          priority={false}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-6xl bg-pink-100">🎓</div>
                      )}
                      
                      {curso.nivel && (
                        <div className="absolute bottom-4 left-4 bg-white/90 px-4 py-1.5 rounded-full text-xs font-bold border">
                          {curso.nivel}
                        </div>
                      )}
                      
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-pink-600 hover:text-white transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 line-clamp-1">{curso.titulo}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black">
                          ${Number(curso.precio_total).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">MXN</span>
                      </div>
                    </div>
                  </Link>

                  <div className="px-6 pb-6">
                    <Link href={`/curso/${curso.id}`}>
                      <button className="w-full bg-gray-900 hover:bg-pink-600 text-white font-bold py-3.5 rounded-2xl transition">
                        Ver Curso
                      </button>
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {!cargando && cursosFiltrados.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] shadow-inner border-2 border-dashed border-rose-100">
            <div className="mb-6 flex justify-center">
              <SearchX className="w-16 h-16 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-2">No encontramos cursos</p>
            <p className="text-gray-500 mb-8">Intenta ajustando los filtros o la búsqueda.</p>
            <button onClick={limpiarFiltros}
              className="px-8 py-3 bg-rose-700 text-white font-bold rounded-full hover:bg-rose-800 transition shadow-xl">
              Ver todos los cursos
            </button>
          </div>
        )}

        <Paginacion
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          onChange={(p) => { 
            setPagina(p); 
            window.scrollTo({ top: 0, behavior: "smooth" }) 
          }}
        />

        <footer className="text-center mt-20 pt-10 border-t border-rose-100">
          <p className="text-gray-400 font-medium italic">
            Actualizamos nuestros cursos regularmente.
          </p>
        </footer>
      </div>
    </main>
  )
}
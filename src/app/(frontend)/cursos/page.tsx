// src/app/cursos/page.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, User } from "lucide-react"
import { useState } from "react"
// 1. Importar el componente modular FilterSidebar
import FilterSidebar from '@/components/ui/filter-sidebar'; 

const cursosData = [ // Renombrado a cursosData para claridad
  { id: 1, titulo: "Acrílico Escultural: Nivel Intermedio", instructora: "Brenda García", nivel: "Intermedio", duracion: "4 semanas", precio: 2500, img: "/cursos/curso-aclirico.jpg", cupos: 3 },
  { id: 2, titulo: "Gelish Artist: Nivel Avanzado", instructora: "Brenda Garcia",nivel: "Avanzado", duracion: "3 semanas", precio: 3200, img: "/cursos/curso-gelish.jpg", cupos: 5 },
  { id: 3, titulo: "Manicure Clásica Semipermanente", instructora: "Brenda Garcia", nivel: "Principiante", duracion: "1 día", precio: 380, img: "/cursos/curso-nail.jpg", cupos: 15 },
]

// ⚠️ Se elimina la definición del componente SidebarFiltros.

export default function CursosPage() {
    const [busqueda, setBusqueda] = useState("")
    // ⚠️ CAMBIO DE ESTADO: Ahora usamos un array de strings (como en servicios) para manejar los niveles
    // Esto se alinea con el componente FilterSidebar que usa checkboxes.
    const [nivelesSeleccionados, setNivelesSeleccionados] = useState<string[]>([])

    // Definir los niveles disponibles (excluyendo "Todos" para el control de checkbox)
    const nivelesDisponibles = Array.from(new Set(cursosData.map(c => c.nivel)));

    // Función para manejar el estado de los niveles (seleccionar/deseleccionar)
    const toggleNivel = (nivel: string) => {
        setNivelesSeleccionados(prev => 
            prev.includes(nivel) 
                ? prev.filter(n => n !== nivel) // Deseleccionar
                : [...prev, nivel]              // Seleccionar
        );
    };

    // Función para limpiar todos los filtros a pasar al Sidebar
    const limpiarFiltros = () => {
        setBusqueda("");
        setNivelesSeleccionados([]);
    };


    // LÓGICA DE FILTRADO
    const cursosFiltrados = cursosData
        .filter(c => c.titulo.toLowerCase().includes(busqueda.toLowerCase()) || c.instructora.toLowerCase().includes(busqueda.toLowerCase()))
        .filter(c => {
            // Si no hay niveles seleccionados, muestra todos.
            if (nivelesSeleccionados.length === 0) return true;
            // Si hay niveles, muestra solo los que coincidan.
            return nivelesSeleccionados.includes(c.nivel);
        });

    return (
        <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Título principal */}
                <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-bold text-pink-600 mb-10 lg:mt-0 mt-4">
                    Conoce de nuestros Cursos
                </h1>

                {/* ESTRUCTURA PRINCIPAL: GRID DE 4 COLUMNAS EN LG */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* COLUMNA 1: BARRA LATERAL (Usando el componente FilterSidebar) */}
                    <div className="lg:col-span-1">
                        <FilterSidebar 
                            title="Filtrar por:"
                            busqueda={busqueda} 
                            setBusqueda={setBusqueda} 
                            // Pasar los estados de nivel al componente modular
                            categoriasSeleccionadas={nivelesSeleccionados} 
                            categoriasDisponibles={nivelesDisponibles}
                            toggleCategoria={toggleNivel} 
                            limpiarFiltros={limpiarFiltros}
                        />
                    </div>

                    {/* COLUMNAS 2, 3, 4: CONTENIDO PRINCIPAL (Grid de Cursos) */}
                    <div className="lg:col-span-3">
                        
                     

                        {/* Grid de cursos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {cursosFiltrados.map((curso) => (
                                <article key={curso.id} className="group bg-white rounded-3xl shadow-xl overflow-hidden border border-pink-100 transition-all hover:shadow-2xl">
                                    <Link href={`/curso/${curso.id}`}>
                                        <div className="relative h-72 overflow-hidden bg-gray-100">
                                            <Image src={curso.img} alt={curso.titulo} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <button onClick={(e) => e.stopPropagation()} className="absolute top-3 right-3 bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white transition">
                                                <Heart className="w-5 h-5 text-pink-600" />
                                            </button>
                                            <div className="absolute bottom-3 left-3 bg-pink-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                                                {curso.duracion}
                                            </div>
                                            {curso.cupos <= 5 && (
                                                <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg animate-pulse">
                                                    ¡{curso.cupos} cupos!
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 bg-gradient-to-b from-pink-50 to-white">
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{curso.titulo}</h3>
                                            <div className="flex items-center gap-2 text-gray-700 mb-2">
                                                <User className="w-5 h-5 text-pink-600" />
                                                <span className="font-medium">{curso.instructora}</span>
                                            </div>
                                            <p className="text-3xl font-bold text-pink-600 mt-4">
                                                ${curso.precio.toLocaleString()}
                                                <span className="text-lg font-normal text-gray-700"> MXN</span>
                                            </p>
                                        </div>

                                        <div className="px-6 pb-6">
                                            <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-full transition shadow-lg">
                                                Ver Detalle
                                            </button>
                                        </div>
                                    </Link>
                                </article>
                            ))}
                            
                            {/* Mensaje de no resultados */}
                            {cursosFiltrados.length === 0 && (
                                <div className="md:col-span-2 xl:col-span-3 text-center py-20 bg-white/50 rounded-xl mt-10 shadow-lg border border-pink-100">
                                    <p className="text-2xl font-semibold text-gray-600">
                                        🙁 No se encontraron cursos con los filtros aplicados.
                                    </p>
                                    <button 
                                        onClick={limpiarFiltros}
                                        className="mt-4 text-pink-600 font-bold hover:underline transition-colors"
                                    >
                                        Mostrar todos los cursos
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
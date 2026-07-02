// src/data/cursos.ts

// Define la interfaz para asegurar que todos los cursos tengan la misma estructura
export interface Curso {
    id: number;
    titulo: string;
    instructora: string;
    imagen: string;
    nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
    duracion: string;
    precio: number;
    cuposDisponibles: number;
    cuposTotales: number;
    // Campos para la página de detalle
    fecha: string;
    horario: string;
    pagoUnico: boolean;
    descripcion: string;
    temario: string[];
}

// Catálogo completo de cursos
export const cursosData: Curso[] = [
    {
        id: 1,
        titulo: "Acrílico Escultural: Nivel Intermedio",
        instructora: "Brenda García",
        imagen: "/cursos/curso-aclirico.jpg", // Asegúrate de tener la imagen
        nivel: "Intermedio",
        duracion: "4 Semanas",
        precio: 2500,
        cuposDisponibles: 3,
        cuposTotales: 10,
        fecha: "Próximo 19 de Octubre",
        horario: "Domingo • 10:00 AM",
        pagoUnico: true,
        descripcion: `Este curso de Acrílico Escultural Intermedio está diseñado para perfeccionar tu técnica y explorar las formas más solicitadas en el mercado actual.\n\nAprenderás a construir uñas con estructuras avanzadas, aplicando el acrílico de manera precisa para lograr un acabado impecable y duradero.\n\nConviértete en una experta en escultura y ofrece a tus clientas diseños únicos y de alta calidad que te distinguirán.\n\n¡Es hora de dejar volar tu creatividad y dominar el arte del acrílico!`,
        temario: [
            "Módulo 1: Preparación Avanzada y Adherencia",
            "Anatomía de la uña (repaso)",
            "Técnicas de preparación para una adherencia superior en escultura",
            "Uso correcto de primers y deshidratadores",
        ],
    },
    {
        id: 2,
        titulo: "Gelish Artist: Nivel Avanzado",
        instructora: "Brenda García",
        imagen: "/cursos/curso-gelish.jpg", // Asegúrate de tener la imagen
        nivel: "Avanzado",
        duracion: "3 Semanas",
        precio: 3200,
        cuposDisponibles: 5,
        cuposTotales: 12,
        fecha: "Próximo 26 de Octubre",
        horario: "Sábado • 4:00 PM",
        pagoUnico: false, // Ejemplo
        descripcion: `Domina las técnicas más vanguardistas de diseño con Gelish. Este nivel avanzado te llevará a crear efectos 3D, degradados perfectos y el uso profesional de pigmentos, foils y accesorios. Ideal para profesionales que buscan destacarse en el arte de las uñas de gel.`,
        temario: [
            "Técnicas de aplicación y sellado avanzado",
            "Diseño en relieve 3D y 4D con geles",
            "Manejo de pigmentos camaleón y espejos",
            "Creación de efectos mármol y ojo de gato",
        ],
    },
    {
        id: 3,
        titulo: "Manicure Clásica Semipermanente",
        instructora: "Brenda García",
        imagen: "/cursos/curso-nail.jpg", // Asegúrate de tener la imagen
        nivel: "Principiante",
        duracion: "1 Día",
        precio: 380,
        cuposDisponibles: 15,
        cuposTotales: 20,
        fecha: "Próximo 1 de Noviembre",
        horario: "Viernes • 9:00 AM",
        pagoUnico: true,
        descripcion: `Inicia tu camino en el mundo de la manicura profesional. Aprenderás desde la correcta esterilización, la preparación de la uña natural, hasta la aplicación perfecta del esmalte semipermanente con una durabilidad impecable. Curso esencial para cualquier manicurista.`,
        temario: [
            "Higiene y Bioseguridad en el salón",
            "Anatomía de la mano y la uña",
            "Técnica de retirado seguro y correcto",
            "Aplicación de color y Top Coat de larga duración",
        ],
    },
];

// Función auxiliar para obtener un curso por ID, útil para la página de detalle.
export function getCursoById(id: number) {
    return cursosData.find(curso => curso.id === id);
}
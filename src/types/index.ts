// Tipos compartidos entre frontend y backend

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'usuario' | 'instructor';
  createdAt: Date;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
}

export interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  instructor: string;
  imagen: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

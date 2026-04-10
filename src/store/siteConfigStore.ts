// src/store/siteConfigStore.ts
import { create } from 'zustand';

type Empleado = {
  nombre: string;
  puesto: string;
  descripcion?: string;
  imagen?: string;
};

type SiteConfig = {
  nombre: string;
  slogan: string;
  telefono: string;
  email: string;

  heroImages: string[];
  heroTitle: string;
  heroSubtitle: string;

  mision: string;
  vision: string;

  direccion: string;
  ciudad: string;
  estado: string;
  googleMapsLink: string;
  horarios: string;

  redes: {
    instagram: string;
    facebook: string;
    whatsapp: string;
    tiktok: string;
  };

  empleados: Empleado[];

  terminos: string;
  privacidad: string;

  primaryColor: string;
};

export const useSiteConfigStore = create<SiteConfig & {
  setNombre: (v: string) => void;
  setSlogan: (v: string) => void;
  setTelefono: (v: string) => void;
  setEmail: (v: string) => void;

  setHeroImages: (images: string[]) => void;
  addHeroImage: (url: string) => void;
  setHeroTitle: (v: string) => void;
  setHeroSubtitle: (v: string) => void;

  setMision: (v: string) => void;
  setVision: (v: string) => void;

  setDireccion: (v: string) => void;
  setCiudad: (v: string) => void;
  setEstado: (v: string) => void;
  setGoogleMapsLink: (v: string) => void;
  setHorarios: (v: string) => void;

  setRedes: (redes: Partial<SiteConfig['redes']>) => void;

  addEmpleado: (nombre: string, puesto: string, descripcion?: string, imagen?: string) => void;
  removeEmpleado: (index: number) => void;

  setTerminos: (v: string) => void;
  setPrivacidad: (v: string) => void;

  setPrimaryColor: (color: string) => void;
}>((set) => ({
  nombre: "Brenn&apos;s",
  slogan: "Academia • Distribuidora • Salón",
  telefono: "961 000 0000",
  email: "salonbrenns11@gmail.com",

  heroImages: ["/logo/Fondo.jpg"],
  heroTitle: "Tu Belleza, Nuestra Pasión",
  heroSubtitle: "Formamos las mejores manicuristas de la Huasteca...",

  mision: "Empoderar y embellecer a la mujer de la Huasteca...",
  vision: "Ser el ecosistema de belleza más importante de Huejutla...",

  direccion: "Calle Juan Mogica Ugalde 5A, Zona Centro",
  ciudad: "Huejutla de Reyes",
  estado: "Hidalgo",
  googleMapsLink: "",
  horarios: "Lun - Vie: 9:00 - 19:00 | Sáb: 9:00 - 15:00",

  redes: {
    instagram: "@salon_de_belleza_brenns",
    facebook: "Brenn&apos;s en Facebook",
    whatsapp: "961 000 0000",
    tiktok: "@brenns",
  },

  empleados: [
    { nombre: "Brenda García", puesto: "Dueña y Administradora", descripcion: "Fundadora del Salón Brenn&apos;s con más de 10 años de experiencia." }
  ],

  terminos: "Términos y condiciones del servicio...",
  privacidad: "Políticas de privacidad...",

  primaryColor: "#FF5BA8",

  // Setters
  setNombre: (v) => set({ nombre: v }),
  setSlogan: (v) => set({ slogan: v }),
  setTelefono: (v) => set({ telefono: v }),
  setEmail: (v) => set({ email: v }),

  setHeroImages: (images) => set({ heroImages: images }),
  addHeroImage: (url) => set((state) => ({ heroImages: [...state.heroImages, url] })),
  setHeroTitle: (v) => set({ heroTitle: v }),
  setHeroSubtitle: (v) => set({ heroSubtitle: v }),

  setMision: (v) => set({ mision: v }),
  setVision: (v) => set({ vision: v }),

  setDireccion: (v) => set({ direccion: v }),
  setCiudad: (v) => set({ ciudad: v }),
  setEstado: (v) => set({ estado: v }),
  setGoogleMapsLink: (v) => set({ googleMapsLink: v }),
  setHorarios: (v) => set({ horarios: v }),

  setRedes: (redes) => set((state) => ({ redes: { ...state.redes, ...redes } })),

  addEmpleado: (nombre, puesto, descripcion = "", imagen = "") => 
    set((state) => ({
      empleados: [...state.empleados, { nombre, puesto, descripcion, imagen }]
    })),

  removeEmpleado: (index) => set((state) => ({
    empleados: state.empleados.filter((_, i) => i !== index)
  })),

  setTerminos: (v) => set({ terminos: v }),
  setPrivacidad: (v) => set({ privacidad: v }),

  setPrimaryColor: (color) => set({ primaryColor: color }),
}));
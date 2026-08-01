// src/hooks/useSiteConfig.ts
"use client"
import { createContext, useContext, useEffect, useState } from "react"

export interface SiteConfig {
  nombre:            string
  eslogan:           string
  descripcion:       string
  logo_src:          string
  ubicacion_calle:   string
  ubicacion_detalle: string
  ubicacion_ciudad:  string
  mapa_url:          string
  horario_semana:    string
  horario_sabado:    string
  red_facebook:      string
  red_instagram:     string
  red_whatsapp:      string
  nosotros_titulo:      string
  nosotros_descripcion: string
  nosotros_mision:      string
  nosotros_vision:      string
  nosotros_valores:     string
  politicas_privacidad:     string
  politicas_devolucion:     string
  legal_privacidad_version: string
  legal_privacidad_fecha:   string
  terminos_condiciones: string
  legal_politicas_version?: string
  legal_politicas_fecha?: string
  legal_terminos_version?: string
  legal_terminos_fecha?: string
  banco_titular:       string
  banco_banco:         string
  banco_cuenta:        string
  banco_clabe:         string
  banco_celular:       string
  anticipo_porcentaje: string
  hero_slides?:        string  // JSON string con array de slides
}

export const DEFAULTS: SiteConfig = {
  nombre:            "Brenn's",
  eslogan:           "Academia • Distribuidora • Salón",
  descripcion:       "Somos tu mejor opción en belleza y educación profesional en Huejutla.",
  logo_src:          "/logo/logo.png",
  ubicacion_calle:   "Zona Centro, calle Juan Mogica Ugalde 5A",
  ubicacion_detalle: "Una calle detrás del cine, donde antes era uniformes Bekita",
  ubicacion_ciudad:  "Huejutla de Reyes, Hidalgo",
  mapa_url:          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0!2d-98.4190!3d21.1390",
  horario_semana:    "Lunes a Sábado: 10:00 - 18:00",
  horario_sabado:    "Domingo: Cerrado",
  red_facebook:      "https://www.facebook.com/1277842365580139",
  red_instagram:     "https://www.instagram.com/studio.brenns/?hl=es-la",
  red_whatsapp:      "https://api.whatsapp.com/message/U54UFGZHOXSOJ1?autoload=1&app_absent=0",
  nosotros_titulo:      "Somos Brenn's",
  nosotros_descripcion: "El ecosistema de belleza integral de la Huasteca.",
  nosotros_mision:      "Empoderar y embellecer a la mujer de la Huasteca.",
  nosotros_vision:      "Ser el ecosistema de belleza más importante de Huejutla.",
  nosotros_valores:     "Integralidad, Calidad garantizada, Compromiso social, Calidez humana",
  politicas_privacidad:     "Tus datos personales son tratados con confidencialidad.",
  politicas_devolucion:     "Aceptamos devoluciones dentro de los 7 días con ticket original.",
  legal_privacidad_version: "1.0",
  legal_privacidad_fecha:   "26 de septiembre de 2025",
  terminos_condiciones:     "Al usar nuestros servicios aceptas nuestros términos.",
  banco_titular:       "Ruth Barrientos Angeles",
  banco_banco:         "BBVA",
  banco_cuenta:        "154 792 8563",
  banco_clabe:         "012 290 01547928563 4",
  banco_celular:       "77 1748 2746",
  anticipo_porcentaje: "50",
}

type SiteConfigCtx = SiteConfig & { cargandoConfig: boolean }

const SiteConfigContext = createContext<SiteConfigCtx>({
  ...DEFAULTS,
  cargandoConfig: true,
})

/** Provider — colócalo en el árbol global (ya incluido en Providers.tsx) */
export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULTS)
  const [cargandoConfig, setCargandoConfig] = useState(true)

  useEffect(() => {
    fetch("/api/config-sitio")
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === "object") {
          setConfig(prev => ({ ...prev, ...data }))
        }
      })
      .catch(() => {})
      .finally(() => setCargandoConfig(false))
  }, [])

  return (
    <SiteConfigContext.Provider value={{ ...config, cargandoConfig }}>
      {children}
    </SiteConfigContext.Provider>
  )
}

/** Hook — mismo API que antes, ahora lee del Context en vez de hacer fetch propio */
export function useSiteConfig(): SiteConfigCtx {
  return useContext(SiteConfigContext)
}

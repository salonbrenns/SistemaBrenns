'use client'
// src/components/ui/Footer.tsx

import Link from "next/link"
import Image from "next/image"
import { MapPin, Mail, ShieldCheck, CreditCard } from "lucide-react"
import { useSiteConfig } from "@/hooks/useSiteConfig"

export default function Footer() {
  const config = useSiteConfig()
  const year = new Date().getFullYear()
  const APP_VERSION = "1.0"

  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-white/5">

      {/* ── SECCIÓN B: GRID PRINCIPAL DE CONTENIDO ── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          
          {/* Columna 1: Marca & Valores (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <Image src={config.logo_src} alt={config.nombre} width={60} height={60} className="grayscale brightness-200" />
              <h4 className="text-xl font-black tracking-tighter uppercase">{config.nombre}</h4>
              <p className="text-gray-400 text-sm leading-relaxed pr-8">
                {config.descripcion || "Líderes en belleza y educación profesional en la Huasteca. Transformando estilos, empoderando profesionales."}
              </p>
            </div>
            
            {/* Badges de Confianza */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 border border-white/10 rounded-xl px-3 py-2">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-500" /> Citas Seguras
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 border border-white/10 rounded-xl px-3 py-2">
                <CreditCard className="w-3.5 h-3.5 text-pink-500" /> Pagos Protegidos
              </div>
            </div>
          </div>

          {/* Columna 2: Navegación (2 cols) */}
          <div className="lg:col-span-2">
            <h5 className="text-xs font-black uppercase tracking-[0.2em] text-pink-500 mb-8">Empresa</h5>
            <ul className="space-y-4">
              {['Inicio', 'Servicios', 'Academia', 'Tienda', 'Nosotros'].map((link) => (
                <li key={link}>
                  <Link href={`/${link.toLowerCase()}`} className="text-sm text-gray-400 hover:text-white transition-colors font-medium">
                    {link}
                  </Link>
                </li>
              ))}
              {/* ── FAQ ── */}
              <li>
                <Link href="/faq" className="text-sm text-gray-400 hover:text-white transition-colors font-medium">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Legal (2 cols) */}
          <div className="lg:col-span-2">
            <h5 className="text-xs font-black uppercase tracking-[0.2em] text-pink-500 mb-8">Legalidad</h5>
            <ul className="space-y-4">
              {[
                { n: 'Privacidad', h: '/aviso-privacidad' },
                { n: 'Términos', h: '/terminos' },
                { n: 'Políticas', h: '/politicas' },
                { n: 'Devoluciones', h: '/politicas#devoluciones' }
              ].map((link) => (
                <li key={link.n}>
                  <Link href={link.h} className="text-sm text-gray-400 hover:text-white transition-colors font-medium">
                    {link.n}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Contacto & RRSS (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <h5 className="text-xs font-black uppercase tracking-[0.2em] text-pink-500 mb-8">Encuéntranos</h5>
              <div className="space-y-4">
                <a href="#" className="flex items-start gap-4 group text-gray-400 hover:text-white transition-colors">
                  <MapPin className="w-5 h-5 text-pink-600 shrink-0" />
                  <span className="text-sm leading-snug">
                    {config.ubicacion_calle}, {config.ubicacion_ciudad}<br/>
                    <span className="text-[10px] text-gray-600 uppercase font-black">{config.ubicacion_detalle}</span>
                  </span>
                </a>
                <a href="mailto:salonbrenns11@gmail.com"
                  className="flex items-center gap-4 group text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-5 h-5 text-pink-600 shrink-0" />
                  <span className="text-sm">salonbrenns11@gmail.com</span>
                </a>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4">Síguenos en redes</p>
              <div className="flex gap-3">
                <Link href={config.red_facebook || "#"} className="w-10 h-10 bg-white/5 hover:bg-[#1877F2] rounded-full flex items-center justify-center border border-white/5 transition-all">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                </Link>
                <Link href={config.red_instagram || "#"} className="w-10 h-10 bg-white/5 hover:bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full flex items-center justify-center border border-white/5 transition-all">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </Link>
                <Link href={config.red_whatsapp || "#"} className="w-10 h-10 bg-white/5 hover:bg-[#25D366] rounded-full flex items-center justify-center border border-white/5 transition-all">
                  <span className="sr-only">WhatsApp</span>
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BARRA INFERIOR FINAL ── */}
      <div className="bg-black py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
              © {year} {config.nombre}
            </p>
            <span className="hidden md:block text-gray-800">|</span>
            <p className="text-[11px] text-gray-600 font-medium italic">
              Excelencia en Belleza & Educación Profesional
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Soporte Online</p>
            </div>
            <p className="text-[10px] text-gray-700 font-mono tracking-tighter uppercase">Build: {APP_VERSION}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
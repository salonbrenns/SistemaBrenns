
import { MapPin, Clock, Mail } from "lucide-react"


export const metadata = {
  title: "Nosotros — Brenn's",
  description: "Conoce a Brenn's: academia, distribuidora y salón de belleza en Huejutla de Reyes, Hidalgo.",
}

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-pink-50 to-white border-b border-pink-100 py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          
          <p className="text-xs font-bold tracking-widest text-pink-500 uppercase mb-3">
            Academia · Distribuidora · Salón
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Somos Brenn&apos;s
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            El ecosistema de belleza integral de la Huasteca: formamos profesionales,
            ofrecemos servicios de alta gama y ponemos los mejores insumos al alcance de todas.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">

        {/* ── MISIÓN + VISIÓN ── */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 stroke-pink-600" viewBox="0 0 24 24" fill="none" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <p className="text-xs font-bold tracking-widest text-pink-500 uppercase mb-1">Misión</p>
            <p className="text-pink-900 text-sm leading-relaxed">
              Empoderar y embellecer a la mujer de la Huasteca a través de un modelo integral que ofrece
              formación profesional de excelencia, servicios de cuidado personal de alta gama y suministros
              de calidad superior a precios accesibles. Transformamos la pasión por la belleza en una
              profesión rentable y una experiencia de bienestar única.
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 stroke-pink-600" viewBox="0 0 24 24" fill="none" strokeWidth={2}>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <p className="text-xs font-bold tracking-widest text-pink-500 uppercase mb-1">Visión</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Ser el ecosistema de belleza más importante de Huejutla y sus alrededores en los próximos
              5 años, convirtiéndonos en el referente obligado para toda mujer que busque desde un
              servicio de uñas impecable hasta la mejor educación y los insumos más confiables del mercado.
            </p>
          </div>
        </div>

        {/* ── VALORES ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold tracking-widest text-pink-500 uppercase mb-1">Lo que nos define</p>
          <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "Georgia, serif" }}>
            Nuestros valores
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { titulo: "Integralidad",         desc: "Ofrecemos la solución completa: capacitación, herramientas y resultados." },
              { titulo: "Calidad garantizada",  desc: "Solo enseñamos y vendemos lo que nosotros mismos usamos en el salón." },
              { titulo: "Compromiso social",    desc: "Impulsamos la economía local formando nuevas emprendedoras." },
              { titulo: "Calidez",              desc: "Cada alumna y clienta se siente valorada y especial en nuestro espacio." },
            ].map(v => (
              <div key={v.titulo} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{v.titulo}</p>
                  <p className="text-gray-500 text-xs leading-relaxed mt-1">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
            

        {/* ── TRES PILARES ── */}
<div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
  <p className="text-xs font-bold tracking-widest text-pink-500 uppercase mb-1">¿Qué hacemos?</p>
  <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "Georgia, serif" }}>
    Tres pilares, una pasión
  </h2>
  <div className="space-y-3">

    {/* Academia */}
    <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4">
      <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth={2}>
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">Academia</p>
        <p className="text-gray-500 text-xs leading-relaxed mt-1">
          Cursos y talleres presenciales para estilistas de todos los niveles. Formamos profesionales que transforman su pasión en negocio.
        </p>
      </div>
    </div>

    {/* Distribuidora */}
    <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4">
      <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth={2}>
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">Distribuidora</p>
        <p className="text-gray-500 text-xs leading-relaxed mt-1">
          Insumos de calidad superior a precios accesibles. Solo vendemos lo que nosotros mismas utilizamos en el salón.
        </p>
      </div>
    </div>

    {/* Salón */}
    <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4">
      <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth={2}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">Salón</p>
        <p className="text-gray-500 text-xs leading-relaxed mt-1">
          Servicios de uñas, cabello y bienestar de alta gama. Un espacio donde cada mujer vive una experiencia única.
        </p>
      </div>
    </div>

  </div>
</div>

        {/* ── UBICACIÓN + CONTACTO ── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Ubicación */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold tracking-widest text-pink-500 uppercase mb-1">Encuéntranos</p>
            <h2 className="text-xl font-bold text-gray-900 mb-5" style={{ fontFamily: "Georgia, serif" }}>
              Ubicación
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-pink-500" />
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  Calle Juan Mogica Ugalde 5A, Zona Centro<br />
                  <span className="text-xs text-gray-400">Una calle detrás del cine (donde antes era Uniformes Bekita)</span><br />
                  <strong className="text-gray-800">Huejutla de Reyes, Hidalgo</strong>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-pink-500" />
                </div>
                <div className="text-sm text-gray-600">
                  <p>Lun – Vie &nbsp;&nbsp; 9:00 – 19:00</p>
                  <p>Sábado &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 9:00 – 15:00</p>
                </div>
              </div>
            </div>
            {/* Mapa */}
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 h-48">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0!2d-98.4190!3d21.1390!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sHuejutla+de+Reyes%2C+Hidalgo!5e0!3m2!1ses!2smx!4v1"
                className="w-full h-full border-none"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Redes y contacto */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold tracking-widest text-pink-500 uppercase mb-1">Contáctanos</p>
            <h2 className="text-xl font-bold text-gray-900 mb-5" style={{ fontFamily: "Georgia, serif" }}>
              Redes y contacto
            </h2>
            <div className="space-y-4">

              {/* Email */}
              <a href="mailto:salonbrenns11@gmail.com" className="flex items-center gap-3 hover:text-pink-600 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-pink-500" />
                </div>
                <span className="text-sm text-gray-600 group-hover:text-pink-600">salonbrenns11@gmail.com</span>
              </a>

              {/* WhatsApp */}
              <a href="https://api.whatsapp.com/message/U54UFGZHOXSOJ1?autoload=1&app_absent=0" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-pink-600 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-pink-600">WhatsApp Brenn&apos;s</span>
              </a>

              {/* Instagram */}
              <a href="https://www.instagram.com/salon_de_belleza_brenns/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-pink-600 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#E8357A" strokeWidth={1.8}>
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-pink-600">@salon_de_belleza_brenns</span>
              </a>

              {/* Facebook */}
              <a href="https://www.facebook.com/1277842365580139" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-pink-600 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-pink-600">Brenn&apos;s en Facebook</span>
              </a>

            </div>
          </div>
        </div>

      

      </div>
    </div>
  )
}
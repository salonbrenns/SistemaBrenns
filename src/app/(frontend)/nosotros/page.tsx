import { MapPin, Clock, Mail, Users, Award, Heart } from "lucide-react";

export const metadata = {
  title: "Nosotros — Brenn&apos;s",
  description: "Conoce a Brenn&apos;s: academia, distribuidora y salón de belleza en Huejutla de Reyes, Hidalgo.",
};

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* HERO - Más impactante y con mejor uso del espacio */}
      <section className="relative bg-gradient-to-br from-[#FF5BA8] via-[#FF8AC2] to-pink-50 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_right,#ffffff20_0%,transparent_50%)]" />
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full mb-6 border border-white/50">
            <span className="text-xs font-semibold tracking-[2px] text-pink-600 uppercase">Academia • Distribuidora • Salón</span>
          </div>

          <h1 
            className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Somos Brenn&apos;s
          </h1>

          <p className="max-w-2xl mx-auto text-white/90 text-lg md:text-xl leading-relaxed">
            El ecosistema de belleza integral de la Huasteca.<br />
            Formamos profesionales, embellecemos con excelencia y ofrecemos los mejores insumos.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-20">

        {/* MISIÓN + VISIÓN */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-pink-50 to-white border border-pink-100 rounded-3xl p-10 group hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#FF5BA8] flex items-center justify-center mb-6">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Misión</h3>
            <p className="text-gray-600 leading-relaxed text-[15.5px]">
              Empoderar y embellecer a la mujer de la Huasteca a través de un modelo integral que combina 
              <span className="font-medium text-pink-600"> formación profesional de excelencia</span>, 
              servicios de cuidado personal de alta gama y suministros de calidad superior a precios accesibles.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center mb-6">
              <Award className="w-7 h-7 text-[#FF5BA8]" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Visión</h3>
            <p className="text-gray-600 leading-relaxed text-[15.5px]">
              Ser el ecosistema de belleza más importante de Huejutla y la Huasteca en los próximos 5 años, 
              convirtiéndonos en el referente obligado para toda mujer que busca calidad, profesionalismo y calidez.
            </p>
          </div>
        </div>

        {/* VALORES */}
        <div>
          <div className="text-center mb-12">
            <p className="uppercase tracking-[3px] text-pink-500 text-sm font-semibold mb-2">Lo que nos define</p>
            <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
              Nuestros Valores
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Users, 
                titulo: "Integralidad", 
                desc: "Ofrecemos la solución completa: capacitación, herramientas y resultados." 
              },
              { 
                icon: Award, 
                titulo: "Calidad garantizada", 
                desc: "Solo enseñamos y vendemos lo que nosotros mismos usamos en el salón." 
              },
              { 
                icon: Heart, 
                titulo: "Compromiso social", 
                desc: "Impulsamos la economía local formando nuevas emprendedoras." 
              },
              { 
                icon: Users, 
                titulo: "Calidez humana", 
                desc: "Cada alumna y clienta se siente valorada y especial en nuestro espacio." 
              },
            ].map((v, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-3xl p-8 hover:border-pink-200 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center mb-6 group-hover:bg-[#FF5BA8] group-hover:text-white transition-colors">
                  <v.icon className="w-6 h-6 text-[#FF5BA8] group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-xl text-gray-900 mb-3">{v.titulo}</h3>
                <p className="text-gray-600 text-[15px] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TRES PILARES */}
        <div>
          <div className="text-center mb-12">
            <p className="uppercase tracking-widest text-pink-500 text-sm font-semibold mb-3">¿Qué hacemos?</p>
            <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
              Tres pilares, una pasión
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Academia */}
            <div className="bg-white border border-gray-100 rounded-3xl p-10 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-[#FF5BA8] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18 9.246 18 10.832 18.477 12 19.253zm0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18 14.754 18 13.168 18.477 12 19.253z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Academia</h3>
              <p className="text-gray-600 leading-relaxed">
                Cursos y talleres presenciales de alta calidad para estilistas de todos los niveles. 
                Formamos profesionales que transforman su pasión por la belleza en un negocio rentable.
              </p>
            </div>

            {/* Distribuidora */}
            <div className="bg-white border border-gray-100 rounded-3xl p-10 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-[#FF5BA8] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Distribuidora</h3>
              <p className="text-gray-600 leading-relaxed">
                Insumos profesionales de la más alta calidad a precios accesibles. 
                Solo vendemos productos que nosotros mismos utilizamos en nuestro salón.
              </p>
            </div>

            {/* Salón */}
            <div className="bg-white border border-gray-100 rounded-3xl p-10 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-[#FF5BA8] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Salón de Belleza</h3>
              <p className="text-gray-600 leading-relaxed">
                Servicios premium de uñas, cabello, manicura, pedicura y bienestar. 
                Un espacio elegante donde cada clienta vive una experiencia única y relajante.
              </p>
            </div>
          </div>
        </div>

        {/* UBICACIÓN Y CONTACTO - Más amplio */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Ubicación */}
          <div className="lg:col-span-3 bg-white border border-gray-100 rounded-3xl p-10">
            <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: "Georgia, serif" }}>Encuéntranos</h2>
            
            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 flex-shrink-0 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#FF5BA8]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Dirección</p>
                  <p className="text-gray-600 mt-1 leading-relaxed">
                    Calle Juan Mogica Ugalde 5A, Zona Centro<br />
                    Una calle detrás del cine (donde antes era Uniformes Bekita)<br />
                    <span className="font-medium">Huejutla de Reyes, Hidalgo</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 flex-shrink-0 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#FF5BA8]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Horarios</p>
                  <p className="text-gray-600 mt-1">Lunes a Viernes: 9:00 - 19:00<br />Sábado: 9:00 - 15:00</p>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-2xl overflow-hidden border border-gray-100 shadow-inner h-[380px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0!2d-98.4190!3d21.1390!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sHuejutla+de+Reyes%2C+Hidalgo!5e0!3m2!1ses!2smx!4v1"
                className="w-full h-full border-none"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="lg:col-span-2 bg-gradient-to-br from-pink-50 to-white border border-pink-100 rounded-3xl p-10">
            <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: "Georgia, serif" }}>Contáctanos</h2>
            
            <div className="space-y-6">
              <a href="mailto:salonbrenns11@gmail.com" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:bg-[#FF5BA8] transition-colors">
                  <Mail className="w-6 h-6 text-pink-500 group-hover:text-white" />
                </div>
                <div>
                  <p className="font-medium">Correo electrónico</p>
                  <p className="text-pink-600 group-hover:text-pink-700">salonbrenns11@gmail.com</p>
                </div>
              </a>

              {/* WhatsApp, Instagram y Facebook igual que antes pero con mejor espaciado */}
              {/* ... (puedes mantener los enlaces que ya tenías) */}
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

      </div>
    </div>
  );
}
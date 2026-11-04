// src/app/(public)/privacidad-movil/page.tsx
import Link from "next/link"
import { ShieldCheck, ArrowLeft, ChevronRight, Mail } from "lucide-react"

export const metadata = {
  title: "Aviso de Privacidad de la App Móvil — Salón Brenn's",
}

const VERSION = "1.0"
const FECHA   = "3 de noviembre de 2026"
const CORREO  = "salonbrenns11@gmail.com"

// Cada línea puede llevar una etiqueta en negritas y, si hace falta, un enlace
type Linea = { etiqueta?: string; texto: string; href?: string }
type Bloque =
  | { tipo: "p";  linea: Linea }
  | { tipo: "ul"; items: Linea[] }

const secciones: { numero: string; titulo: string; bloques: Bloque[] }[] = [
  {
    numero: "1",
    titulo: "Identidad y domicilio de la responsable",
    bloques: [
      { tipo: "p", linea: { texto: "Brenda Hernandez Garcia, quien opera comercialmente bajo el nombre Academia, Distribuidora y Salón Brenn's, es responsable del tratamiento y protección de los datos personales obtenidos mediante la aplicación móvil Salón Brenn's." } },
      { tipo: "p", linea: { etiqueta: "Domicilio", texto: "Plaza de la Revolución Mexicana 5, Centro, Huejutla de Reyes, Hidalgo, México." } },
      { tipo: "p", linea: { etiqueta: "Correo de contacto", texto: CORREO, href: `mailto:${CORREO}` } },
      { tipo: "p", linea: { etiqueta: "Sitio web", texto: "https://brenns-sistema.vercel.app/", href: "https://brenns-sistema.vercel.app/" } },
      { tipo: "p", linea: { texto: "El tratamiento de datos personales se realiza conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y demás disposiciones aplicables." } },
    ],
  },
  {
    numero: "2",
    titulo: "Datos personales recopilados",
    bloques: [
      { tipo: "p", linea: { texto: "La aplicación móvil trata los datos necesarios para proporcionar las funciones solicitadas por sus usuarios." } },
      { tipo: "ul", items: [
        { etiqueta: "Datos de identificación y contacto", texto: "nombre completo, correo electrónico y número de teléfono." },
        { etiqueta: "Datos de cuenta y autenticación", texto: "información de registro, credenciales de acceso protegidas y datos de sesión necesarios para autenticar a los usuarios." },
        { etiqueta: "Datos de citas y servicios", texto: "servicios seleccionados, fechas, horarios, reservaciones, estados de las citas y cancelaciones." },
        { etiqueta: "Datos de cursos", texto: "cursos seleccionados, inscripciones, fechas, estados de inscripción y operaciones de pago relacionadas." },
        { etiqueta: "Datos de compras", texto: "productos, variantes, cantidades, precios, pedidos, estados e historial de compras." },
        { etiqueta: "Datos de pagos", texto: "referencias de operaciones, comprobantes de transferencias bancarias y estados de revisión. Los documentos proporcionados pueden contener información financiera visible, por lo que se recomienda no incluir datos innecesarios." },
        { etiqueta: "Datos técnicos", texto: "información necesaria para establecer comunicaciones con el servidor, gestionar sesiones y proteger las operaciones, incluidos los registros técnicos que genere la infraestructura utilizada." },
      ] },
      { tipo: "p", linea: { texto: "La aplicación no solicita direcciones particulares para entregas, ya que los productos se recogen en el establecimiento." } },
    ],
  },
  {
    numero: "3",
    titulo: "Finalidades del tratamiento",
    bloques: [
      { tipo: "p", linea: { texto: "Los datos personales se utilizan para:" } },
      { tipo: "ul", items: [
        { texto: "Crear y administrar cuentas de usuario." },
        { texto: "Permitir el inicio y cierre de sesión." },
        { texto: "Consultar productos, servicios y cursos." },
        { texto: "Registrar, consultar y cancelar citas conforme a las políticas aplicables." },
        { texto: "Administrar inscripciones a cursos." },
        { texto: "Registrar pedidos y compras de productos." },
        { texto: "Recibir comprobantes de transferencia bancaria y verificar los pagos." },
        { texto: "Mostrar historiales y estados de operaciones." },
        { texto: "Permitir la consulta y modificación de información del perfil." },
        { texto: "Atender solicitudes de ayuda, derechos ARCO y eliminación de cuentas." },
        { texto: "Proteger las cuentas y prevenir operaciones no autorizadas." },
        { texto: "Cumplir las obligaciones legales correspondientes." },
      ] },
      { tipo: "p", linea: { texto: "La aceptación de los términos de la aplicación no implica, por sí misma, consentimiento para recibir promociones." } },
      { tipo: "p", linea: { texto: "Cualquier tratamiento adicional con fines publicitarios o comerciales deberá informarse al usuario y contar con los mecanismos de consentimiento u oposición que legalmente correspondan." } },
    ],
  },
  {
    numero: "4",
    titulo: "Almacenamiento, proveedores y comunicación de datos",
    bloques: [
      { tipo: "p", linea: { texto: "La aplicación móvil se comunica con los servicios del sistema de Salón Brenn's para realizar las operaciones solicitadas." } },
      { tipo: "p", linea: { texto: "En esta infraestructura intervienen proveedores tecnológicos relacionados con:" } },
      { tipo: "ul", items: [
        { etiqueta: "Vercel", texto: "alojamiento y funcionamiento del sistema y su API." },
        { etiqueta: "Neon", texto: "almacenamiento de información en la base de datos del sistema." },
        { etiqueta: "Cloudinary", texto: "almacenamiento de imágenes y comprobantes relacionados con las operaciones que lo requieren." },
      ] },
      { tipo: "p", linea: { texto: "Estos servicios pueden procesar información necesaria para proporcionar sus funciones y estarán sujetos a las condiciones contractuales y legales correspondientes." } },
      { tipo: "p", linea: { texto: "Salón Brenn's no comunicará datos personales a terceros para finalidades ajenas a las informadas sin cumplir los requisitos de consentimiento o las excepciones establecidos por la legislación aplicable." } },
    ],
  },
  {
    numero: "5",
    titulo: "Seguridad de la información",
    bloques: [
      { tipo: "p", linea: { texto: "La aplicación utiliza conexiones HTTPS para comunicarse con su servidor de producción y mecanismos de autenticación para controlar el acceso a las cuentas." } },
      { tipo: "p", linea: { texto: "La información de sesión se almacena mediante mecanismos protegidos del dispositivo cuando corresponde." } },
      { tipo: "p", linea: { texto: "Las contraseñas se procesan mediante los mecanismos de autenticación del sistema y no se muestran en texto legible en la aplicación." } },
      { tipo: "p", linea: { texto: "La información personal y las operaciones administrativas deben estar protegidas mediante controles de acceso y medidas técnicas y administrativas apropiadas." } },
      { tipo: "p", linea: { texto: "Salón Brenn's deberá revisar y actualizar sus medidas de seguridad de acuerdo con los riesgos asociados al tratamiento de datos personales." } },
    ],
  },
  {
    numero: "6",
    titulo: "Derechos ARCO",
    bloques: [
      { tipo: "p", linea: { texto: "Los usuarios pueden ejercer sus derechos de:" } },
      { tipo: "ul", items: [
        { etiqueta: "Acceso", texto: "conocer los datos personales sujetos a tratamiento." },
        { etiqueta: "Rectificación", texto: "solicitar la corrección de información inexacta o incompleta." },
        { etiqueta: "Cancelación", texto: "solicitar la cancelación de datos cuando proceda legalmente." },
        { etiqueta: "Oposición", texto: "oponerse a determinados tratamientos en los supuestos previstos por la legislación." },
      ] },
      { tipo: "p", linea: { texto: "Las solicitudes pueden prepararse mediante el apartado Derechos ARCO de la aplicación o enviarse directamente al correo:" } },
      { tipo: "p", linea: { texto: CORREO, href: `mailto:${CORREO}` } },
      { tipo: "p", linea: { texto: "El solicitante deberá proporcionar su nombre, un medio para recibir respuesta, el derecho que desea ejercer y una descripción de la solicitud." } },
      { tipo: "p", linea: { texto: "Una persona encargada dará seguimiento y, cuando corresponda, indicará un procedimiento seguro para verificar la identidad del titular o de su representante." } },
      { tipo: "p", linea: { texto: "No se deben enviar contraseñas ni documentos de identificación por medios inseguros." } },
      { tipo: "p", linea: { texto: "La determinación sobre la solicitud ARCO se comunicará, en términos generales, dentro de los 20 días hábiles siguientes a su recepción. Si resulta procedente, se hará efectiva dentro de los 15 días hábiles siguientes a la comunicación, sin perjuicio de las ampliaciones permitidas por la ley." } },
    ],
  },
  {
    numero: "7",
    titulo: "Eliminación de cuenta",
    bloques: [
      { tipo: "p", linea: { texto: "El usuario puede solicitar la eliminación de su cuenta de Salón Brenn's y de los datos personales asociados mediante:" } },
      { tipo: "ul", items: [
        { etiqueta: "Desde la aplicación móvil", texto: "apartado Solicitar eliminación de cuenta." },
        { etiqueta: "Desde la página web", texto: "https://brenns-sistema.vercel.app/eliminar-cuenta", href: "https://brenns-sistema.vercel.app/eliminar-cuenta" },
        { etiqueta: "Por correo electrónico", texto: CORREO, href: `mailto:${CORREO}` },
      ] },
      { tipo: "p", linea: { texto: "Para iniciar una solicitud por correo deberá indicar su nombre completo y el correo registrado en la cuenta." } },
      { tipo: "p", linea: { texto: "La persona encargada recibirá la solicitud, verificará la identidad del titular mediante un procedimiento seguro y revisará los datos asociados." } },
      { tipo: "p", linea: { texto: "Una vez completada la revisión, se eliminará la cuenta y la información personal que corresponda suprimir, incluidos los registros asociados que no deban conservarse por una causa legalmente justificada." } },
      { tipo: "p", linea: { texto: "La persona encargada comunicará al usuario el resultado de su solicitud." } },
      { tipo: "p", linea: { texto: "La apertura de un borrador de correo en la aplicación no significa que la solicitud haya sido enviada o recibida y no produce la eliminación automática de la cuenta." } },
      { tipo: "p", linea: { texto: "Los usuarios pueden iniciar la solicitud desde la página web sin tener instalada la aplicación ni iniciar sesión." } },
    ],
  },
  {
    numero: "8",
    titulo: "Conservación de información",
    bloques: [
      { tipo: "p", linea: { texto: "Los datos personales se conservarán durante el tiempo necesario para proporcionar los servicios solicitados, mantener las operaciones correspondientes y cumplir las obligaciones legales aplicables." } },
      { tipo: "p", linea: { texto: "Cuando una cuenta sea eliminada, se revisarán los registros de autenticación, perfil, citas, cursos, compras, pagos y comprobantes asociados." } },
      { tipo: "p", linea: { texto: "Los datos cuya conservación resulte necesaria para cumplir obligaciones legales, fiscales, de seguridad o prevención del fraude únicamente podrán mantenerse durante el periodo que corresponda y para las finalidades justificadas." } },
      { tipo: "p", linea: { texto: "Los registros que ya no deban conservarse serán suprimidos conforme a los procedimientos aplicables." } },
    ],
  },
  {
    numero: "9",
    titulo: "Permisos y archivos del dispositivo",
    bloques: [
      { tipo: "p", linea: { texto: "La aplicación permite seleccionar imágenes o documentos desde el dispositivo cuando el usuario decide proporcionar un comprobante de transferencia." } },
      { tipo: "p", linea: { texto: "Los archivos seleccionados se utilizan para procesar la operación correspondiente y pueden transmitirse a los servicios de almacenamiento empleados por el sistema." } },
      { tipo: "p", linea: { texto: "El acceso a los archivos y los permisos del dispositivo se limitarán a las funciones implementadas y se solicitarán conforme a los mecanismos de Android que correspondan." } },
    ],
  },
  {
    numero: "10",
    titulo: "Limitación, revocación y modificaciones",
    bloques: [
      { tipo: "p", linea: { texto: "Los titulares pueden solicitar la limitación de determinados tratamientos o la revocación de su consentimiento, cuando legalmente proceda, mediante el correo:" } },
      { tipo: "p", linea: { texto: CORREO, href: `mailto:${CORREO}` } },
      { tipo: "p", linea: { texto: "La responsable atenderá las solicitudes conforme a la legislación aplicable e informará sobre las consecuencias que pueda tener la revocación para las funciones que requieran determinados datos." } },
      { tipo: "p", linea: { texto: "El presente aviso podrá modificarse cuando cambien las funcionalidades de la aplicación, los tratamientos realizados o las disposiciones legales correspondientes." } },
      { tipo: "p", linea: { texto: "La versión vigente estará disponible dentro de la aplicación móvil y en su página pública de privacidad." } },
    ],
  },
]

// Pinta una línea con su etiqueta en negritas y, si tiene href, como enlace
function TextoLinea({ etiqueta, texto, href }: Linea) {
  return (
    <>
      {etiqueta && (
        <strong className="font-bold text-gray-800 dark:text-gray-100">{etiqueta}: </strong>
      )}
      {href ? (
        <a
          href={href}
          className="text-pink-600 dark:text-pink-400 underline underline-offset-2 break-words hover:text-pink-700 dark:hover:text-pink-300"
        >
          {texto}
        </a>
      ) : (
        texto
      )}
    </>
  )
}

export default function PrivacidadMovilPage() {
  return (
    <main className="min-h-screen bg-[#fffafa] dark:bg-gray-950 scroll-smooth">

      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-pink-900 via-pink-800 to-rose-700 py-10 px-6 overflow-hidden border-b border-white/10">
        <div className="relative max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-pink-200 hover:text-white mb-6 transition-all text-xs font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Regresar al Inicio
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-300" />
                <span className="text-white text-[9px] font-black uppercase tracking-[0.15em]">Aplicación móvil</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                Aviso de <span className="text-pink-300">Privacidad</span> de la App Móvil
              </h1>
              <p className="text-pink-100/80 text-sm">Salón Brenn&apos;s</p>
            </div>

            <div className="flex items-center gap-4 bg-black/20 px-5 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="text-right border-r border-white/10 pr-4">
                <p className="text-white font-bold text-sm leading-none mb-1">v.{VERSION}</p>
                <p className="text-pink-400 text-[8px] font-black uppercase tracking-widest">Versión</p>
              </div>
              <div className="text-left">
                <p className="text-pink-100 text-[10px] font-medium leading-none mb-1">{FECHA}</p>
                <p className="text-pink-400 text-[8px] font-black uppercase tracking-widest">Actualización</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* SIDEBAR */}
          <aside className="lg:w-1/4">
            <div className="lg:sticky lg:top-10 space-y-8">
              <div className="bg-white dark:bg-gray-800 border border-pink-100 dark:border-gray-700 rounded-[2.5rem] p-8 shadow-sm">
                <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6">Índice General</p>
                <nav className="flex flex-col gap-2">
                  {secciones.map(s => (
                    <a
                      key={s.numero}
                      href={`#seccion-${s.numero}`}
                      className="group flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 hover:text-pink-700 dark:hover:text-pink-300 py-2.5 transition-all border-b border-gray-50 dark:border-gray-700 last:border-0"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-pink-300 group-hover:text-pink-600 transition-colors">
                          {s.numero.padStart(2, "0")}
                        </span>
                        <span className="font-semibold">{s.titulo}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-pink-500" />
                    </a>
                  ))}
                </nav>
              </div>

              <div className="bg-gradient-to-tr from-pink-600 to-rose-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-pink-200/50 dark:shadow-none relative overflow-hidden">
                <Mail className="w-8 h-8 mb-4 text-pink-200" />
                <p className="text-lg font-bold mb-2">¿Dudas o solicitudes?</p>
                <p className="text-sm text-pink-100 mb-6 opacity-90 leading-relaxed">
                  Escríbenos para ejercer tus derechos ARCO o solicitar la eliminación de tu cuenta.
                </p>
                <a
                  href={`mailto:${CORREO}`}
                  className="flex items-center justify-center w-full bg-white dark:bg-gray-700 text-pink-700 dark:text-pink-300 py-3.5 rounded-2xl text-xs font-black hover:bg-pink-50 dark:hover:bg-gray-600 transition-colors"
                >
                  ENVIAR CORREO
                </a>
              </div>
            </div>
          </aside>

          {/* CUERPO */}
          <div className="lg:w-3/4 space-y-10">
            {secciones.map(s => (
              <section
                key={s.numero}
                id={`seccion-${s.numero}`}
                className="scroll-mt-12 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-pink-50 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-500"
              >
                <div className="p-8 md:p-12">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 text-xs font-black w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      {s.numero}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                      {s.titulo}
                    </h2>
                  </div>

                  <div className="space-y-5">
                    {s.bloques.map((b, i) =>
                      b.tipo === "p" ? (
                        <p key={i} className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                          <TextoLinea {...b.linea} />
                        </p>
                      ) : (
                        <ul
                          key={i}
                          className="bg-pink-50/40 dark:bg-gray-900/60 border border-pink-100/50 dark:border-gray-700 rounded-[1.5rem] p-6 space-y-3"
                        >
                          {b.items.map((item, j) => (
                            <li key={j} className="text-sm md:text-base text-gray-600 dark:text-gray-300 flex gap-3 items-start leading-snug">
                              <span className="text-pink-500 font-bold mt-0.5">•</span>
                              <span><TextoLinea {...item} /></span>
                            </li>
                          ))}
                        </ul>
                      )
                    )}
                  </div>
                </div>
              </section>
            ))}

            {/* Pie con datos de la responsable */}
            <section className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-pink-50 dark:border-gray-700 shadow-sm p-8 md:p-12">
              <div className="space-y-3 text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                <p><TextoLinea etiqueta="Responsable" texto="Brenda Hernandez Garcia" /></p>
                <p><TextoLinea etiqueta="Nombre comercial" texto="Academia, Distribuidora y Salón Brenn's" /></p>
                <p><TextoLinea etiqueta="Domicilio" texto="Plaza de la Revolución Mexicana 5, Centro, Huejutla de Reyes, Hidalgo, México." /></p>
                <p><TextoLinea etiqueta="Correo electrónico" texto={CORREO} href={`mailto:${CORREO}`} /></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
// src/lib/politicas-defaults.ts
// Defaults de contenido para los 3 documentos legales.
// El admin puede sobrescribir cualquier campo desde /admin/politicas
// y se guardan en config_sitio con la clave correspondiente.

export const TERMINOS_SECCIONES = [
  {
    clave: "terminos_s0",
    titulo: "Información general",
    default:
      "Se establecen los Términos y Condiciones (\"T&C\") que rigen el acceso y uso de la plataforma digital \"Sistema Integral Multiplataforma Salón Brenn's\". La Plataforma es propiedad y está operada por Distribuidora, Academia y Salón Brenn's.\n\nGiro: Salón de Belleza, Distribución y Academia\nUbicación: Huejutla de Reyes, Hidalgo, México\nContacto: salonbrennsdudas@gmail.com",
  },
  {
    clave: "terminos_s1",
    titulo: "Aceptación de términos",
    default:
      "La utilización de cualquier servicio (citas, cursos o compra) implica la aceptación plena y sin reservas de estos T&C mediante el proceso de registro o transacción.",
  },
  {
    clave: "terminos_s2",
    titulo: "Proceso de compra y precios",
    default:
      "La Plataforma permite agendar servicios y puede requerir un anticipo. El precio exhibido es final e incluye impuestos (IVA).\n\n• Anticipos requeridos para citas\n• Pagos seguros con tarjeta\n• Inscripción a cursos sujeta a cupo",
  },
  {
    clave: "terminos_s3",
    titulo: "Envíos",
    default:
      "El proceso incluye selección, cálculo de costos y confirmación. Los tiempos de entrega se informan al momento de la compra.",
  },
  {
    clave: "terminos_s4",
    titulo: "Política de devoluciones",
    default:
      "La Empresa no acepta devoluciones, cambios ni reembolsos por retracto o cambio de opinión una vez consumado el servicio o entrega. Es responsabilidad del cliente revisar los productos y detalles del servicio antes de finalizar la transacción.",
  },
  {
    clave: "terminos_s5",
    titulo: "Cancelaciones",
    default:
      "Las cancelaciones son procedentes con un mínimo de 24 horas. Fuera de ese plazo, el anticipo no es reembolsable.",
  },
  {
    clave: "terminos_s6",
    titulo: "Garantías",
    default:
      "Se ofrece Garantía Legal por defectos de fabricación. Salón Brenn's determinará la reparación o reembolso según la LFPC.",
  },
  {
    clave: "terminos_s7",
    titulo: "Marco legal",
    default:
      "Estos T&C se rigen por la legislación mexicana y la Ley Federal de Protección al Consumidor (PROFECO).",
  },
  {
    clave: "terminos_s8",
    titulo: "Modificaciones",
    default:
      "Salón Brenn's podrá modificar estos T&C informando con 10 días de anticipación en La Plataforma.",
  },
]

export const PRIVACIDAD_SECCIONES = [
  {
    clave: "privacidad_s0",
    titulo: "Identidad y domicilio del responsable",
    default:
      "Academia, Distribuidora y Salón Brenn's (\"Brenn's\"), con domicilio en calle Juan Mogica Ugalde, colonia Capitán Antonio Reyes, municipio Huejutla de Reyes, Hgo., C.P. 43000, en la entidad de Hidalgo, México, y portal de internet: salonbrenns11@gmail.com, es el responsable del tratamiento y protección de sus datos personales.\n\nBrenn's se compromete a cumplir con los principios de Licitud, Consentimiento, Información, Calidad, Finalidad, Lealtad, Proporcionalidad y Responsabilidad establecidos en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.",
  },
  {
    clave: "privacidad_s1",
    titulo: "Datos personales recabados",
    default:
      "Datos de identificación y contacto: Nombre completo, domicilio, teléfono celular, correo electrónico.\n\nDatos académicos y de servicios: Historial de citas, servicios contratados, historial de compras, cursos inscritos, progreso académico.\n\nTransacciones y financieros: Últimos 4 dígitos de tarjeta, referencias de pago. Brenn's NO almacena CVV ni números completos.",
  },
  {
    clave: "privacidad_s2",
    titulo: "Finalidades del tratamiento",
    default:
      "Finalidades Primarias: Gestión de citas y salón, administración de cursos y certificaciones, procesamiento de pedidos e-commerce, atención al cliente personalizada, notificaciones críticas del servicio.\n\nFinalidades Secundarias: Promociones, ofertas y marketing, estudios de mercado y calidad. Si no desea que sus datos se usen para fines secundarios, envíe un correo a salonbrennsdudas@gmail.com.",
  },
  {
    clave: "privacidad_s3",
    titulo: "Transferencias de datos",
    default:
      "Sus datos podrán ser transferidos sin requerir consentimiento en los siguientes casos:\n\n• Pasarelas de Pago: Para la validación de transacciones.\n• Proveedores Cloud: Para almacenamiento seguro y soporte técnico.\n\nCualquier otra transferencia requerirá su autorización expresa.",
  },
  {
    clave: "privacidad_s4",
    titulo: "Derechos ARCO",
    default:
      "Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse (Derechos ARCO) al tratamiento de su información.\n\nProcedimiento: Envíe un correo a salonbrennsdudas@gmail.com con su nombre, correo electrónico, el derecho que desea ejercer e identificación oficial adjunta. Plazo de respuesta: 20 días hábiles.",
  },
  {
    clave: "privacidad_s5",
    titulo: "Uso de Cookies",
    default:
      "Utilizamos cookies para mejorar su experiencia, recordar sus preferencias y analizar el tráfico. Puede gestionar o desactivar las cookies directamente en la configuración de su navegador.",
  },
  {
    clave: "privacidad_s6",
    titulo: "Limitación y Quejas",
    default:
      "Si considera vulnerado su derecho, puede acudir al INAI (www.inai.org.mx). También puede inscribirse al REUS de la CONDUSEF para limitar la publicidad comercial.",
  },
  {
    clave: "privacidad_s7",
    titulo: "Cambios al Aviso",
    default:
      "Este aviso puede actualizarse por reformas legales o necesidades del negocio. Notificaremos cambios sustanciales vía correo electrónico.",
  },
]

export const POLITICAS_SECCIONES = [
  {
    clave: "politicas_s0",
    titulo: "Privacidad de datos",
    default:
      "Brenn's trata sus datos personales con estricta confidencialidad, apegándose a los principios de licitud, consentimiento e información.\nSus datos son utilizados exclusivamente para la gestión de citas, administración de cursos, procesamiento de pedidos y comunicación esencial.\nNo compartimos su información con terceros, salvo con pasarelas de pago y proveedores tecnológicos necesarios para operar.\nNunca almacenamos datos financieros completos como números de tarjeta o CVV.",
  },
  {
    clave: "politicas_s1",
    titulo: "Devoluciones y cambios",
    default:
      "Brenn's no acepta devoluciones, cambios ni reembolsos por simple retracto o cambio de opinión una vez que el servicio ha sido consumado.\nLa única excepción es la Garantía Legal por defectos de fabricación o vicios ocultos.\nBrenn's determinará si aplica reparación, reemplazo o reembolso conforme a la Ley Federal de Protección al Consumidor (LFPC).\nSi recibió un producto dañado, notifique inmediatamente a nuestro correo oficial.",
  },
  {
    clave: "politicas_s2",
    titulo: "Política de cancelaciones",
    default:
      "Las cancelaciones de citas son procedentes únicamente si se realizan con un mínimo de 24 horas de antelación.\nEn caso de cancelación fuera del plazo o inasistencia, el anticipo pagado no será reembolsable.\nPara cancelaciones de cursos, aplican las condiciones específicas informadas al momento de la inscripción.",
  },
  {
    clave: "politicas_s3",
    titulo: "Política de envíos",
    default:
      "El proceso de compra incluye: selección, cálculo de envío y confirmación final de la transacción.\nEl tiempo estimado de entrega será informado al cliente al momento de confirmar la compra.\nLos precios exhibidos son finales e incluyen los impuestos aplicables (IVA).\nEn caso de pedidos no entregados, el cliente debe reportarlo a soporte técnico.",
  },
]

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Alexa Skill | Admin",
}

const PIN = "2580"

const INTENTS = [
  {
    intent: "AMAZON.CancelIntent",
    tipo: "amazon",
    utterances: ["cerrar skill", "hasta luego", "adiós", "terminar", "cancelar", "salir"],
    descripcion: "Cancela la operación actual y cierra la interacción con la skill.",
  },
  {
    intent: "AMAZON.StopIntent",
    tipo: "amazon",
    utterances: ["cerrar skill", "hasta luego", "adiós", "terminar", "cancelar", "salir"],
    descripcion: "Finaliza la sesión y cierra la skill.",
  },
  {
    intent: "AMAZON.YesIntent",
    tipo: "amazon",
    utterances: [],
    descripcion: "Confirma una pregunta o acción pendiente cuando Alexa espera una respuesta afirmativa.",
  },
  {
    intent: "AMAZON.NoIntent",
    tipo: "amazon",
    utterances: [],
    descripcion: "Rechaza o cancela una pregunta o acción pendiente cuando Alexa espera una respuesta negativa.",
  },
  {
    intent: "AMAZON.HelpIntent",
    tipo: "amazon",
    utterances: ["dime las opciones", "qué comandos puedo usar", "cómo funciona", "opciones", "qué puedes hacer", "ayuda"],
    descripcion: "Explica las funciones disponibles y proporciona ejemplos de comandos que se pueden usar.",
  },
  {
    intent: "AMAZON.FallbackIntent",
    tipo: "amazon",
    utterances: [],
    descripcion: "Se activa cuando Alexa no reconoce la solicitud y orienta a la persona con comandos válidos.",
  },
  {
    intent: "AMAZON.NavigateHomeIntent",
    tipo: "amazon",
    utterances: [],
    descripcion: "Regresa a la pantalla principal o de bienvenida de la skill.",
  },
  {
    intent: "AMAZON.NextIntent",
    tipo: "amazon",
    utterances: [],
    descripcion: "Permite avanzar al siguiente elemento o pantalla cuando el contexto de la skill lo admite.",
  },
  {
    intent: "AMAZON.PreviousIntent",
    tipo: "amazon",
    utterances: [],
    descripcion: "Permite regresar al elemento o pantalla anterior cuando el contexto de la skill lo admite.",
  },
  {
    intent: "IngresarPinSimuladoIntent",
    tipo: "custom",
    utterances: [
      "mi pin es {codigoPin}",
      "el pin es {codigoPin}",
      "pin {codigoPin}",
      "ingresar pin {codigoPin}",
      "mi código es {codigoPin}",
      "mi número de acceso es {codigoPin}",
      "el código de acceso es {codigoPin}",
    ],
    descripcion: "Recibe y valida el PIN simulado antes de permitir el uso de las funciones protegidas de la skill.",
  },
  {
    intent: "ReintentarPinIntent",
    tipo: "custom",
    utterances: [
      "reintentar",
      "intentar de nuevo",
      "volver a intentar",
      "verificar otra vez",
      "pedir el pin otra vez",
      "quiero reintentar",
      "sí quiero reintentar",
    ],
    descripcion: "Permite volver a ingresar y validar el PIN después de un intento incorrecto.",
  },
  {
    intent: "ConsultarCitasDiaIntent",
    tipo: "custom",
    utterances: [
      "dime cuántas clientas vienen hoy",
      "consulta las citas de {fechaCita}",
      "cuántas citas tengo {fechaCita}",
      "cuántas citas hay hoy",
      "cuántas citas pendientes tengo hoy",
      "cuántas clientas tengo {fechaCita}",
      "consulta mis citas del día",
    ],
    descripcion: "Consulta y comunica la cantidad de citas programadas o pendientes para el día o la fecha indicada.",
  },
  {
    intent: "ConsultarAgendaDiaIntent",
    tipo: "custom",
    utterances: [
      "dime las citas programadas para {fechaCita}",
      "consulta la agenda de {fechaCita}",
      "dime mi agenda",
      "agenda de hoy",
      "ver agenda",
      "cuáles son mis citas",
      "cuál es mi agenda de hoy",
    ],
    descripcion: "Consulta y muestra la agenda detallada de citas correspondiente al día o a la fecha solicitada.",
  },
  {
    intent: "ConsultarProximaClientaIntent",
    tipo: "custom",
    utterances: [
      "quién sigue en la agenda",
      "quién viene después",
      "qué cita sigue",
      "dime la próxima clienta",
      "cuál es mi siguiente cita",
      "próxima clienta",
      "siguiente cita",
    ],
    descripcion: "Consulta cuál es la siguiente cita pendiente y muestra los datos de la próxima clienta.",
  },
  {
    intent: "RecordatorioCitaIntent",
    tipo: "custom",
    utterances: [
      "crear recordatorio",
      "programar recordatorio de cita",
      "quiero un recordatorio",
      "recuérdame mi próxima cita",
      "recuérdame la cita de {horaCita}",
      "recordatorio de cita",
      "crear recordatorio para la {referenciaCita}",
    ],
    descripcion: "Inicia el proceso para crear un recordatorio de una cita: próxima, actual o indicada por hora.",
  },
  {
    intent: "SeleccionarAnticipacionRecordatorioIntent",
    tipo: "custom",
    utterances: [
      "{anticipacion}",
      "elige {anticipacion}",
      "quiero {anticipacion}",
      "recuérdame {anticipacion}",
      "programar recordatorio {anticipacion}",
    ],
    descripcion: "Selecciona con cuánta anticipación debe activarse el recordatorio de la cita.",
  },
  {
    intent: "FinalizarCitaIntent",
    tipo: "custom",
    utterances: [
      "finaliza la cita actual",
      "finaliza la {referenciaCita}",
      "finaliza la cita de {horaCita}",
      "terminé con {nombreClienta}",
      "ya atendí a {nombreClienta}",
      "marcar cita como finalizada",
      "ya terminé la cita",
    ],
    descripcion: "Localiza la cita indicada y la marca como finalizada en la base de datos.",
  },
]

const TIPOS_PERSONALIZADOS = [
  {
    nombre: "REFERENCIA_CITA",
    valores: [
      { principal: "próxima",   sinonimos: "próxima, la próxima, próxima cita, la próxima cita" },
      { principal: "siguiente", sinonimos: "siguiente, la siguiente, siguiente cita, la siguiente cita" },
      { principal: "actual",    sinonimos: "actual, la actual, cita actual, la cita actual, la de ahora" },
      { principal: "en curso",  sinonimos: "en curso, la cita en curso, cita en curso" },
    ],
  },
  {
    nombre: "ANTICIPACION_RECORDATORIO",
    valores: [
      { principal: "5 minutos antes",  sinonimos: "cinco minutos antes, 5 minutos, cinco minutos, en 5 minutos, en cinco minutos" },
      { principal: "10 minutos antes", sinonimos: "diez minutos antes, 10 minutos, diez minutos, en 10 minutos, en diez minutos" },
      { principal: "15 minutos antes", sinonimos: "quince minutos antes, 15 minutos, quince minutos, en 15 minutos, en quince minutos" },
      { principal: "justo a la hora",  sinonimos: "a la hora, en la hora, justo en la hora, a la hora de la cita, cuando sea la cita" },
    ],
  },
]

export default function AlexaSkillPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300">Alexa Skill</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Nombre de invocación: <span className="font-semibold text-pink-700 dark:text-pink-400">salón bren</span>
        </p>
      </div>

      {/* PIN */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-pink-700 to-pink-900 rounded-2xl p-5 text-white shadow-lg w-fit">
        <div className="bg-white/20 rounded-xl p-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-pink-200 font-medium uppercase tracking-wider">Tu PIN de Alexa es</p>
          <p className="text-4xl font-bold tracking-widest">{PIN}</p>
        </div>
      </div>

      {/* Tabla de intents */}
      <div>
        <h2 className="text-lg font-semibold text-pink-900 dark:text-pink-300 mb-3">Utterances y funciones</h2>
        <div className="overflow-x-auto rounded-2xl border border-pink-100 dark:border-pink-900 shadow-sm">
          <table className="min-w-full divide-y divide-pink-100 dark:divide-pink-900">
            <thead className="bg-pink-50 dark:bg-pink-950/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-pink-700 dark:text-pink-400 w-52">Intent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-pink-700 dark:text-pink-400">Utterances</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-pink-700 dark:text-pink-400 w-72">¿Qué hace?</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-pink-50 dark:divide-pink-900/30">
              {INTENTS.map((row) => (
                <tr key={row.intent} className="hover:bg-pink-50/50 dark:hover:bg-pink-950/10 transition-colors">
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-block text-xs font-mono font-semibold px-2 py-1 rounded-lg ${
                      row.tipo === "amazon"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        : "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300"
                    }`}>
                      {row.intent}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    {row.utterances.length === 0 ? (
                      <span className="text-xs text-gray-400 italic">Sin utterances personalizadas.</span>
                    ) : (
                      <ul className="space-y-0.5">
                        {row.utterances.map((u) => (
                          <li key={u} className="text-xs text-gray-700 dark:text-gray-300 before:content-['•'] before:mr-1.5 before:text-pink-400">
                            {u}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {row.descripcion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tipos personalizados */}
      <div>
        <h2 className="text-lg font-semibold text-pink-900 dark:text-pink-300 mb-1">Tipos personalizados</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Valores y sinónimos que amplían el reconocimiento de frases en la skill.</p>
        <div className="grid gap-6 md:grid-cols-2">
          {TIPOS_PERSONALIZADOS.map((tipo) => (
            <div key={tipo.nombre} className="rounded-2xl border border-pink-100 dark:border-pink-900 overflow-hidden shadow-sm">
              <div className="bg-pink-50 dark:bg-pink-950/30 px-4 py-3 border-b border-pink-100 dark:border-pink-900">
                <span className="text-sm font-mono font-bold text-pink-800 dark:text-pink-300">{tipo.nombre}</span>
              </div>
              <table className="min-w-full divide-y divide-pink-50 dark:divide-pink-900/30">
                <thead className="bg-pink-50/50 dark:bg-pink-950/10">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase w-36">Valor principal</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase">Sinónimos reconocidos</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-pink-50 dark:divide-pink-900/30">
                  {tipo.valores.map((v) => (
                    <tr key={v.principal}>
                      <td className="px-4 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">{v.principal}</td>
                      <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">{v.sinonimos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// src/app/admin/roles/page.tsx
"use client"

import { Shield, User, GraduationCap, Crown, Check, X } from "lucide-react"

const ROLES = [
  {
    nombre: "ADMIN",
    icon: Crown,
    color: "bg-pink-500",
    border: "border-pink-200",
    descripcion: "Acceso completo al sistema",
    permisos: [
      "Ver y editar todos los módulos",
      "Gestionar usuarios y roles",
      "Ver reportes y estadísticas",
      "Configurar el sistema",
      "Gestionar pagos",
    ]
  },
  {
    nombre: "DOCENTE",
    icon: GraduationCap,
    color: "bg-blue-500",
    border: "border-blue-200",
    descripcion: "Acceso a módulos de cursos",
    permisos: [
      "Ver sus cursos asignados",
      "Ver inscripciones",
      "Ver su perfil",
      "Sin acceso a pagos",
      "Sin acceso a configuración",
    ]
  },
  {
    nombre: "CLIENTE",
    icon: User,
    color: "bg-green-500",
    border: "border-green-200",
    descripcion: "Acceso al portal de clientes",
    permisos: [
      "Ver y comprar productos",
      "Agendar citas",
      "Ver sus pedidos y citas",
      "Editar su perfil",
      "Sin acceso al admin",
    ]
  },
]

const USUARIOS_DEMO = [
  { nombre: "Admin Brenn&apos;s", correo: "admin@brenns.com", rol: "ADMIN" },
  { nombre: "Benilde López", correo: "benilde@correo.com", rol: "CLIENTE" },
  { nombre: "Ana García",    correo: "ana@correo.com",    rol: "CLIENTE" },
]

export default function RolesPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-pink-500" /> Roles y permisos
        </h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona los niveles de acceso del sistema</p>
      </div>

      {/* Roles */}
      <div className="grid md:grid-cols-3 gap-4">
        {ROLES.map(({ nombre, icon: Icon, color, border, descripcion, permisos }) => (
          <div key={nombre} className={`bg-white rounded-2xl border-2 ${border} shadow-sm p-5`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-800">{nombre}</p>
                <p className="text-xs text-gray-500">{descripcion}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {permisos.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {i < 3
                    ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    : <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  }
                  <span className={i < 3 ? "text-gray-700" : "text-gray-400"}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Usuarios y sus roles */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Usuarios registrados</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-pink-50">
            <tr>
              {["Usuario","Correo","Rol actual","Cambiar rol"].map(h => (
                <th key={h} className="text-left text-pink-600 font-semibold px-4 py-3 text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {USUARIOS_DEMO.map((u, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800">{u.nombre}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.correo}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    u.rol === "ADMIN" ? "bg-pink-100 text-pink-700" :
                    u.rol === "DOCENTE" ? "bg-blue-100 text-blue-700" :
                    "bg-green-100 text-green-700"
                  }`}>{u.rol}</span>
                </td>
                <td className="px-4 py-3">
                  <select className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-pink-400">
                    <option>ADMIN</option>
                    <option>DOCENTE</option>
                    <option>CLIENTE</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-orange-500 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
        ⚠️ Esta sección está en desarrollo. Los cambios de rol aún no se guardan.
      </p>
    </div>
  )
}
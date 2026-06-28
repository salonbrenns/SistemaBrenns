#!/bin/bash
# Script de commit — Salón Brenn's
# Generado: 2026-06-28

set -e

cd "$(dirname "$0")"

echo "📦 Preparando commit..."

git add \
  src/app/\(cliente\)/ \
  src/app/\(public\)/ \
  src/app/api/admin/citas/ \
  src/app/api/empleado/ \
  src/app/api/paypal/ \
  src/app/api/usuario/recordatorios/ \
  src/app/empleado/ \
  src/app/admin/ \
  src/components/ \
  src/hooks/ \
  src/lib/ \
  src/store/ \
  src/middleware.ts \
  src/types/

echo "✅ Archivos agregados."

git commit -m "feat: dark mode completo + empleado dashboard + correos fix

DARK MODE
- Tailwind v4 custom-variant dark (&:is(.dark *)) en todas las páginas
- ThemeProvider con persistencia (light / dark / system)
- Toggle sol/luna en Header público y sidebar admin
- Cobertura completa: public, cliente, admin, empleado

EMPLEADO
- /api/empleado/stats — stats filtradas por empleado_id (fix bug)
- Dashboard rediseñado: citas hoy, próxima cita, pendientes por confirmar
- Títulos de citas/mi-horario/notificaciones con dark:text-pink-300

EMAILS
- mailer.ts: corregido Brenn&apos;s → Brenn's en from/subject/html
- Flujo recuperar contraseña probado end-to-end (funcional)

UI
- Calendario de agendar: dark mode en celdas, mes, hoy, slots
- MarcasUniverso: celdas dark:bg-gray-200 para logos visibles en dark
- Slot buttons: dark:bg-gray-800 disponibles / dark:text-gray-600 pasados
- Banner 'No hay horas disponibles para hoy' cuando todas pasaron
- ESPECIALISTA movido al sidebar debajo de Tu cita
- Admin sidebar: toggle de tema integrado sobre Cerrar Sesión

API
- /api/horarios: devuelve todos los slots con flag disponible (fix)
- /api/empleado/stats: citas hoy, próxima cita, pendientes
- /api/empleado/stats: filtra correctamente por empleado_id

MISC
- store/siteConfigStore: Brenn&apos;s → Brenn's en strings JS
- adminLayoutClient: mismo fix de entidad HTML
"

echo ""
echo "🚀 Commit listo. Para subir a GitHub ejecuta:"
echo "   git push origin main"

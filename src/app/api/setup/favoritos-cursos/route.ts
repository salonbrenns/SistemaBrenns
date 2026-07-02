/**
 * ONE-TIME SETUP — crea la tabla ventas.tblfavoritos_cursos si no existe.
 * Visitar GET /api/setup/favoritos-cursos una sola vez (o usar:
 *   npx prisma db push
 * en la terminal del proyecto para el mismo resultado).
 */
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ventas.tblfavoritos_cursos (
        id         SERIAL PRIMARY KEY,
        usuario_id INTEGER   NOT NULL,
        curso_id   INTEGER   NOT NULL,
        creado_en  TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_fav_curso_usuario
          FOREIGN KEY (usuario_id)
          REFERENCES seguridad.tblusuarios(id)
          ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT uq_fav_curso UNIQUE (usuario_id, curso_id)
      )
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_fav_cursos_usuario
        ON ventas.tblfavoritos_cursos(usuario_id)
    `)
    return NextResponse.json({ ok: true, message: "Tabla tblfavoritos_cursos lista ✓" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

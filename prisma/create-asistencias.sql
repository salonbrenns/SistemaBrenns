-- Ejecutar en Neon SQL Editor
-- Crea la tabla de asistencias en el schema "cursos"

CREATE TABLE IF NOT EXISTS cursos.tblasistencias (
  id             SERIAL PRIMARY KEY,
  inscripcion_id INTEGER NOT NULL,
  fecha          DATE    NOT NULL,
  presente       BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_asistencia UNIQUE (inscripcion_id, fecha)
);

-- Estandarizar nombres de columnas de auditoría: camelCase → snake_case
-- Las tablas que ya usan snake_case (fecha_creacion, creado_en, created_at) no se tocan.

-- agenda.tblcitas
ALTER TABLE agenda.tblcitas
  RENAME COLUMN "createdAt" TO created_at;

-- agenda.tbldias_bloqueados
ALTER TABLE agenda.tbldias_bloqueados
  RENAME COLUMN "createdAt" TO created_at;

-- catalogos.tblservicios
ALTER TABLE catalogos.tblservicios
  RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE catalogos.tblservicios
  RENAME COLUMN "updatedAt" TO updated_at;

-- catalogos.tblempleados
ALTER TABLE catalogos.tblempleados
  RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE catalogos.tblempleados
  RENAME COLUMN "updatedAt" TO updated_at;

-- catalogos.tblfaq
ALTER TABLE catalogos.tblfaq
  RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE catalogos.tblfaq
  RENAME COLUMN "updatedAt" TO updated_at;

-- sistema.tblavisos_admin
ALTER TABLE sistema.tblavisos_admin
  RENAME COLUMN "createdAt" TO created_at;

-- seguridad.tbltoken_recuperacion
ALTER TABLE seguridad.tbltoken_recuperacion
  RENAME COLUMN "createdAt" TO created_at;

-- seguridad.tbltoken_verificacion
ALTER TABLE seguridad.tbltoken_verificacion
  RENAME COLUMN "createdAt" TO created_at;

-- ventas.tblpromociones
ALTER TABLE ventas.tblpromociones
  RENAME COLUMN "createdAt" TO created_at;

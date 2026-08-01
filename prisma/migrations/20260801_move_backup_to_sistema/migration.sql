-- Crear schema sistema y mover tablas de administración/sistema

CREATE SCHEMA IF NOT EXISTS sistema;

ALTER TABLE seguridad.tblbackup SET SCHEMA sistema;

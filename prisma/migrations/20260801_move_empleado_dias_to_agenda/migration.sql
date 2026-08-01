-- Mover tblempleado_dias de schema seguridad → agenda
-- La FK hacia seguridad.tblusuarios se mantiene válida (cross-schema FK en PostgreSQL)

ALTER TABLE seguridad.tblempleado_dias SET SCHEMA agenda;

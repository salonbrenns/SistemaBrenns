-- Mover tblempleado_hora_excepciones de schema seguridad → agenda
-- La FK hacia seguridad.tblusuarios se mantiene válida (cross-schema FK en PostgreSQL)

ALTER TABLE seguridad.tblempleado_hora_excepciones SET SCHEMA agenda;

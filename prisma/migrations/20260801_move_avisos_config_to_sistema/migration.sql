-- Mover tblavisos_admin y tblconfig_sitio de schema seguridad → sistema

ALTER TABLE seguridad.tblavisos_admin SET SCHEMA sistema;
ALTER TABLE seguridad.tblconfig_sitio  SET SCHEMA sistema;

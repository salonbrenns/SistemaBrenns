-- Vincular perfil público (catalogos.tblempleados) con cuenta de sistema (seguridad.tblusuarios)
-- La FK es opcional (NULL): un empleado puede tener perfil web sin cuenta de sistema y viceversa.
-- ON DELETE SET NULL: si se elimina el usuario, el perfil público queda desvinculado (no se borra).

ALTER TABLE catalogos.tblempleados
  ADD COLUMN usuario_id INT UNIQUE,
  ADD CONSTRAINT fk_empleado_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES seguridad.tblusuarios(id)
    ON DELETE SET NULL;

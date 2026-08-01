-- Renombrar tblfavoritos → tblfavoritos_productos para consistencia con
-- tblfavoritos_cursos y tblfavoritos_servicios

ALTER TABLE ventas.tblfavoritos RENAME TO tblfavoritos_productos;

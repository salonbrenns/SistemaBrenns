-- Mover tblproductos y tblvariantes de schema ventas → catalogos
-- Son catálogo maestro, no transacciones.
-- Las FK desde ventas.tbldetalle_pedidos → tblvariantes y
-- ventas.tblpromociones_productos → tblproductos siguen siendo válidas (cross-schema FK).

ALTER TABLE ventas.tblproductos SET SCHEMA catalogos;
ALTER TABLE ventas.tblvariantes  SET SCHEMA catalogos;

-- Índices en tblcitas (schema agenda)
CREATE INDEX IF NOT EXISTS idx_citas_fecha         ON agenda.tblcitas (fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado        ON agenda.tblcitas (estado);
CREATE INDEX IF NOT EXISTS idx_citas_usuario       ON agenda.tblcitas (usuario_id);
CREATE INDEX IF NOT EXISTS idx_citas_empleado      ON agenda.tblcitas (empleado_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_estado  ON agenda.tblcitas (fecha, estado);

-- Índices en tblpedidos (schema ventas)
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario      ON ventas.tblpedidos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado       ON ventas.tblpedidos (estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha        ON ventas.tblpedidos (fecha_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_fecha ON ventas.tblpedidos (estado, fecha_pedido);

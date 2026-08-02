# -*- coding: utf-8 -*-
"""
Carga las canastas (transacciones) desde la base de datos PostgreSQL (Neon).
Cada pedido ENTREGADO/PAGADO es una transacción; sus productos son los ítems.
Opcionalmente agrega los favoritos de cada usuario como transacciones extra
(más señales de "productos que van juntos" para el mismo perfil de cliente).

Identidad del ítem vs. nombre para mostrar (fuente única de verdad):
  - El ÍTEM de cada canasta es `tblvariantes.producto_id` (un entero), obtenido
    uniendo tbldetalle_pedidos.variante_id -> tblvariantes.id. Esa es la única
    llave que usa Apriori para decidir si dos productos "van juntos".
  - El NOMBRE para mostrar se obtiene una sola vez, siempre de
    `tblproductos.nombre` (el catálogo vigente).
  - El esquema actual de `tbldetalle_pedidos` ya no guarda el nombre del
    producto (columna histórica `nombre_producto` eliminada en el rediseño
    de la tabla); el nombre siempre se resuelve por join hacia el catálogo
    vigente. Un mismo producto se identifica por su producto_id, sin
    importar cómo se llamaba en el momento de cada pedido.
"""
import os
import re
import psycopg

RUTA_ENV = os.path.join(os.path.dirname(__file__), "..", ".env")


def obtener_url():
    url = os.environ.get("DATABASE_URL")
    if not url and os.path.exists(RUTA_ENV):
        contenido = open(RUTA_ENV, encoding="utf-8").read()
        m = re.search(r'DATABASE_URL=["\']?([^"\'\n]+)', contenido)
        if m:
            url = m.group(1)
    if not url:
        raise RuntimeError("No se encontró DATABASE_URL (ni en el entorno ni en ../.env)")
    # psycopg2 no acepta el parámetro pgbouncer de Prisma
    return re.sub(r"[&?]pgbouncer=[^&]*", "", url)


def cargar_canastas(incluir_favoritos=True):
    """
    Devuelve (canastas, nombres):
      canastas: lista de (id_transaccion, [producto_id, ...])
      nombres:  { producto_id: nombre }
    """
    conn = psycopg.connect(obtener_url(), connect_timeout=15)
    cur = conn.cursor()

    # canastas de pedidos: detalle -> variante -> producto
    cur.execute("""
        SELECT d.pedido_id, v.producto_id
        FROM ventas.tbldetalle_pedidos d
        JOIN catalogos.tblvariantes v ON v.id = d.variante_id
        JOIN ventas.tblpedidos p ON p.id = d.pedido_id
        WHERE p.estado IN ('ENTREGADO', 'PAGADO')
    """)
    canastas_map = {}
    for pedido_id, producto_id in cur.fetchall():
        canastas_map.setdefault(f"P{pedido_id}", set()).add(producto_id)

    if incluir_favoritos:
        # los favoritos de un usuario también son una "canasta" de afinidad
        cur.execute("SELECT usuario_id, producto_id FROM ventas.tblfavoritos_productos")
        for usuario_id, producto_id in cur.fetchall():
            canastas_map.setdefault(f"F{usuario_id}", set()).add(producto_id)

    # nombres de productos activos
    cur.execute("SELECT id, nombre FROM catalogos.tblproductos WHERE activo = true")
    nombres = {pid: nombre for pid, nombre in cur.fetchall()}

    conn.close()

    # solo canastas con 2+ ítems aportan pares al algoritmo
    canastas = [(tid, sorted(items)) for tid, items in canastas_map.items() if len(items) >= 2]
    return canastas, nombres

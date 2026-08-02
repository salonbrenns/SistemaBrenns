# -*- coding: utf-8 -*-
"""
ETL — Solución 1 (recomendador de productos).

Se conecta a la base de datos (usando DATABASE_URL del .env del proyecto,
igual que db.py) y produce los archivos que la libreta de desarrollo
consume, SIN que la libreta necesite tocar la BD ni credenciales:

  dataset/dataset_recomendador.csv    -> renglones (pedido_id, producto_id, producto)
  dataset/catalogo_productos.csv      -> catálogo completo (id, nombre) para interpretar resultados
  dataset/resumen_extraccion.json     -> conteos, proporción real/sintética, metadatos

Ejecutar:  python etl_extraer_dataset.py
(requiere las mismas dependencias que main.py: psycopg[binary])
"""
import os
import re
import csv
import json
from datetime import datetime

import psycopg

RUTA_ENV = os.path.join(os.path.dirname(__file__), "..", ".env")
# Escribe directo en la carpeta de entrega (misma estructura que exige la
# sección 10 del documento), para que la libreta la lea con ruta relativa.
CARPETA_SALIDA = os.path.join(os.path.dirname(__file__), "..", "entrega", "05_Datasets")


def obtener_url():
    url = os.environ.get("DATABASE_URL")
    if not url and os.path.exists(RUTA_ENV):
        contenido = open(RUTA_ENV, encoding="utf-8").read()
        m = re.search(r'DATABASE_URL=["\']?([^"\'\n]+)', contenido)
        if m:
            url = m.group(1)
    if not url:
        raise RuntimeError("No se encontró DATABASE_URL (variable de entorno o ../.env)")
    return re.sub(r"[&?]pgbouncer=[^&]*", "", url)


def escribir_csv(ruta, encabezados, filas):
    with open(ruta, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(encabezados)
        w.writerows(filas)


def main():
    os.makedirs(CARPETA_SALIDA, exist_ok=True)
    conn = psycopg.connect(obtener_url(), connect_timeout=15)
    cur = conn.cursor()

    def q(sql, params=None):
        # psycopg3 solo interpreta '%s'/'%b'/'%t' como placeholders cuando se le
        # pasa una tupla de parámetros (incluso vacía). Si no hay parámetros,
        # se ejecuta el SQL tal cual, para no romper con el '%' de un LIKE.
        if params:
            cur.execute(sql, params)
        else:
            cur.execute(sql)
        return cur.fetchall()

    print("== ETL: recomendador de productos ==")

    # --- 1) Volumen operativo total (sección 3.1) ---
    volumen = {
        "tblpedidos": q("SELECT COUNT(*) FROM ventas.tblpedidos")[0][0],
        "tbldetalle_pedidos": q("SELECT COUNT(*) FROM ventas.tbldetalle_pedidos")[0][0],
        "tblfavoritos": q("SELECT COUNT(*) FROM ventas.tblfavoritos_productos")[0][0],
        "tblcarrito_no_usado_en_modelo": q("SELECT COUNT(*) FROM ventas.tblcarrito")[0][0],
        "tblusuarios": q("SELECT COUNT(*) FROM seguridad.tblusuarios")[0][0],
    }
    print("Volumen operativo:", volumen)

    # --- 2) Proporción real vs sintético (sección 3.2) ---
    demo_ids = [r[0] for r in q("SELECT id FROM seguridad.tblusuarios WHERE correo LIKE '%@seed-ml.demo'")]
    pedidos_total = volumen["tblpedidos"]
    pedidos_demo = 0
    if demo_ids:
        ids_sql = ",".join(map(str, demo_ids))
        pedidos_demo = q(f"SELECT COUNT(*) FROM ventas.tblpedidos WHERE usuario_id IN ({ids_sql})")[0][0]

    # --- 3) Extracción principal: producto por producto dentro de cada pedido válido ---
    data = q("""
        SELECT d.pedido_id, pr.id AS producto_id, pr.nombre AS producto
        FROM ventas.tbldetalle_pedidos d
        JOIN catalogos.tblvariantes v  ON v.id = d.variante_id
        JOIN catalogos.tblproductos pr ON pr.id = v.producto_id
        JOIN ventas.tblpedidos p    ON p.id = d.pedido_id
        WHERE p.estado IN ('ENTREGADO', 'PAGADO')
    """)
    ruta_dataset = os.path.join(CARPETA_SALIDA, "dataset_recomendador.csv")
    escribir_csv(ruta_dataset, ["pedido_id", "producto_id", "producto"], data)
    print(f"Dataset extraído: {len(data)} renglones -> {ruta_dataset}")

    # --- 4) Catálogo completo (para traducir ids a nombres en la libreta, sin BD) ---
    catalogo = q("SELECT id, nombre FROM catalogos.tblproductos WHERE activo = true")
    ruta_catalogo = os.path.join(CARPETA_SALIDA, "catalogo_productos.csv")
    escribir_csv(ruta_catalogo, ["id", "nombre"], catalogo)
    print(f"Catálogo: {len(catalogo)} productos activos -> {ruta_catalogo}")

    # --- 5) Resumen / metadatos de la extracción ---
    resumen = {
        "generado_en": datetime.now().isoformat(timespec="seconds"),
        "volumen_operativo_bd": volumen,
        "total_operativo_solucion1": sum(volumen[k] for k in
                                          ("tblpedidos", "tbldetalle_pedidos", "tblfavoritos", "tblcarrito_no_usado_en_modelo")),
        "usuarios_sinteticos_seed": len(demo_ids),
        "pedidos_totales": pedidos_total,
        "pedidos_sinteticos": pedidos_demo,
        "pedidos_reales": pedidos_total - pedidos_demo,
        "proporcion_real_pct": round(100 * (pedidos_total - pedidos_demo) / pedidos_total, 2) if pedidos_total else 0,
        "proporcion_sintetico_pct": round(100 * pedidos_demo / pedidos_total, 2) if pedidos_total else 0,
        "renglones_dataset_recomendador": len(data),
        "catalogo_activo_total": len(catalogo),
    }
    ruta_resumen = os.path.join(CARPETA_SALIDA, "resumen_extraccion.json")
    with open(ruta_resumen, "w", encoding="utf-8") as f:
        json.dump(resumen, f, ensure_ascii=False, indent=2)
    print(f"Resumen guardado -> {ruta_resumen}")

    conn.close()
    print("\nListo. Los 3 archivos ya quedaron en entrega/05_Datasets/.")
    print("La libreta (entrega/06_Notebooks/) los carga con ruta relativa, sin tocar la BD.")


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""
ETL — Solución 2 (predicción de cancelación de citas).

Se conecta a la base de datos (usando DATABASE_URL del .env del proyecto,
igual que etl_extraer_dataset.py) y produce los archivos que la libreta de
clasificación consume, SIN que la libreta necesite tocar la BD ni credenciales:

  dataset/dataset_citas.csv          -> una fila por cita ya resuelta (pasada)
  dataset/catalogo_servicios.csv     -> catálogo de servicios (id, nombre, categoría, precio, duración)
  dataset/resumen_extraccion_citas.json -> conteos, balance de clases, metadatos

Deliberadamente NO se calcula aquí la tasa histórica de cancelación por
cliente ni otras variables derivadas de fecha/hora — eso se hace de forma
visible dentro de la libreta (sección "Preparación de los datos"), para que
quede evidencia explícita de que se evita fuga de datos (cada cita solo usa
información de citas ANTERIORES del mismo cliente).

Ejecutar:  python etl_extraer_citas.py
(requiere las mismas dependencias que main.py: psycopg[binary])
"""
import os
import re
import csv
import json
from datetime import datetime

import psycopg

RUTA_ENV = os.path.join(os.path.dirname(__file__), "..", ".env")
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
        if params:
            cur.execute(sql, params)
        else:
            cur.execute(sql)
        return cur.fetchall()

    print("== ETL: predicción de cancelación de citas ==")

    # --- 1) Volumen operativo total (para transparencia, sección 3.1 del documento) ---
    total_citas = q("SELECT COUNT(*) FROM agenda.tblcitas")[0][0]
    citas_reales = q("""
        SELECT COUNT(*) FROM agenda.tblcitas c
        JOIN seguridad.tblusuarios u ON u.id = c.usuario_id
        WHERE u.correo LIKE '%@uthh.edu.mx'
    """)[0][0]
    citas_pasadas = q("SELECT COUNT(*) FROM agenda.tblcitas WHERE fecha < NOW()")[0][0]
    citas_futuras = total_citas - citas_pasadas
    print(f"Citas totales: {total_citas} (reales: {citas_reales}, sintéticas: {total_citas - citas_reales})")
    print(f"Pasadas (con resultado decidido): {citas_pasadas} · Futuras (aún abiertas): {citas_futuras}")

    # --- 2) Extracción principal: solo citas PASADAS (resultado ya decidido) ---
    data = q("""
        SELECT
            c.id AS cita_id,
            c.usuario_id,
            c.fecha,
            c.created_at AS created_at,
            c.hora,
            c.metodo_pago,
            c.estado,
            s.id AS servicio_id,
            s.nombre AS servicio_nombre,
            cs.nombre AS servicio_categoria,
            s.precio AS servicio_precio,
            s.duracion AS servicio_duracion,
            u.fecha_registro AS cliente_fecha_registro
        FROM agenda.tblcitas c
        JOIN catalogos.tblservicios s ON s.id = c.servicio_id
        LEFT JOIN catalogos.tblcategorias_servicios cs ON cs.id = s.categoria_id
        LEFT JOIN seguridad.tblusuarios u ON u.id = c.usuario_id
        WHERE c.fecha < NOW()
        ORDER BY c.fecha ASC
    """)
    encabezados = [
        "cita_id", "usuario_id", "fecha", "created_at", "hora", "metodo_pago", "estado",
        "servicio_id", "servicio_nombre", "servicio_categoria", "servicio_precio",
        "servicio_duracion", "cliente_fecha_registro",
    ]
    ruta_dataset = os.path.join(CARPETA_SALIDA, "dataset_citas.csv")
    escribir_csv(ruta_dataset, encabezados, data)
    print(f"Dataset extraído: {len(data)} citas resueltas -> {ruta_dataset}")

    # --- 3) Catálogo de servicios (para interpretar resultados sin volver a la BD) ---
    catalogo = q("""
        SELECT s.id, s.nombre, cs.nombre AS categoria, s.precio, s.duracion
        FROM catalogos.tblservicios s
        LEFT JOIN catalogos.tblcategorias_servicios cs ON cs.id = s.categoria_id
        WHERE s.activo = true
    """)
    ruta_catalogo = os.path.join(CARPETA_SALIDA, "catalogo_servicios.csv")
    escribir_csv(ruta_catalogo, ["id", "nombre", "categoria", "precio", "duracion"], catalogo)
    print(f"Catálogo de servicios: {len(catalogo)} activos -> {ruta_catalogo}")

    # --- 4) Balance de clases y resumen ---
    canceladas = sum(1 for fila in data if fila[6] == "CANCELADA")
    resumen = {
        "generado_en": datetime.now().isoformat(timespec="seconds"),
        "total_citas_bd": total_citas,
        "citas_reales": citas_reales,
        "citas_sinteticas": total_citas - citas_reales,
        "citas_pasadas_resueltas": citas_pasadas,
        "citas_futuras_abiertas": citas_futuras,
        "renglones_dataset_citas": len(data),
        "canceladas": canceladas,
        "no_canceladas": len(data) - canceladas,
        "proporcion_cancelada_pct": round(100 * canceladas / len(data), 2) if data else 0,
    }
    ruta_resumen = os.path.join(CARPETA_SALIDA, "resumen_extraccion_citas.json")
    with open(ruta_resumen, "w", encoding="utf-8") as f:
        json.dump(resumen, f, ensure_ascii=False, indent=2, default=str)
    print(f"Resumen guardado -> {ruta_resumen}")
    print(f"Balance de clases: {canceladas} canceladas / {len(data) - canceladas} no canceladas "
          f"({resumen['proporcion_cancelada_pct']}% cancelación)")

    conn.close()
    print("\nListo. Los archivos ya quedaron en entrega/05_Datasets/.")


if __name__ == "__main__":
    main()

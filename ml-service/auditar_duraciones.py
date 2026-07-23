# -*- coding: utf-8 -*-
"""
Audita el campo tblservicios.duracion de TODO el catálogo, para detectar
servicios cuyo texto de duración esté mal capturado (p. ej. "1 min" en un
servicio que en realidad dura ~60 min).

Solo LEE, no modifica nada. Correr desde ml-service/ (mismo entorno donde
ya corre uvicorn, con psycopg y el .env accesibles):

    python auditar_duraciones.py
"""
import sys, os, re

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "ml-service"))
import psycopg
from db import obtener_url


def a_minutos(txt):
    if not txt:
        return None
    texto = str(txt).strip().lower()
    m = re.search(r"\d+(?:\.\d+)?", texto)
    if not m:
        return None
    numero = float(m.group())
    if "min" in texto:
        return int(round(numero))
    if "hora" in texto or re.search(r"\d\s*h\b", texto):
        return int(round(numero * 60))
    if numero < 10:
        return int(round(numero * 60))
    return int(round(numero))


conn = psycopg.connect(obtener_url(), connect_timeout=15)
cur = conn.cursor()
cur.execute("""
    SELECT s.id, s.nombre, cs.nombre AS categoria, s.duracion
    FROM catalogos.tblservicios s
    LEFT JOIN catalogos.tblcategorias_servicios cs ON cs.id = s.categoria_id
    WHERE s.activo = true
    ORDER BY s.nombre
""")
filas = cur.fetchall()
cur.close()
conn.close()

print(f"{'id':>4}  {'duracion_min':>12}  {'texto original':<20}  {'nombre':<40} categoria")
print("-" * 100)
sospechosos = []
for sid, nombre, categoria, duracion in filas:
    minutos = a_minutos(duracion)
    marca = ""
    if minutos is not None and minutos <= 15 and "min" in str(duracion).lower():
        marca = "  <-- revisar (¿de verdad dura eso?)"
        sospechosos.append((sid, nombre, duracion, minutos))
    print(f"{sid:>4}  {str(minutos):>12}  {str(duracion):<20}  {nombre:<40} {categoria or ''}{marca}")

print(f"\nTotal servicios: {len(filas)} | Sospechosos (<=15 min con unidad 'min' explícita): {len(sospechosos)}")
for sid, nombre, duracion, minutos in sospechosos:
    print(f"  id={sid} | {nombre} | texto='{duracion}' | parseado={minutos} min")
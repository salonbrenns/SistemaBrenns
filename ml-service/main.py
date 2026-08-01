# -*- coding: utf-8 -*-
"""
Microservicio del recomendador de productos (Apriori).
Se entrena al arrancar leyendo la BD y expone las recomendaciones vía HTTP
para que el sistema web (Next.js) las consuma.

Ejecutar:  uvicorn main:app --port 8000
"""
import os
import pickle
import pandas as pd
from datetime import datetime

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from apriori import Transaccion, BaseTransaccional, generar_reglas
from db import cargar_canastas
from citas import calcular_features_cita, calcular_features_citas_lote, nivel_riesgo

# Modelo entrenado por el notebook (desarrollo_recomendador.ipynb, fase 6)
RUTA_MODELO = os.path.join(os.path.dirname(__file__), "reglas_apriori.pkl")
# Modelo entrenado por el notebook (desarrollo_citas.ipynb, Solución 2)
RUTA_MODELO_CITAS = os.path.join(os.path.dirname(__file__), "modelo_citas.pkl")
modelo_citas = None  # se carga en el startup si el archivo existe

# Parámetros del modelo (ajustables)
MIN_SOPORTE_ABS = 3     # el par debe aparecer en al menos 3 canastas
MIN_CONFIANZA = 0.2     # 20% mínimo de confianza
MIN_LIFT = 1.0          # solo asociaciones reales (lift > 1)

app = FastAPI(title="Recomendador Brenn's Beauty", version="1.0")

# estado en memoria
estado = {
    "reglas": {},
    "nombres": {},
    "num_transacciones": 0,
    "num_reglas": 0,
    "entrenado_en": None,
}


def entrenar():
    canastas, nombres = cargar_canastas(incluir_favoritos=True)
    base = BaseTransaccional()
    for tid, items in canastas:
        base.agregar_transaccion(Transaccion(tid, items))

    reglas = generar_reglas(
        base,
        min_soporte_abs=MIN_SOPORTE_ABS,
        min_confianza=MIN_CONFIANZA,
        min_lift=MIN_LIFT,
    )

    estado["reglas"] = reglas
    estado["nombres"] = nombres
    estado["num_transacciones"] = base.total()
    estado["num_reglas"] = sum(len(v) for v in reglas.values())
    estado["entrenado_en"] = datetime.now().isoformat(timespec="seconds")

    # guardar el modelo actualizado (mismo formato que produce el notebook)
    with open(RUTA_MODELO, "wb") as f:
        pickle.dump(estado, f)
    return estado["num_reglas"]


def cargar_modelo():
    """Carga el modelo entrenado (reglas_apriori.pkl) generado por el notebook."""
    with open(RUTA_MODELO, "rb") as f:
        modelo = pickle.load(f)
    estado.update(modelo)


@app.on_event("startup")
def al_arrancar():
    # 1) preferir el modelo entrenado offline (.pkl del notebook) — arranque rápido
    if os.path.exists(RUTA_MODELO):
        try:
            cargar_modelo()
            print(f"[recomendador] modelo cargado de reglas_apriori.pkl: "
                  f"{estado['num_transacciones']} transacciones, {estado['num_reglas']} reglas "
                  f"(entrenado {estado['entrenado_en']})")
        except Exception as e:
            print(f"[recomendador] no se pudo cargar el .pkl ({e}); se entrena desde la BD")
            try:
                n = entrenar()
                print(f"[recomendador] entrenado desde BD: {estado['num_transacciones']} transacciones, {n} reglas")
            except Exception as e2:  # el servicio arranca aunque falle la BD; se reintenta con POST /entrenar
                print(f"[recomendador] ERROR al entrenar: {e2}")
    else:
        try:
            n = entrenar()
            print(f"[recomendador] entrenado desde BD: {estado['num_transacciones']} transacciones, {n} reglas")
        except Exception as e:
            print(f"[recomendador] ERROR al entrenar: {e}")

    # Solución 2: modelo de riesgo de cancelación de citas (solo se carga si existe)
    global modelo_citas
    if os.path.exists(RUTA_MODELO_CITAS):
        try:
            with open(RUTA_MODELO_CITAS, "rb") as f:
                modelo_citas = pickle.load(f)
            print(f"[citas] modelo cargado de modelo_citas.pkl: {modelo_citas['modelo_nombre']} "
                  f"(entrenado {modelo_citas['entrenado_en']})")
        except Exception as e:
            print(f"[citas] no se pudo cargar modelo_citas.pkl: {e}")
    else:
        print("[citas] modelo_citas.pkl no encontrado — /riesgo-cancelacion/{cita_id} no estará disponible")


@app.get("/salud")
def salud():
    return {
        "ok": True,
        "num_transacciones": estado["num_transacciones"],
        "num_reglas": estado["num_reglas"],
        "entrenado_en": estado["entrenado_en"],
    }


@app.post("/entrenar")
def reentrenar():
    try:
        n = entrenar()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"ok": True, "num_reglas": n, "num_transacciones": estado["num_transacciones"]}


@app.get("/recomendaciones/{producto_id}")
def recomendaciones(producto_id: int, n: int = 4):
    """Top-N de productos recomendados para un producto (reglas producto -> Y)."""
    reglas = estado["reglas"].get(producto_id, [])
    resultado = [
        {
            "producto_id": r["producto_id"],
            "nombre": estado["nombres"].get(r["producto_id"], ""),
            "soporte": r["soporte"],
            "confianza": r["confianza"],
            "lift": r["lift"],
        }
        for r in reglas[:n]
    ]
    return {
        "producto_id": producto_id,
        "fuente": "apriori",
        "recomendaciones": resultado,
    }


@app.get("/reglas")
def top_reglas(limit: int = 20):
    """Las mejores reglas globales (útil para demostrar el modelo en la expo)."""
    planas = []
    for ante, lista in estado["reglas"].items():
        for r in lista:
            planas.append({
                "antecedente": estado["nombres"].get(ante, str(ante)),
                "consecuente": estado["nombres"].get(r["producto_id"], str(r["producto_id"])),
                "soporte": r["soporte"],
                "confianza": r["confianza"],
                "lift": r["lift"],
            })
    planas.sort(key=lambda r: (r["lift"], r["confianza"]), reverse=True)
    return {"total": len(planas), "reglas": planas[:limit]}


@app.get("/riesgo-cancelacion/{cita_id}")
def riesgo_cancelacion(cita_id: int):
    """Riesgo de cancelación de una cita futura (Solución 2)."""
    if modelo_citas is None:
        raise HTTPException(status_code=503, detail="Modelo de citas no disponible")

    try:
        info, features = calcular_features_cita(
            cita_id,
            tasa_global=modelo_citas["tasa_global_cancelacion"],
            duracion_default_min=60,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al calcular variables: {e}")

    if info is None:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    if features is None:
        # cita ya resuelta (CANCELADA / otro estado) — no aplica predicción
        return {"cita_id": cita_id, "aplica": False, "motivo": f"estado={info['estado']}"}

    columnas = modelo_citas["columnas_numericas"] + modelo_citas["columnas_categoricas"]
    fila = pd.DataFrame([{c: features[c] for c in columnas}])
    probabilidad = float(modelo_citas["pipeline"].predict_proba(fila)[0, 1])

    return {
        "cita_id": cita_id,
        "aplica": True,
        "probabilidad": round(probabilidad, 4),
        "nivel": nivel_riesgo(probabilidad),
    }


class LoteCitasRequest(BaseModel):
    cita_ids: list[int]


@app.post("/riesgo-cancelacion/lote")
def riesgo_cancelacion_lote(body: LoteCitasRequest):
    """
    Riesgo de cancelación de varias citas a la vez (usado por el panel admin
    de Citas, para no llamar /riesgo-cancelacion/{id} una por una).
    """
    if modelo_citas is None:
        raise HTTPException(status_code=503, detail="Modelo de citas no disponible")

    if not body.cita_ids:
        return {"resultados": []}

    try:
        filas = calcular_features_citas_lote(
            body.cita_ids,
            tasa_global=modelo_citas["tasa_global_cancelacion"],
            duracion_default_min=60,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al calcular variables: {e}")

    columnas = modelo_citas["columnas_numericas"] + modelo_citas["columnas_categoricas"]
    aplican = [f for f in filas if f["features"] is not None]

    probas = []
    if aplican:
        df = pd.DataFrame([{c: f["features"][c] for c in columnas} for f in aplican])
        probas = modelo_citas["pipeline"].predict_proba(df)[:, 1]

    resultados = []
    for f, p in zip(aplican, probas):
        resultados.append({
            "cita_id": f["cita_id"],
            "aplica": True,
            "probabilidad": round(float(p), 4),
            "nivel": nivel_riesgo(float(p)),
        })
    for f in filas:
        if f["features"] is None:
            resultados.append({"cita_id": f["cita_id"], "aplica": False, "motivo": f"estado={f['estado']}"})

    return {"resultados": resultados}

# -*- coding: utf-8 -*-
"""
Implementación del algoritmo Apriori para el recomendador de productos.
Sigue la estructura vista en clase: Transaccion + BaseTransaccional +
métricas (soporte, confianza, lift) + generación de reglas X -> Y.
"""
from itertools import combinations


class Transaccion:
    """Una transacción = la canasta de productos de un pedido."""

    def __init__(self, id_transaccion, items):
        self.id = id_transaccion
        # items: conjunto de producto_id (sin repetidos)
        self.items = frozenset(items)

    def mostrar(self):
        return f"T{self.id}: {sorted(self.items)}"


class BaseTransaccional:
    """Agrupa múltiples transacciones y las organiza para su análisis."""

    def __init__(self):
        self.transacciones = []

    def agregar_transaccion(self, transaccion):
        self.transacciones.append(transaccion)

    def obtener_lista_items(self):
        return [t.items for t in self.transacciones]

    def total(self):
        return len(self.transacciones)

    def mostrar_transacciones(self):
        for t in self.transacciones:
            print(t.mostrar())


# ---------------- Métricas ----------------

def calcular_soporte(base, itemset):
    """Soporte = transacciones que contienen el itemset / total de transacciones."""
    if base.total() == 0:
        return 0.0
    itemset = frozenset(itemset)
    contiene = sum(1 for items in base.obtener_lista_items() if itemset <= items)
    return contiene / base.total()


def calcular_confianza(base, antecedente, consecuente):
    """Confianza(X -> Y) = soporte(X U Y) / soporte(X)."""
    soporte_union = calcular_soporte(base, set(antecedente) | set(consecuente))
    soporte_antecedente = calcular_soporte(base, antecedente)
    if soporte_antecedente == 0:
        return 0.0
    return soporte_union / soporte_antecedente


def calcular_lift(base, antecedente, consecuente):
    """Lift(X -> Y) = confianza(X -> Y) / soporte(Y). >1 = asociación real."""
    confianza = calcular_confianza(base, antecedente, consecuente)
    soporte_consecuente = calcular_soporte(base, consecuente)
    if soporte_consecuente == 0:
        return 0.0
    return confianza / soporte_consecuente


# ---------------- Algoritmo Apriori ----------------

def itemsets_frecuentes(base, min_soporte_abs=3, max_tamano=2):
    """
    Fase 1 de Apriori: encuentra los conjuntos de items frecuentes.
    Usa conteos absolutos (número de transacciones) como umbral.
    Aplica la propiedad Apriori: si un conjunto es frecuente,
    todos sus subconjuntos también lo son (poda de candidatos).
    """
    listas = base.obtener_lista_items()
    n = base.total()
    if n == 0:
        return {}

    # k = 1: contar items individuales
    conteo1 = {}
    for items in listas:
        for it in items:
            conteo1[it] = conteo1.get(it, 0) + 1
    frecuentes = {
        frozenset([it]): c for it, c in conteo1.items() if c >= min_soporte_abs
    }
    resultado = dict(frecuentes)

    # k = 2..max: combinar solo items que ya son frecuentes (poda Apriori)
    nivel_previo = list(frecuentes.keys())
    for k in range(2, max_tamano + 1):
        candidatos = set()
        items_frecuentes = set()
        for s in nivel_previo:
            items_frecuentes |= s
        for combo in combinations(sorted(items_frecuentes), k):
            candidatos.add(frozenset(combo))

        conteo_k = {}
        for items in listas:
            for cand in candidatos:
                if cand <= items:
                    conteo_k[cand] = conteo_k.get(cand, 0) + 1

        nivel = {c: v for c, v in conteo_k.items() if v >= min_soporte_abs}
        if not nivel:
            break
        resultado.update(nivel)
        nivel_previo = list(nivel.keys())

    return resultado


def generar_reglas(base, min_soporte_abs=3, min_confianza=0.2, min_lift=1.0):
    """
    Fase 2 de Apriori: a partir de los itemsets frecuentes genera reglas
    X -> Y (con antecedente y consecuente de 1 item) y las filtra por
    confianza y lift mínimos.
    Devuelve: { producto_id: [ {producto_id, soporte, confianza, lift}, ... ] }
    """
    frecuentes = itemsets_frecuentes(base, min_soporte_abs=min_soporte_abs, max_tamano=2)
    n = base.total()
    reglas = {}

    for itemset, conteo in frecuentes.items():
        if len(itemset) != 2:
            continue
        a, b = tuple(itemset)
        soporte_par = conteo / n
        for ante, cons in ((a, b), (b, a)):
            confianza = calcular_confianza(base, [ante], [cons])
            lift = calcular_lift(base, [ante], [cons])
            if confianza >= min_confianza and lift >= min_lift:
                reglas.setdefault(ante, []).append({
                    "producto_id": cons,
                    "soporte": round(soporte_par, 4),
                    "confianza": round(confianza, 4),
                    "lift": round(lift, 4),
                })

    # ordenar las recomendaciones de cada producto por lift y confianza
    for ante in reglas:
        reglas[ante].sort(key=lambda r: (r["lift"], r["confianza"]), reverse=True)

    return reglas

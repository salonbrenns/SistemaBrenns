# -*- coding: utf-8 -*-
"""
Calcula el riesgo de cancelación de una cita YA agendada (futura, en estado
PENDIENTE o CONFIRMADA), reconstruyendo las mismas variables que se usaron
para entrenar el modelo en desarrollo_citas.ipynb (sección 3 de la libreta).

A diferencia del recomendador (Solución 1), aquí SÍ hace falta consultar la
BD en el momento de predecir: la tasa histórica de cancelación del cliente y
su antigüedad dependen de la fecha de la cita que se está evaluando, no son
un valor fijo precalculado.
"""
import re
from datetime import datetime

import psycopg

from db import obtener_url

DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

# Rango máximo de anticipación visto en el entrenamiento (ver libreta, sección 3.3:
# el seed genera reservas de 0-35 días). Las citas agendadas con más anticipación
# se recortan a este valor para no extrapolar la regresión logística fuera del
# rango aprendido (sin el recorte, una cita a 60+ días recibe probabilidades
# extremas ~90%+ solo por extrapolación lineal del logit).
ANTICIPACION_MAX_ENTRENAMIENTO = 35


def _a_minutos(txt):
    """
    Convierte el texto libre de tblservicios.duracion a minutos.

    Formatos reales encontrados en el catálogo (auditoría manual, ver
    auditar_duraciones.py): "1h", "2 hrs", "2hrs", "1h 30min", "2h 30min",
    "1h 15min", además de "60 min", "1 hora", "2 horas", "1.5 horas" y
    números sueltos sin unidad ("1", "2", "60").

    Versión anterior: tomaba solo el PRIMER número del texto y decidía la
    unidad con un solo `if`. Con "1h 30min" eso rompía: el primer número es
    "1" (la parte de horas), pero como el texto contiene "min" en algún
    lado ("30min"), la función asumía "ya está en minutos" y devolvía 1 en
    vez de 90 — Laminado, Pedicura spa/macro, Softgel, Polygel quedaron con
    duracion_min=1 o 2 por este motivo, no por el bug de horas/minutos que
    se corrigió antes.

    Ahora se buscan por separado un componente de horas y uno de minutos
    (pueden coexistir en el mismo texto) y se suman: horas*60 + minutos.
    """
    if not txt:
        return None
    texto = str(txt).strip().lower()

    total = 0.0
    encontrado = False

    m_horas = re.search(r'(\d+(?:\.\d+)?)\s*(?:hrs?|h\b|horas?)', texto)
    if m_horas:
        total += float(m_horas.group(1)) * 60
        encontrado = True

    m_min = re.search(r'(\d+(?:\.\d+)?)\s*min', texto)
    if m_min:
        total += float(m_min.group(1))
        encontrado = True

    if encontrado:
        return int(round(total))

    # Número suelto sin ninguna unidad reconocible: se infiere por magnitud
    # (servicios de este catálogo duran entre ~15 y ~240 min; <10 sin
    # unidad es casi seguro una hora mal capturada). Heurística, no certeza
    # absoluta — documentar como supuesto/limitación en el reporte.
    m = re.search(r'\d+(?:\.\d+)?', texto)
    if not m:
        return None
    numero = float(m.group())
    if numero < 10:
        return int(round(numero * 60))
    return int(round(numero))


def calcular_features_cita(cita_id: int, tasa_global: float, duracion_default_min: float,
                           anticipacion_default_dias: float = 18):
    """
    Devuelve (info_basica, features) o (None, None) si la cita no existe o ya
    no aplica para predicción (por ejemplo, ya fue cancelada o resuelta).
    Los valores por defecto (duración, anticipación) provienen del artefacto
    entrenado, para imputar datos faltantes igual que la libreta.
    """
    conn = psycopg.connect(obtener_url(), connect_timeout=15)
    cur = conn.cursor()

    cur.execute("""
        SELECT c.id, c.usuario_id, c.fecha, c.created_at, c.hora, c.metodo_pago, c.estado,
               s.nombre AS servicio_nombre, s.precio, s.duracion, cs.nombre AS categoria,
               u.fecha_registro
        FROM agenda.tblcitas c
        JOIN catalogos.tblservicios s ON s.id = c.servicio_id
        LEFT JOIN catalogos.tblcategorias_servicios cs ON cs.id = s.categoria_id
        LEFT JOIN seguridad.tblusuarios u ON u.id = c.usuario_id
        WHERE c.id = %s
    """, (cita_id,))
    fila = cur.fetchone()
    if fila is None:
        conn.close()
        return None, None

    (cid, usuario_id, fecha, created_at, hora, metodo_pago, estado,
     servicio_nombre, precio, duracion, categoria, fecha_registro) = fila

    if estado not in ('PENDIENTE', 'CONFIRMADA'):
        conn.close()
        return {'cita_id': cid, 'estado': estado}, None  # ya resuelta: no aplica predicción

    # Historial del cliente: solo citas ANTERIORES a esta (mismo criterio temporal
    # que la libreta), para no fugar información de citas futuras del mismo cliente.
    citas_previas = 0
    tasa_previa = tasa_global
    if usuario_id is not None:
        cur.execute("""
            SELECT COUNT(*) FILTER (WHERE estado = 'CANCELADA') AS canceladas, COUNT(*) AS total
            FROM agenda.tblcitas
            WHERE usuario_id = %s AND fecha < %s
        """, (usuario_id, fecha))
        canceladas, total = cur.fetchone()
        citas_previas = total or 0
        if citas_previas > 0:
            tasa_previa = canceladas / citas_previas

    conn.close()

    # Imputación idéntica a la libreta: si la cita no tiene created_at, se usa
    # la mediana de entrenamiento guardada en el artefacto (nunca None/NaN,
    # que rompería el StandardScaler del pipeline). El valor se recorta al
    # rango visto en entrenamiento para no extrapolar (ver constante arriba).
    anticipacion_dias = (min(max((fecha - created_at).days, 0), ANTICIPACION_MAX_ENTRENAMIENTO)
                         if created_at else anticipacion_default_dias)
    antiguedad_dias = max((fecha - fecha_registro).days, 0) if fecha_registro else 0

    features = {
        'mes': fecha.month,
        'dia_mes': fecha.day,
        'hora_num': int(str(hora)[:2]),
        'anticipacion_dias': anticipacion_dias,
        'antiguedad_dias': antiguedad_dias,
        'tasa_cancelacion_previa': tasa_previa,
        'citas_previas_cliente': citas_previas,
        'servicio_precio': float(precio),
        'duracion_min': _a_minutos(duracion) or duracion_default_min,
        'dia_semana': DIAS[fecha.weekday()],
        'metodo_pago': metodo_pago or 'SIN_ESPECIFICAR',
        'servicio_categoria': categoria or 'Sin categoría',
        'servicio_nombre': servicio_nombre or 'Sin nombre',
        'cliente_registrado': usuario_id is not None,
    }
    info_basica = {'cita_id': cid, 'estado': estado, 'fecha': fecha.isoformat()}
    return info_basica, features


def calcular_features_citas_lote(cita_ids: list[int], tasa_global: float, duracion_default_min: float,
                                 anticipacion_default_dias: float = 18):
    """
    Versión en lote de calcular_features_cita: UNA sola conexión/consulta para
    varias citas a la vez, en lugar de abrir una conexión por cita. La usa el
    panel admin de Citas, que necesita el riesgo de muchas citas futuras al
    mismo tiempo (una llamada por fila sería demasiado lento con cientos de
    citas en la lista).

    Devuelve una lista de dicts: {'cita_id', 'estado', 'features' (o None si
    la cita ya no aplica, por ejemplo CANCELADA/COMPLETADA)}.
    """
    if not cita_ids:
        return []

    conn = psycopg.connect(obtener_url(), connect_timeout=15)
    cur = conn.cursor()

    # Mismo criterio temporal que calcular_features_cita: el historial de cada
    # cliente solo cuenta citas ANTERIORES a la fecha de la cita evaluada, para
    # no fugar información de citas futuras del mismo cliente.
    cur.execute("""
        SELECT c.id, c.usuario_id, c.fecha, c.created_at, c.hora, c.metodo_pago, c.estado,
               s.nombre AS servicio_nombre, s.precio, s.duracion, cs.nombre AS categoria,
               u.fecha_registro,
               (SELECT COUNT(*) FROM agenda.tblcitas c2
                 WHERE c2.usuario_id = c.usuario_id AND c2.fecha < c.fecha) AS total_previas,
               (SELECT COUNT(*) FROM agenda.tblcitas c2
                 WHERE c2.usuario_id = c.usuario_id AND c2.fecha < c.fecha
                   AND c2.estado = 'CANCELADA') AS canceladas_previas
        FROM agenda.tblcitas c
        JOIN catalogos.tblservicios s ON s.id = c.servicio_id
        LEFT JOIN catalogos.tblcategorias_servicios cs ON cs.id = s.categoria_id
        LEFT JOIN seguridad.tblusuarios u ON u.id = c.usuario_id
        WHERE c.id = ANY(%s)
    """, (list(cita_ids),))
    filas = cur.fetchall()
    conn.close()

    resultados = []
    for (cid, usuario_id, fecha, created_at, hora, metodo_pago, estado,
         servicio_nombre, precio, duracion, categoria, fecha_registro,
         total_previas, canceladas_previas) in filas:

        if estado not in ('PENDIENTE', 'CONFIRMADA'):
            resultados.append({'cita_id': cid, 'estado': estado, 'features': None})
            continue

        citas_previas = total_previas or 0
        tasa_previa = (canceladas_previas / citas_previas) if citas_previas > 0 else tasa_global

        anticipacion_dias = (min(max((fecha - created_at).days, 0), ANTICIPACION_MAX_ENTRENAMIENTO)
                             if created_at else anticipacion_default_dias)
        antiguedad_dias = max((fecha - fecha_registro).days, 0) if fecha_registro else 0

        features = {
            'mes': fecha.month,
            'dia_mes': fecha.day,
            'hora_num': int(str(hora)[:2]),
            'anticipacion_dias': anticipacion_dias,
            'antiguedad_dias': antiguedad_dias,
            'tasa_cancelacion_previa': tasa_previa,
            'citas_previas_cliente': citas_previas,
            'servicio_precio': float(precio),
            'duracion_min': _a_minutos(duracion) or duracion_default_min,
            'dia_semana': DIAS[fecha.weekday()],
            'metodo_pago': metodo_pago or 'SIN_ESPECIFICAR',
            'servicio_categoria': categoria or 'Sin categoría',
            'servicio_nombre': servicio_nombre or 'Sin nombre',
            'cliente_registrado': usuario_id is not None,
        }
        resultados.append({'cita_id': cid, 'estado': estado, 'features': features})

    return resultados


def nivel_riesgo(probabilidad: float) -> str:
    if probabilidad >= 0.5:
        return 'ALTO'
    if probabilidad >= 0.3:
        return 'MEDIO'
    return 'BAJO'

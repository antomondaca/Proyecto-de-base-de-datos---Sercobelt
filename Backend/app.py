# Flask = capa intermedia. NO contiene SQL: solo invoca procedimientos almacenados de Oracle (callproc).
import os
import re
from datetime import datetime, date

import oracledb
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_USER = os.getenv("ORACLE_USER", "sercobelt")
DB_PASS = os.getenv("ORACLE_PASS", "sercobelt123")
DB_DSN = os.getenv("ORACLE_DSN", "localhost:1521/XEPDB1")


def get_connection():
    return oracledb.connect(user=DB_USER, password=DB_PASS, dsn=DB_DSN)


# Nombre usado por React -> procedimiento Oracle que devuelve un SYS_REFCURSOR
LISTAS = {
    "ROL": "LISTAR_ROL",
    "PERSONAL": "LISTAR_PERSONAL",
    "CLIENTE": "LISTAR_CLIENTE",
    "PROVEEDOR": "LISTAR_PROVEEDOR",
    "VEHICULO": "LISTAR_VEHICULO",
    "TIPO_TRABAJO": "LISTAR_TIPO_TRABAJO",
    "CATEGORIA_ITEM": "LISTAR_CATEGORIA_ITEM",
    "FAENA": "LISTAR_FAENA",
    "ITEM": "LISTAR_ITEM",
    "UNIDAD_EQUIPO": "LISTAR_UNIDAD_EQUIPO",
    "USUARIO": "LISTAR_USUARIO",
    "PLANTILLA_ITEM": "LISTAR_PLANTILLA_ITEM",
    "ORDEN_TRABAJO": "LISTAR_ORDEN_TRABAJO",
    "CHECKLIST_DETALLE": "LISTAR_DETALLE_CHECKLIST",
    "MANTENCION": "LISTAR_MANTENCION",
    "REQ_COMPRA": "LISTAR_REQ_COMPRA",
    "ALERTA": "LISTAR_ALERTAS",
    "BITACORA": "LISTAR_BITACORAS",
    "REPORTE_FUERA_BODEGA": "REPORTE_FUERA_BODEGA",
    "REPORTE_PENDIENTES_FALTANTES": "REPORTE_PENDIENTES_FALTANTES",
    "REPORTE_CONSUMO_MENSUAL": "REPORTE_CONSUMO_MENSUAL",
}

# Procedimientos permitidos (mantenedores + gestores)
_TABLAS = ["ROL", "PERSONAL", "CLIENTE", "PROVEEDOR", "VEHICULO", "TIPO_TRABAJO",
           "CATEGORIA_ITEM", "FAENA", "ITEM", "UNIDAD_EQUIPO", "USUARIO", "PLANTILLA_ITEM"]
PROCS = {f"{p}_{t}" for p in ("INSERTAR", "ACTUALIZAR", "ELIMINAR") for t in _TABLAS} | {
    "CREAR_OT_CON_CHECKLIST", "VERIFICAR_DESPACHAR_ITEM", "CONFIRMAR_SALIDA_OT",
    "REGISTRAR_RETORNO_ITEM", "CERRAR_ORDEN_TRABAJO", "REGISTRAR_MANTENCION",
    "GENERAR_REQ_COMPRA", "ACTUALIZAR_ESTADO_COMPRA", "ATENDER_ALERTA",
}

_FECHA = re.compile(r"^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$")


def _entrada(v):
    """Texto 'YYYY-MM-DD' -> datetime para parametros DATE de Oracle."""
    if isinstance(v, str) and _FECHA.match(v):
        return datetime.fromisoformat(v)
    return v


def _salida(v):
    if isinstance(v, datetime):
        return v.strftime("%Y-%m-%d") if (v.hour, v.minute, v.second) == (0, 0, 0) else v.strftime("%Y-%m-%dT%H:%M:%S")
    if isinstance(v, date):
        return v.strftime("%Y-%m-%d")
    return v


def cursor_a_dicts(rc):
    cols = [c[0] for c in rc.description]  # se mantienen en MAYUSCULAS, igual que en React
    return [{c: _salida(v) for c, v in zip(cols, fila)} for fila in rc.fetchall()]


def mensaje(e):
    txt = str(e.args[0].message) if e.args and hasattr(e.args[0], "message") else str(e)
    return txt.split("\n")[0]


def llamar_cursor(nombre, args=None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            out = cur.var(oracledb.CURSOR)
            cur.callproc(nombre, (args or []) + [out])
            return cursor_a_dicts(out.getvalue())


@app.route("/api/login", methods=["POST"])
def login():
    d = request.json or {}
    try:
        filas = llamar_cursor("SP_LOGIN", [d.get("username"), d.get("password_hash")])
        if not filas:
            return jsonify({"error": "Credenciales inválidas o usuario inactivo"}), 401
        return jsonify(filas[0]), 200
    except oracledb.Error as e:
        return jsonify({"error": mensaje(e)}), 500


@app.route("/api/list/<nombre>", methods=["GET"])
def listar(nombre):
    if nombre not in LISTAS:
        return jsonify({"error": "Lista no permitida"}), 404
    try:
        return jsonify(llamar_cursor(LISTAS[nombre])), 200
    except oracledb.Error as e:
        return jsonify({"error": mensaje(e)}), 500


@app.route("/api/proc/<nombre>", methods=["POST"])
def ejecutar(nombre):
    if nombre not in PROCS:
        return jsonify({"error": "Procedimiento no permitido"}), 404
    args = [_entrada(a) for a in (request.json or {}).get("args", [])]
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.callproc(nombre, args)
                conn.commit()
        return jsonify({"ok": True}), 200
    except oracledb.Error as e:
        # Errores de triggers/restricciones (ORA-20001, ORA-20002, ORA-02292...)
        return jsonify({"error": mensaje(e)}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
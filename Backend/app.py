from flask import Flask, request, jsonify
from flask_cors import CORS
import oracledb
import os

app = Flask(__name__)
# Habilita CORS para que React (puerto 5173) pueda consultar a Flask (puerto 5000)
CORS(app)

# Configuración de conexión a Oracle (ajusta según tu contenedor o instancia)
DB_USER = os.getenv("ORACLE_USER", "sercobelt")
DB_PASS = os.getenv("ORACLE_PASS", "sercobelt123")
DB_DSN  = os.getenv("ORACLE_DSN", "localhost:1521/XEPDB1")

def get_connection():
    return oracledb.connect(user=DB_USER, password=DB_PASS, dsn=DB_DSN)

def refcursor_to_dicts(ref_cursor):
    """Convierte un SYS_REFCURSOR de Oracle en una lista de diccionarios JSON."""
    columns = [col[0].lower() for col in ref_cursor.description]
    return [dict(zip(columns, row)) for row in ref_cursor.fetchall()]

# ==============================================================================
# 1. CONTROL DE ACCESO (Llama a función/PA de validación en Oracle)
# ==============================================================================
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                out_cursor = cur.var(oracledb.CURSOR)
                # Invoca PA_VALIDAR_USUARIO(p_username, p_password, p_resultado)
                cur.callproc("PA_VALIDAR_USUARIO", [
                    data.get("username"),
                    data.get("password"),
                    out_cursor
                ])
                usuario = refcursor_to_dicts(out_cursor.getvalue())
                if not usuario:
                    return jsonify({"error": "Credenciales inválidas o usuario inactivo"}), 401
                return jsonify(usuario[0]), 200
    except oracledb.Error as e:
        return jsonify({"error": str(e)}), 500

# ==============================================================================
# 2. EJEMPLO DE MANTENEDOR CRUD (UNIDADES_EQUIPOS)
# ==============================================================================
@app.route("/api/unidades-equipos", methods=["GET"])
def listar_unidades():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                out_cursor = cur.var(oracledb.CURSOR)
                cur.callproc("PA_LISTAR_UNIDADES_EQUIPOS", [out_cursor])
                return jsonify(refcursor_to_dicts(out_cursor.getvalue())), 200
    except oracledb.Error as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/unidades-equipos", methods=["POST"])
def crear_unidad():
    data = request.json
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.callproc("PA_INSERTAR_UNIDAD_EQUIPO", [
                    data["id_item"],
                    data["codigo"],
                    data.get("nro_serie"),
                    data["estado"],
                    data.get("fecha_proxima_calibracion"),
                    data["id_usuario_sesion"] # Para el trigger de BITACORAS
                ])
                conn.commit()
                return jsonify({"mensaje": "Unidad registrada correctamente"}), 201
    except oracledb.Error as e:
        # Captura errores de triggers/restricciones de Oracle (ej. ORA-20001)
        return jsonify({"error": str(e)}), 400

@app.route("/api/unidades-equipos/<int:id_unidad>", methods=["PUT"])
def actualizar_unidad(id_unidad):
    data = request.json
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.callproc("PA_ACTUALIZAR_UNIDAD_EQUIPO", [
                    id_unidad,
                    data["estado"],
                    data.get("fecha_proxima_calibracion"),
                    data["id_usuario_sesion"]
                ])
                conn.commit()
                return jsonify({"mensaje": "Unidad actualizada"}), 200
    except oracledb.Error as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/unidades-equipos/<int:id_unidad>", methods=["DELETE"])
def eliminar_unidad(id_unidad):
    id_usuario = request.args.get("id_usuario", type=int)
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.callproc("PA_ELIMINAR_UNIDAD_EQUIPO", [id_unidad, id_usuario])
                conn.commit()
                return jsonify({"mensaje": "Unidad eliminada"}), 200
    except oracledb.Error as e:
        return jsonify({"error": str(e)}), 400

# ==============================================================================
# 3. EJEMPLO DE GESTOR DE OPERACIÓN (DESPACHO Y RETORNO DE CHECKLIST)
# ==============================================================================
@app.route("/api/gestores/despachar-ot/<int:id_ot>", methods=["POST"])
def despachar_ot(id_ot):
    data = request.json
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Al ejecutar este PA, los triggers de Oracle validan que el equipo
                # esté 'En bodega' y lo cambian automáticamente a 'En terreno'
                cur.callproc("PA_DESPACHAR_ORDEN_TRABAJO", [
                    id_ot,
                    data["id_supervisor"],
                    data["id_usuario_sesion"]
                ])
                conn.commit()
                return jsonify({"mensaje": "OT despachada. Estados actualizados por trigger."}), 200
    except oracledb.Error as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/gestores/registrar-retorno", methods=["POST"])
def registrar_retorno():
    data = request.json
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Si cantidad_retornada < cantidad_despachada, el trigger inserta en ALERTAS
                cur.callproc("PA_REGISTRAR_RETORNO_ITEM", [
                    data["id_detalle"],
                    data["cantidad_retornada"],
                    data.get("observacion", ""),
                    data["id_usuario_sesion"]
                ])
                conn.commit()
                return jsonify({"mensaje": "Retorno registrado y conciliado en Oracle"}), 200
    except oracledb.Error as e:
        return jsonify({"error": str(e)}), 400

# ==============================================================================
# 4. EJEMPLO DE REPORTE ESTRATÉGICO
# ==============================================================================
@app.route("/api/reportes/equipos-terreno", methods=["GET"])
def reporte_equipos_terreno():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                out_cursor = cur.var(oracledb.CURSOR)
                cur.callproc("PA_REPORTE_EQUIPOS_TERRENO", [out_cursor])
                return jsonify(refcursor_to_dicts(out_cursor.getvalue())), 200
    except oracledb.Error as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
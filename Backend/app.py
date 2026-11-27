# Flask: capa de transporte, autenticación y autorización; Oracle conserva los procesos de negocio.
import os
import re
import math
import secrets
import time
from threading import RLock
from datetime import datetime, date

import oracledb
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024
ORIGINS = {x.strip() for x in os.getenv('FRONTEND_ORIGINS', 'http://localhost:8443').split(',') if x.strip()}
if '*' in ORIGINS:
    raise RuntimeError('FRONTEND_ORIGINS no admite comodines.')
CORS(app, resources={r'/api/.*': {'origins': list(ORIGINS)}}, supports_credentials=True, allow_headers=['Content-Type', 'X-CSRF-Token'])
COOKIE = 'sercobelt_sid'
COOKIE_SECURE = os.getenv('COOKIE_SECURE', '0') == '1'
SESSION_SECONDS = 8 * 60 * 60
# Sesiones revocables en memoria: una instancia local de Flask. Reiniciar invalida las sesiones.
SESSIONS = {}
SESSION_LOCK = RLock()
HASH_METHOD = 'pbkdf2:sha256:600000'


def get_connection():
    return oracledb.connect(user=os.environ['ORACLE_USER'], password=os.environ['ORACLE_PASS'], dsn=os.environ['ORACLE_DSN'])


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

ARG_TYPES = {'ACTUALIZAR_CATEGORIA_ITEM': ['NUMBER', 'VARCHAR2', 'CHAR'],
 'ACTUALIZAR_CLIENTE': ['NUMBER', 'VARCHAR2', 'VARCHAR2', 'VARCHAR2', 'VARCHAR2', 'VARCHAR2'],
 'ACTUALIZAR_ESTADO_COMPRA': ['NUMBER', 'VARCHAR2'],
 'ACTUALIZAR_FAENA': ['NUMBER', 'NUMBER', 'VARCHAR2', 'VARCHAR2'],
 'ACTUALIZAR_ITEM': ['NUMBER', 'NUMBER', 'VARCHAR2', 'VARCHAR2', 'VARCHAR2', 'CHAR'],
 'ACTUALIZAR_PERSONAL': ['NUMBER', 'VARCHAR2', 'VARCHAR2', 'VARCHAR2', 'CHAR'],
 'ACTUALIZAR_PLANTILLA_ITEM': ['NUMBER', 'NUMBER', 'NUMBER'],
 'ACTUALIZAR_PROVEEDOR': ['NUMBER', 'VARCHAR2', 'VARCHAR2', 'VARCHAR2', 'VARCHAR2'],
 'ACTUALIZAR_ROL': ['NUMBER', 'VARCHAR2'],
 'ACTUALIZAR_TIPO_TRABAJO': ['NUMBER', 'VARCHAR2', 'VARCHAR2'],
 'ACTUALIZAR_UNIDAD_EQUIPO': ['NUMBER', 'NUMBER', 'VARCHAR2', 'VARCHAR2', 'VARCHAR2', 'DATE'],
 'ACTUALIZAR_USUARIO': ['NUMBER', 'NUMBER', 'NUMBER', 'VARCHAR2', 'VARCHAR2', 'CHAR'],
 'ACTUALIZAR_VEHICULO': ['NUMBER', 'VARCHAR2', 'VARCHAR2', 'CHAR'],
 'ATENDER_ALERTA': ['NUMBER'],
 'CERRAR_ORDEN_TRABAJO': ['NUMBER'],
 'CONFIRMAR_SALIDA_OT': ['NUMBER'],
 'CREAR_OT_CON_CHECKLIST': ['NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'VARCHAR2', 'DATE'],
 'ELIMINAR_CATEGORIA_ITEM': ['NUMBER'],
 'ELIMINAR_CLIENTE': ['NUMBER'],
 'ELIMINAR_FAENA': ['NUMBER'],
 'ELIMINAR_ITEM': ['NUMBER'],
 'ELIMINAR_PERSONAL': ['NUMBER'],
 'ELIMINAR_PLANTILLA_ITEM': ['NUMBER', 'NUMBER'],
 'ELIMINAR_PROVEEDOR': ['NUMBER'],
 'ELIMINAR_ROL': ['NUMBER'],
 'ELIMINAR_TIPO_TRABAJO': ['NUMBER'],
 'ELIMINAR_UNIDAD_EQUIPO': ['NUMBER'],
 'ELIMINAR_USUARIO': ['NUMBER'],
 'ELIMINAR_VEHICULO': ['NUMBER'],
 'GENERAR_REQ_COMPRA': ['NUMBER', 'NUMBER'],
 'INSERTAR_CATEGORIA_ITEM': ['VARCHAR2', 'CHAR'],
 'INSERTAR_CLIENTE': ['VARCHAR2', 'VARCHAR2', 'VARCHAR2', 'VARCHAR2', 'VARCHAR2'],
 'INSERTAR_FAENA': ['NUMBER', 'VARCHAR2', 'VARCHAR2'],
 'INSERTAR_ITEM': ['NUMBER', 'VARCHAR2', 'VARCHAR2', 'VARCHAR2', 'CHAR'],
 'INSERTAR_PERSONAL': ['VARCHAR2', 'VARCHAR2', 'VARCHAR2', 'CHAR'],
 'INSERTAR_PLANTILLA_ITEM': ['NUMBER', 'NUMBER', 'NUMBER'],
 'INSERTAR_PROVEEDOR': ['VARCHAR2', 'VARCHAR2', 'VARCHAR2', 'VARCHAR2'],
 'INSERTAR_ROL': ['VARCHAR2'],
 'INSERTAR_TIPO_TRABAJO': ['VARCHAR2', 'VARCHAR2'],
 'INSERTAR_UNIDAD_EQUIPO': ['NUMBER', 'VARCHAR2', 'VARCHAR2', 'VARCHAR2', 'DATE'],
 'INSERTAR_USUARIO': ['NUMBER', 'NUMBER', 'VARCHAR2', 'VARCHAR2', 'CHAR'],
 'INSERTAR_VEHICULO': ['VARCHAR2', 'VARCHAR2', 'CHAR'],
 'REGISTRAR_MANTENCION': ['NUMBER', 'VARCHAR2', 'DATE', 'VARCHAR2', 'VARCHAR2'],
 'REGISTRAR_RETORNO_ITEM': ['NUMBER', 'NUMBER', 'VARCHAR2'],
 'VERIFICAR_DESPACHAR_ITEM': ['NUMBER', 'NUMBER', 'NUMBER', 'VARCHAR2']}

REPORTES = {k for k in LISTAS if k.startswith('REPORTE_')}
SUP_LISTAS = {'FAENA', 'TIPO_TRABAJO', 'VEHICULO', 'PERSONAL', 'PLANTILLA_ITEM', 'ITEM', 'CATEGORIA_ITEM', 'ORDEN_TRABAJO', 'CHECKLIST_DETALLE', 'UNIDAD_EQUIPO', 'ALERTA'}
SUP_PROCS = {'CREAR_OT_CON_CHECKLIST', 'VERIFICAR_DESPACHAR_ITEM', 'CONFIRMAR_SALIDA_OT', 'REGISTRAR_RETORNO_ITEM', 'CERRAR_ORDEN_TRABAJO'}
ROLE_LISTS = {
    'administrador': set(LISTAS),
    'jefe de bodega': set(LISTAS) - {'USUARIO', 'ROL', 'BITACORA'},
    'supervisor': SUP_LISTAS | REPORTES,
    'gerencia': {'ALERTA', 'BITACORA'} | REPORTES,
}
ROLE_PROCS = {
    'administrador': PROCS,
    'jefe de bodega': {p for p in PROCS if not p.endswith(('_USUARIO', '_ROL'))},
    'supervisor': SUP_PROCS,
    'gerencia': set(),
}


def _salida(v):
    if isinstance(v, datetime):
        return v.strftime('%Y-%m-%d') if (v.hour, v.minute, v.second) == (0, 0, 0) else v.strftime('%Y-%m-%dT%H:%M:%S')
    if isinstance(v, date):
        return v.strftime('%Y-%m-%d')
    return v


def llamar_cursor(nombre, args=None, conn=None):
    if conn is None:
        with get_connection() as c:
            return llamar_cursor(nombre, args, c)
    with conn.cursor() as cur:
        with conn.cursor() as rc:
            cur.callproc(nombre, (args or []) + [rc])
            cols = [c[0] for c in rc.description]
            return [{k: _salida(v) for k, v in zip(cols, fila)} for fila in rc]


def error(msg, status):
    return jsonify(error=msg), status


def mensaje(e):
    # No mostrar conexiones, trazas o credenciales al navegador.
    txt = str(e.args[0].message) if e.args and hasattr(e.args[0], 'message') else str(e)
    first = txt.split('\n')[0]
    m = re.match(r'ORA-(20\d{3}):\s*(.*)', first)
    if m:
        if m.group(1) == '20014':
            # El SQLERRM anidado queda en el log; mensaje contextual sin datos internos.
            return m.group(2).split(': ORA-')[0] + '. Revise los datos ingresados.'
        return m.group(2)
    if 'ORA-02292' in txt: return 'No se puede eliminar: existen registros asociados.'
    if 'ORA-02291' in txt: return 'La referencia seleccionada no existe.'
    if 'ORA-00001' in txt: return 'El registro ya existe.'
    return 'No se pudo completar la operación en Oracle.'


def rol(u):
    return str(u['ROL']).strip().lower()


def credencial(username):
    rows = llamar_cursor('OBTENER_CREDENCIAL', [username])
    return rows[0] if len(rows) == 1 else None


def public_user(u):
    return {k: v for k, v in u.items() if k != 'PASSWORD_HASH'} | {'NOMBRE_PERSONA': u.get('NOMBRE_PERSONA') or u['USERNAME']}


def new_hash(password):
    if not isinstance(password, str) or not 12 <= len(password) <= 128:
        raise ValueError('La contraseña debe tener entre 12 y 128 caracteres.')
    return generate_password_hash(password, method=HASH_METHOD)


def remove_session(sid):
    with SESSION_LOCK:
        SESSIONS.pop(sid, None)


@app.before_request
def seguridad():
    if not request.path.startswith('/api/') or request.method == 'OPTIONS':
        return None
    # CORS no es autorización. Además se verifica el origen de cada escritura.
    if request.method not in ('GET', 'HEAD') and request.headers.get('Origin') not in ORIGINS:
        return error('Origen no autorizado.', 403)
    if request.path == '/api/login':
        return None
    sid = request.cookies.get(COOKIE, '')
    with SESSION_LOCK:
        info = SESSIONS.get(sid)
    if not info or info['expires'] <= time.monotonic():
        remove_session(sid)
        return error('Sesión no válida o expirada.', 401)
    if request.method not in ('GET', 'HEAD') and not secrets.compare_digest(request.headers.get('X-CSRF-Token', '').encode('utf-8'), info['csrf'].encode('utf-8')):
        return error('Token CSRF inválido.', 403)
    # Cierre real incluso si Oracle está temporalmente caído.
    if request.path == '/api/logout':
        g.sid = sid
        return None
    try:
        u = credencial(info['username'])
    except (oracledb.Error, KeyError):
        app.logger.exception('Error revalidando sesión')
        return error('No se pudo verificar la sesión con Oracle.', 503)
    if not u or u['ID_USUARIO'] != info['id'] or u['PASSWORD_HASH'] != info['hash'] or rol(u) != info['role']:
        remove_session(sid)
        return error('La cuenta cambió o fue desactivada. Inicie sesión nuevamente.', 401)
    if rol(u) not in ROLE_LISTS:
        return error('Rol sin permisos.', 403)
    g.sid, g.auth, g.csrf = sid, u, info['csrf']


@app.after_request
def no_cache(response):
    if request.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'no-store'
        response.headers['X-Content-Type-Options'] = 'nosniff'
    return response


@app.route('/api/login', methods=['POST'])
def login():
    d = request.get_json(silent=True)
    if not isinstance(d, dict): return error('JSON inválido.', 400)
    username, password = d.get('username'), d.get('password')
    if not isinstance(username, str) or not 1 <= len(username) <= 30 or not isinstance(password, str) or not 1 <= len(password) <= 128:
        return error('Credenciales inválidas.', 401)
    try:
        u = credencial(username)
        # No se aceptan las antiguas credenciales Base64. Migrar primero con migrar_usuarios.py.
        if not u or not u['PASSWORD_HASH'].startswith('pbkdf2:sha256:') or not check_password_hash(u['PASSWORD_HASH'], password):
            return error('Credenciales inválidas o usuario inactivo.', 401)
        rows = llamar_cursor('SP_LOGIN', [username, u['PASSWORD_HASH']])
        if not rows or rol(rows[0]) not in ROLE_LISTS:
            return error('Credenciales inválidas o rol no autorizado.', 401)
        if rows[0]['ID_USUARIO'] != u['ID_USUARIO'] or rol(rows[0]) != rol(u):
            return error('La cuenta cambió. Intente nuevamente.', 401)
        remove_session(request.cookies.get(COOKIE, ''))
        sid, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        with SESSION_LOCK:
            now = time.monotonic()
            for k in [k for k,v in SESSIONS.items() if v['expires'] <= now]: SESSIONS.pop(k, None)
            SESSIONS[sid] = {'id': u['ID_USUARIO'], 'username': username, 'hash': u['PASSWORD_HASH'], 'role': rol(u), 'csrf': csrf, 'expires': now + SESSION_SECONDS}
        response = jsonify(public_user(rows[0]) | {'csrf': csrf})
        response.set_cookie(COOKIE, sid, max_age=SESSION_SECONDS, httponly=True, samesite='Lax', secure=COOKIE_SECURE, path='/api')
        return response
    except (oracledb.Error, KeyError):
        app.logger.exception('Error en login')
        return error('No se pudo autenticar contra Oracle.', 503)


@app.route('/api/session', methods=['GET'])
def session_info():
    return jsonify(public_user(g.auth) | {'csrf': g.csrf})


@app.route('/api/logout', methods=['POST'])
def logout():
    remove_session(g.sid)
    response = jsonify(ok=True)
    response.delete_cookie(COOKIE, path='/api', secure=COOKIE_SECURE, httponly=True, samesite='Lax')
    return response


@app.route('/api/list/<nombre>', methods=['GET'])
def listar(nombre):
    if nombre not in LISTAS: return error('Lista no permitida.', 404)
    if nombre not in ROLE_LISTS[rol(g.auth)]: return error('Su perfil no tiene permiso para consultar esta lista.', 403)
    try:
        return jsonify(llamar_cursor(LISTAS[nombre]))
    except oracledb.Error as e:
        app.logger.exception('Error consultando %s', nombre)
        return error(mensaje(e), 500)


def typed_args(nombre, raw):
    tipos = ARG_TYPES[nombre]
    if not isinstance(raw, list) or len(raw) != len(tipos):
        raise ValueError('Cantidad de argumentos incorrecta.')
    args = list(raw)
    # El campo mantiene su posición histórica: el cliente envía texto, Flask almacena el hash.
    if nombre in ('INSERTAR_USUARIO', 'ACTUALIZAR_USUARIO'):
        i = 3 if nombre == 'INSERTAR_USUARIO' else 4
        args[i] = None if nombre == 'ACTUALIZAR_USUARIO' and args[i] in (None, '') else new_hash(args[i])
    for i, (v, t) in enumerate(zip(args, tipos)):
        if v is None: continue
        if t == 'NUMBER':
            if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v):
                raise ValueError(f'Argumento {i+1}: número inválido.')
        elif t == 'DATE':
            if not isinstance(v, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?', v):
                raise ValueError(f'Argumento {i+1}: fecha inválida.')
            args[i] = datetime.fromisoformat(v)
        elif not isinstance(v, str) or (t == 'CHAR' and len(v) != 1):
            raise ValueError(f'Argumento {i+1}: texto inválido.')
    return args


@app.route('/api/proc/<nombre>', methods=['POST'])
def ejecutar(nombre):
    if nombre not in PROCS: return error('Procedimiento no permitido.', 404)
    if nombre not in ROLE_PROCS[rol(g.auth)]: return error('Su perfil no tiene permiso para ejecutar este procedimiento.', 403)
    d = request.get_json(silent=True)
    try:
        if not isinstance(d, dict): raise ValueError('JSON inválido.')
        args = typed_args(nombre, d.get('args'))
    except (ValueError, OverflowError) as e:
        return error(str(e), 400)
    try:
        with get_connection() as conn:
            conn.client_identifier = 'SERCOBELT:' + str(g.auth['ID_USUARIO'])
            with conn.cursor() as cur:
                try:
                    cur.callproc(nombre, args)
                    conn.commit()
                except Exception:
                    conn.rollback()
                    raise
        return jsonify(ok=True)
    except oracledb.Error as e:
        app.logger.exception('Error ejecutando %s', nombre)
        return error(mensaje(e), 400)


if __name__ == '__main__':
    for key in ('ORACLE_USER', 'ORACLE_PASS', 'ORACLE_DSN'):
        if not os.getenv(key): raise SystemExit('Falta configurar ' + key + '. Ejecuta . .\\configurar.ps1 desde Backend.')
    app.run(host='127.0.0.1', port=5000, debug=False)

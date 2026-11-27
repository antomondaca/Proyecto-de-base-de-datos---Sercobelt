"""Prueba real de lectura, login, permisos y logout. No inserta ni borra registros."""
import json
from getpass import getpass
from urllib.request import Request, build_opener, HTTPCookieProcessor
from urllib.error import HTTPError
from http.cookiejar import CookieJar

BASE = 'http://localhost:5000/api'
ORIGIN = 'http://localhost:8443'

def pedir(opener, path, method='GET', data=None, csrf=None):
    headers = {'Origin': ORIGIN}
    if data is not None: headers['Content-Type'] = 'application/json'
    if csrf: headers['X-CSRF-Token'] = csrf
    req = Request(BASE+path, method=method, headers=headers, data=json.dumps(data).encode() if data is not None else None)
    try:
        with opener.open(req, timeout=20) as res:
            return res.status, json.loads(res.read())
    except HTTPError as e:
        return e.code, json.loads(e.read())

def comprobar(result, expected, label):
    status, data = result
    if status != expected: raise SystemExit(f'FALLO {label}: HTTP {status} (esperado {expected}).')
    print(f'OK {label}: HTTP {status}')
    return data

comprobar(pedir(build_opener(), '/list/CLIENTE'),401,'sin sesión')
for username, role, roles, bitacora in [('admin_prueba','administrador',200,200),('bodega_prueba','jefe de bodega',403,403),('supervisor_prueba','supervisor',403,403),('gerencia_prueba','gerencia',403,200)]:
    o = build_opener(HTTPCookieProcessor(CookieJar()))
    u = comprobar(pedir(o,'/login','POST',{'username':username,'password':getpass('Contraseña de '+username+': ')}),200,'login '+username)
    if u['ROL'].strip().lower()!=role or 'PASSWORD_HASH' in u: raise SystemExit('Respuesta de identidad inesperada.')
    csrf=u['csrf']
    comprobar(pedir(o,'/session'),200,'sesión')
    comprobar(pedir(o,'/list/ROL'),roles,'lectura roles')
    comprobar(pedir(o,'/list/BITACORA'),bitacora,'lectura bitácora')
    for r in ['REPORTE_FUERA_BODEGA','REPORTE_PENDIENTES_FALTANTES','REPORTE_CONSUMO_MENSUAL']:
        comprobar(pedir(o,'/list/'+r),200,r)
    # Sin token, el backend no debe invocar el PA. Con Gerencia, ni siquiera con token.
    comprobar(pedir(o,'/proc/ELIMINAR_ROL','POST',{'args':[-1]}),403,'protección CSRF')
    if role!='administrador': comprobar(pedir(o,'/proc/ELIMINAR_ROL','POST',{'args':[-1]},csrf),403,'escritura prohibida')
    comprobar(pedir(o,'/logout','POST',csrf=csrf),200,'logout')
    comprobar(pedir(o,'/session'),401,'sesión invalidada')
print('Pruebas HTTP reales completadas. Aún faltan pruebas de escritura con datos operacionales.')

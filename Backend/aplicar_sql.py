"""Compila la actualización sin borrar datos. Ejecutar desde Backend con el entorno Python 3.12."""
import re
from pathlib import Path
from app import get_connection

ruta = Path(__file__).resolve().parents[1] / 'Database' / 'Actualizacion_PL_SQL.sql'
bloques = [b.strip() for b in re.split(r'^\s*/\s*$', ruta.read_text(encoding='utf-8'), flags=re.M) if b.strip()]

with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT SYS_CONTEXT('USERENV','SESSION_USER'), SYS_CONTEXT('USERENV','CURRENT_SCHEMA') FROM DUAL")
        usuario, esquema = cur.fetchone()
        if usuario != 'SERCOBELT' or esquema != 'SERCOBELT':
            raise SystemExit(f'Esquema inesperado: {usuario}/{esquema}. No se ejecutó ningún cambio.')
        cur.execute("SELECT COUNT(*) FROM USER_TAB_COLUMNS WHERE TABLE_NAME='BITACORAS' AND COLUMN_NAME='ID_USUARIO'")
        if cur.fetchone()[0] != 1:
            raise SystemExit('Falta BITACORAS.ID_USUARIO. No se ejecutó ningún cambio.')
        cur.execute("SELECT COUNT(*) FROM USER_OBJECTS WHERE OBJECT_TYPE='PROCEDURE' AND STATUS='VALID' AND OBJECT_NAME='SP_LOGIN'")
        if cur.fetchone()[0] != 1:
            raise SystemExit('Falta SP_LOGIN válido. Verifique el esquema instalado.')
        for b in bloques:
            m = re.search(r'CREATE OR REPLACE (PROCEDURE|FUNCTION) (\w+)', b, re.I)
            if not m:
                raise SystemExit('Bloque no reconocido; se detiene la actualización.')
            tipo, nombre = m.groups()
            cur.execute(b[b.index('CREATE OR REPLACE'):])
            cur.execute("SELECT LINE, POSITION, TEXT FROM USER_ERRORS WHERE NAME=:n AND TYPE=:t AND ATTRIBUTE='ERROR' ORDER BY SEQUENCE", n=nombre, t=tipo)
            errores = cur.fetchall()
            if errores:
                for linea, pos, msg in errores:
                    print(f'{nombre}, línea {linea}:{pos}: {msg}')
                raise SystemExit('Error de compilación. Los objetos ya reemplazados permanecen actualizados; no borrar nada.')
            print('OK', tipo, nombre)
        cur.execute("SELECT OBJECT_NAME, OBJECT_TYPE FROM USER_OBJECTS WHERE STATUS='INVALID'")
        invalidos = cur.fetchall()
        if invalidos:
            raise SystemExit(f'Quedan objetos inválidos: {invalidos}')
print(f'Actualización completada: {len(bloques)} objetos compilados. No se han eliminado tablas ni registros.')

"""Restablece contraseñas locales sin imprimirlas ni guardarlas en scripts. No expone hashes a React."""
import argparse
from getpass import getpass
from app import get_connection, llamar_cursor, new_hash

parser = argparse.ArgumentParser(description='Asignar nuevas contraseñas a usuarios activos existentes.')
parser.add_argument('usuarios', nargs='+', help='Nombres de usuario exactos; por ejemplo admin_prueba')
args = parser.parse_args()
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT SYS_CONTEXT('USERENV','SESSION_USER') FROM DUAL")
        if cur.fetchone()[0] != 'SERCOBELT':
            raise SystemExit('Esquema incorrecto.')
    for username in args.usuarios:
        filas = llamar_cursor('OBTENER_CREDENCIAL', [username], conn)
        if len(filas) != 1:
            raise SystemExit(f'No se encontró un único usuario activo: {username}')
        u = filas[0]
        print(f'Usuario: {username} | Rol: {u["ROL"]}')
        while True:
            p = getpass('Nueva contraseña (12 a 128 caracteres): ')
            p2 = getpass('Repita la contraseña: ')
            if p != p2:
                print('No coinciden. Intente nuevamente.')
                continue
            try:
                h = new_hash(p)
                break
            except ValueError as e:
                print(e)
        del p, p2
        with conn.cursor() as cur:
            cur.callproc('ACTUALIZAR_USUARIO', [u['ID_USUARIO'], u['ID_ROL'], u['ID_PERSONAL'], u['USERNAME'], h, 'A'])
        conn.commit()
        print('Contraseña actualizada:', username)
print('Listo. Inicie sesión con las nuevas contraseñas.')

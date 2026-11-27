"""Pruebas HTTP con Flask test_client y Oracle simulado SOLO en pruebas. No se conecta a la BD."""
import unittest
from unittest.mock import patch, MagicMock
import app as a

ORIGIN = 'http://localhost:8443'
H = {'Origin': ORIGIN}

class Seguridad(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.password = 'ClaveTemporal123!'
        cls.hash = a.new_hash(cls.password)

    def setUp(self):
        a.SESSIONS.clear()
        self.users = {r: {'ID_USUARIO': i+1, 'ID_ROL': i+1, 'USERNAME': r, 'ROL': r, 'NOMBRE_PERSONA': r, 'ID_PERSONAL': i+1, 'PASSWORD_HASH': self.hash} for i,r in enumerate(a.ROLE_LISTS)}
        def cursor(name, args=None, conn=None):
            if name == 'OBTENER_CREDENCIAL':
                return [self.users[args[0]].copy()] if args[0] in self.users else []
            if name == 'SP_LOGIN':
                u = self.users.get(args[0])
                return [a.public_user(u)] if u and u['PASSWORD_HASH'] == args[1] else []
            return []
        self.p = patch.object(a, 'llamar_cursor', side_effect=cursor); self.p.start(); self.addCleanup(self.p.stop)
        self.conn = MagicMock(); self.cur = self.conn.cursor.return_value.__enter__.return_value
        self.p2 = patch.object(a, 'get_connection'); c = self.p2.start(); self.addCleanup(self.p2.stop); c.return_value.__enter__.return_value = self.conn

    def login(self, client, role):
        r = client.post('/api/login', headers=H, json={'username': role, 'password': self.password})
        self.assertEqual(r.status_code,200)
        self.assertNotIn('PASSWORD_HASH',r.json)
        self.assertIn('HttpOnly',r.headers['Set-Cookie'])
        self.assertEqual(r.headers.get('Access-Control-Allow-Origin'), ORIGIN)
        return H | {'X-CSRF-Token':r.json['csrf']}

    def test_no_session(self):
        c = a.app.test_client()
        self.assertEqual(c.get('/api/list/CLIENTE').status_code,401)
        self.assertEqual(c.post('/api/proc/INSERTAR_ROL', headers=H,json={'args':['Prueba']}).status_code,401)

    def test_roles(self):
        for role in a.ROLE_LISTS:
            c=a.app.test_client(); h=self.login(c,role)
            for n in a.LISTAS:
                r=c.get('/api/list/'+n)
                self.assertEqual(r.status_code,200 if n in a.ROLE_LISTS[role] else 403,(role,n))
            for n,types in a.ARG_TYPES.items():
                raw=[1 if t=='NUMBER' else '2026-11-26' if t=='DATE' else 'A' if t=='CHAR' else 'Texto de prueba' for t in types]
                r=c.post('/api/proc/'+n,headers=h,json={'args':raw})
                self.assertEqual(r.status_code,200 if n in a.ROLE_PROCS[role] else 403,(role,n,r.json))
        self.assertEqual(self.conn.client_identifier,'SERCOBELT:3')  # último rol con permiso de escritura

    def test_csrf_logout_and_origin(self):
        c=a.app.test_client(); h=self.login(c,'administrador')
        self.assertEqual(c.post('/api/proc/INSERTAR_ROL',headers=H,json={'args':['x']}).status_code,403)
        self.assertEqual(c.post('/api/proc/INSERTAR_ROL',headers=h|{'Origin':'http://evil.invalid'},json={'args':['x']}).status_code,403)
        self.assertEqual(c.get('/api/session').status_code,200)
        self.assertEqual(c.post('/api/logout',headers=h).status_code,200)
        self.assertEqual(c.get('/api/list/CLIENTE').status_code,401)

    def test_password_edit_and_revocation(self):
        c=a.app.test_client(); h=self.login(c,'administrador')
        self.assertEqual(c.post('/api/proc/ACTUALIZAR_USUARIO',headers=h,json={'args':[1,1,1,'usuario',None,'A']}).status_code,200)
        self.assertIsNone(self.cur.callproc.call_args.args[1][4])
        self.users['administrador']['ROL']='gerencia'
        self.assertEqual(c.get('/api/list/CLIENTE').status_code,401)

    def test_failed_write_rolls_back(self):
        c=a.app.test_client(); h=self.login(c,'administrador')
        self.cur.callproc.side_effect=a.oracledb.Error('ORA-02292: child record found')
        with patch.object(a.app.logger, 'exception'):
            r=c.post('/api/proc/ELIMINAR_CLIENTE', headers=h, json={'args':[1]})
        self.assertEqual(r.status_code,400)
        self.assertIn('registros asociados',r.json['error'])
        self.conn.rollback.assert_called_once()
        self.conn.commit.assert_not_called()

    def test_legacy_rejected(self):
        self.users['administrador']['PASSWORD_HASH']='sha$abc'
        c=a.app.test_client()
        self.assertEqual(c.post('/api/login',headers=H,json={'username':'administrador','password':self.password}).status_code,401)

if __name__ == '__main__': unittest.main(verbosity=2)

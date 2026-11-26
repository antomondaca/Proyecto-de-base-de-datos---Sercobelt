# Pendientes coordinados con Flask y Oracle

El frontend usa hoy el contrato existente (`POST /api/login` con `username` + `password_hash`, `GET /api/list/{nombre}`, `POST /api/proc/{nombre}` con `{ "args": [...] }`). **Las medidas de seguridad siguientes NO existen todavía**; los permisos de `src/perms.ts` solo ocultan opciones en la interfaz.

## Seguridad (app.py)
1. **Sesiones**: `/api/login` debe crear una sesión de servidor y emitir cookie `HttpOnly`, `Secure`, `SameSite=Lax/Strict`. Añadir `GET /api/session` (devuelve usuario y rol) y `POST /api/logout` (invalida la sesión).
2. **CORS con credenciales**: `CORS(app, supports_credentials=True, origins=[<origen del frontend>])` (no `*`). Solo después se podrá añadir `credentials: 'include'` a los `fetch` de `src/db.ts` (hoy no se envía porque rompería la conexión con `CORS(app)` abierto).
3. **Autorización real** en `/api/list/*` y `/api/proc/*` según el rol obtenido de Oracle; responder `401` (sin sesión) y `403` (sin permiso). El frontend ya trata ambos: 401 limpia datos y vuelve al login; 403 muestra "Acceso denegado". Matriz sugerida: la de `src/perms.ts` (Gerencia solo lectura: reportes, ALERTA y BITACORA; ATENDER_ALERTA solo Administrador y Jefe de Bodega; USUARIO, ROL y BITACORA solo Administrador/Gerencia según corresponda).
4. **CSRF**: token por sesión (cabecera `X-CSRF-Token`) para los `POST`.
5. **Contraseñas**: hoy React envía `'sha$' + btoa(password)` (Base64, no es seguridad). Flask debe recibir la contraseña en claro por HTTPS, verificarla con un hash lento (argon2/bcrypt) y no exponer hashes. Cambiar `SP_LOGIN`/`INSERTAR_USUARIO`/`ACTUALIZAR_USUARIO` para que Flask hashee antes de llamar a Oracle, respetando el orden de parámetros.
6. `ACTUALIZAR_USUARIO` exige `p_password_hash`: el formulario obliga a ingresar contraseña al editar. Un parámetro opcional (conservar la actual) requiere cambio en el SQL.

## SQL / negocio
- `CREAR_OT_CON_CHECKLIST` copia `PLANTILLA_ITEM`; no recibe ítems personalizados. Por eso "Armado de Checklist" muestra la plantilla en solo lectura (ya no permite agregar/eliminar ítems). Si se requiere personalizar, hay que añadir un procedimiento en Oracle.
- Los avisos de triggers simulados desaparecieron: Oracle ejecuta los triggers y Flask no informa cuáles se dispararon.

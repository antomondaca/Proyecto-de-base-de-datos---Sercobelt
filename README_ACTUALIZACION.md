# Sercobelt — actualización coordinada de PL/SQL y seguridad

**No borrar tablas. No ejecutar el SQL completo sobre el esquema existente.** Este ZIP es un parche: copiar su contenido encima de la raíz del proyecto actual. Mantener `Frontend/node_modules`, `.venv`, `.figma` y los demás archivos locales. Respaldar el código y el esquema Oracle (incluidos los datos) antes de actualizar. Mantener Oracle/Docker activo y detener Flask y Vite con Ctrl+C.

## 1. Instalar el parche
Copiar las carpetas Backend, Database, Frontend y el archivo .gitignore del ZIP sobre sus equivalentes. Aceptar reemplazos. `Database/sercobeltcom.sql` es el script completo para una futura instalación limpia; **no se ejecuta ahora**. `Database/Actualizacion_PL_SQL.sql` reemplaza 67 PA y 2 funciones y crea OBTENER_CREDENCIAL (68 PA en total). El modelo físico no cambia.

## 2. Terminal PowerShell del backend
Desde la raíz del proyecto:

```powershell
cd Backend
& ..\.venv\Scripts\python.exe --version
& ..\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Usar Python 3.12. Configurar las credenciales locales, sin escribirlas en archivos:

```powershell
. .\configurar.ps1
```

Si Windows bloquea el script de PowerShell, no desactivar la protección: copiar estas líneas directamente en la terminal:

```powershell
$env:ORACLE_USER = 'sercobelt'
$env:ORACLE_PASS = [System.Net.NetworkCredential]::new('', (Read-Host 'Contraseña Oracle' -AsSecureString)).Password
$env:ORACLE_DSN = 'localhost:1521/XEPDB1'
$env:FRONTEND_ORIGINS = 'http://localhost:8443'
```

Ajustar el DSN solo si la conexión real de DBeaver usa otro servicio. La contraseña es la de la conexión a Oracle, no la del login web. No compartir capturas de secretos. Estas variables permanecen en esta terminal hasta cerrarla.

## 3. Actualizar Oracle sin formatear

```powershell
& ..\.venv\Scripts\python.exe aplicar_sql.py
```

El programa comprueba el esquema SERCOBELT y BITACORAS.ID_USUARIO antes de enviar DDL; compila cada bloque sin problemas de delimitador de DBeaver. Es seguro volver a ejecutar la actualización tras corregir errores de compilación porque usa CREATE OR REPLACE. No obstante, Oracle confirma DDL implícitamente, por lo que no es una migración atómica. Si se detiene, conservar la salida y no reiniciar Flask hasta corregir los errores. El SQL de estructura anterior debe mantenerse como respaldo externo.

En DBeaver verificar:

```sql
SELECT OBJECT_TYPE, COUNT(*) TOTAL FROM USER_OBJECTS
WHERE OBJECT_TYPE IN ('TABLE','SEQUENCE','PROCEDURE','FUNCTION','TRIGGER')
GROUP BY OBJECT_TYPE ORDER BY OBJECT_TYPE;
SELECT OBJECT_NAME, OBJECT_TYPE, STATUS FROM USER_OBJECTS WHERE STATUS='INVALID';
```

Esperado: 18 tablas, 68 PA, 17 secuencias, 2 funciones y 6 triggers; cero inválidos. Ejecutar cada consulta por separado. Las restricciones permanecen 18 PK, 21 FK y 10 UNIQUE en tablas actuales.

## 4. Migrar cuentas existentes
El nuevo backend no acepta Base64. Restablecer las cuatro contraseñas de prueba con el script interactivo, conservando los identificadores y roles:

```powershell
& ..\.venv\Scripts\python.exe migrar_usuarios.py admin_prueba bodega_prueba supervisor_prueba gerencia_prueba
```

Elegir una contraseña nueva distinta para cada usuario de entre 12 y 128 caracteres. No aparece al escribirla. Guardarlas en un lugar privado. Si se interrumpe, volver a ejecutar solo para los usuarios pendientes. No usar las contraseñas antiguas. Cuentas adicionales activas con hash antiguo también requieren restablecimiento (pasar sus usernames). No se incluyen credenciales en este ZIP.

## 5. Iniciar y probar Flask

```powershell
& ..\.venv\Scripts\python.exe test_seguridad.py
& ..\.venv\Scripts\python.exe app.py
```

El primer comando prueba rutas y seguridad con Oracle simulado exclusivamente en pruebas; el segundo inicia el servidor real en 127.0.0.1:5000, sin debug. Mantener esta terminal abierta. Abrir http://localhost:5000/api/list/CLIENTE sin haber iniciado sesión debe devolver 401 (esto ahora es correcto, no un fallo de Oracle).

## 6. Iniciar React
En una segunda terminal, desde la raíz:

```powershell
cd Frontend
pnpm exec tsc --noEmit
pnpm build
pnpm dev --host localhost
```

Si faltan dependencias, ejecutar `pnpm install --frozen-lockfile` primero. Usar únicamente http://localhost:8443/ (no la IP de red). Si existe `.env`, comprobar `VITE_API=http://localhost:5000/api`. Ingresar con `admin_prueba` y la nueva contraseña. Cerrar sesión y probar los demás perfiles. Recargar la página debe conservar la sesión mientras sea válida. Flask revalida cuenta, rol y hash en Oracle; logout revoca el token. Reiniciar Flask invalida sesiones.

## 7. Prueba real de autorización
Con Flask activo, abrir otra terminal en Backend:

```powershell
& ..\.venv\Scripts\python.exe probar_api.py
```

Solicita las contraseñas nuevas de los cuatro perfiles y verifica respuestas 200, 401 y 403, tres reportes, CSRF y logout. No modifica datos. Después probar manualmente un CRUD con un registro temporal y eliminación referencial, cinco gestores, tres dashboards, bitácora y triggers con datos operacionales autorizados. `ID_USUARIO` se registra en bitácora cuando se modifica una OT mediante la API autenticada; registros antiguos y operaciones directas DBeaver pueden tener NULL. La bitácora sigue auditando OT, no todos los mantenedores.

## 8. Alcance y limitaciones
- 67 procedimientos existentes y firmas preservados, 45 con escritura y ROLLBACK ante errores; 22 consultas con manejo de excepciones sin alterar transacciones; 2 funciones con excepciones. Nuevo PA interno OBTENER_CREDENCIAL; no se ofrece a React. Los cursores explícitos de dos gestores se cierran ante fallos. Las excepciones de lectura diferida se manejan en Flask.
- Los triggers no ejecutan COMMIT/ROLLBACK; sus errores se propagan al PA. Los códigos de error de reglas ya existentes se conservan. No se cambian reglas de negocio ni el esquema de tablas.
- Los cálculos de compra y diferencias registradas de retorno vienen de Oracle; retorno por lote sigue con transacciones por ítem y aviso de progreso parcial si falla. No se garantiza atomicidad del lote entero. Pendientes poblamiento, 3FN formal, validación exhaustiva de formularios y pruebas funcionales.
- Seguridad local de desarrollo: cookie HttpOnly y SameSite=Lax, sin Secure porque se usa HTTP loopback. En producción se requiere HTTPS, COOKIE_SECURE=1, configuración de origen, servidor WSGI, sesiones compartidas, límites de intentos y mínimo privilegio de Oracle. No exponer los servidores a la red. No se promete seguridad de producción.
- Verificado aquí: análisis de firmas, tsc 5.9.3 sin errores, sintaxis Python y pruebas HTTP simuladas de Flask. Vite build no pudo comprobarse en Linux por dependencias binarias Windows del ZIP. No se ejecutó SQL ni Flask contra tu Oracle, ni navegador real tras el parche. Verificar antes de entregar.

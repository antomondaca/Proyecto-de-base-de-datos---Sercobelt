# SERCOBELT — Control de Despacho y Retorno de Equipos, Herramientas e Insumos

Frontend React + TypeScript + Vite + Tailwind CSS. No guarda datos: toda la información viene de Oracle a través de Flask (`GET /api/list/{nombre}`, `POST /api/proc/{nombre}`, `POST /api/login`).

## Requisitos
- Node.js 22 y pnpm (ver `.mise.toml`). El gestor de paquetes del proyecto es **pnpm** (`pnpm-lock.yaml`); no hay `package-lock.json`.
- Backend Flask (`app.py`) en ejecución y conectado a Oracle con el SQL `sercobeltcom.sql`.

## Configurar VITE_API
1. Copie `.env.example` a `.env` (o `.env.local`).
2. Ajuste la dirección si Flask no corre en el valor por defecto:
   ```
   VITE_API=http://localhost:5000/api
   ```
   Si la variable no existe se usa `http://localhost:5000/api`. Reinicie Vite tras cambiarla.

## Ejecutar localmente
```bash
pnpm install
pnpm dev        # servidor de desarrollo de Vite
pnpm build      # compilación de producción
pnpm exec tsc --noEmit   # verificación de tipos
```
Inicie primero Flask (`python app.py`, puerto 5000). Ingrese con un usuario existente en la tabla de usuarios de Oracle; el rol (Administrador, Jefe de Bodega, Supervisor, Gerencia) determina las secciones visibles.

## Estructura
- `src/db.ts` cliente HTTP y cache de lectura; `src/catalogs.ts` configuración de los 12 mantenedores.
- `src/perms.ts` permisos visuales por perfil; `src/ctx.ts` contexto de la aplicación.
- `src/views/` mantenedores (`Crud`), gestores (`Checklist`, `Verificacion`, `Retorno`, `Mantencion`, `Compra`), `Dashboards` (3 reportes) y `Sistema` (alertas y bitácora).

## Pendiente (coordinado con el backend)
Sesiones, cookies HttpOnly, autorización real, CSRF y contraseñas seguras: ver `PENDIENTES_FLASK_SQL.md`. Los permisos de `perms.ts` solo controlan la interfaz. Las pruebas contra Oracle aún no se han realizado.

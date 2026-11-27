# SERCOBELT — Frontend React + TypeScript
Usar el procedimiento de actualización de `../README_ACTUALIZACION.md`. El backend y el frontend nuevos deben instalarse juntos. Abrir siempre `http://localhost:8443/`, no la dirección IP de la red.

```powershell
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm build
pnpm dev --host localhost
```

`VITE_API=http://localhost:5000/api` es el valor predeterminado. Las peticiones usan cookies y token CSRF. No almacenar contraseñas ni credenciales Oracle en variables VITE_. La diferencia de retorno se calcula sobre los datos guardados en Oracle.

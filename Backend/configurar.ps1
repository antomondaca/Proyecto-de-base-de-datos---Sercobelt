# Ejecutar desde Backend: . .\configurar.ps1
# Las variables duran únicamente en esta terminal (no se escriben en archivos).
$env:ORACLE_USER = Read-Host 'Usuario Oracle (el mismo de DBeaver, SERCOBELT)'
$env:ORACLE_PASS = [System.Net.NetworkCredential]::new('', (Read-Host 'Contraseña de Oracle (no la del login web)' -AsSecureString)).Password
$dsn = Read-Host 'DSN Oracle [localhost:1521/XEPDB1]'
if ([string]::IsNullOrWhiteSpace($dsn)) { $dsn = 'localhost:1521/XEPDB1' }
$env:ORACLE_DSN = $dsn
$env:FRONTEND_ORIGINS = 'http://localhost:8443'
$env:COOKIE_SECURE = '0'
Write-Host 'Configuración local lista. No se guardaron credenciales en el repositorio.'

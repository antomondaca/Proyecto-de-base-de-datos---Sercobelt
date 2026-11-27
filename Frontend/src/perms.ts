// Permisos por rol (ROL.NOMBRE_ROL). Solo controlan la interfaz: la autorización real debe aplicarla Flask.
export const GESTORES = ['Armado de Checklist', 'Verificación y Salida', 'Retorno y Conciliación', 'Mantención y Calibración', 'Requerimiento de Compra']
export const CAT_GENERALES = ['Personal', 'Clientes', 'Faenas', 'Proveedores', 'Vehículos', 'Tipos de Trabajo', 'Categorías', 'Ítems', 'Unidades de Equipo', 'Plantilla de Ítems']
export const CAT_ADMIN = ['Usuarios', 'Roles']
export const REPORTES = ['Faltantes Recurrentes', 'Equipos en Terreno', 'Consumo por OT/Cliente']

export function allowedPages(rolNombre: string): string[] {
  switch (rolNombre.trim().toLowerCase()) {
    case 'administrador': return [...GESTORES, ...CAT_ADMIN, ...CAT_GENERALES, ...REPORTES, 'Alertas', 'Bitácora de Cambios']
    case 'jefe de bodega': return [...GESTORES, ...CAT_GENERALES, ...REPORTES, 'Alertas']
    case 'supervisor': return ['Armado de Checklist', 'Verificación y Salida', 'Retorno y Conciliación', ...REPORTES, 'Alertas']
    case 'gerencia': return [...REPORTES, 'Alertas', 'Bitácora de Cambios']
    default: return []
  }
}
export const canAtenderAlertas = (rol: string) => ['administrador', 'jefe de bodega'].includes(rol.trim().toLowerCase())

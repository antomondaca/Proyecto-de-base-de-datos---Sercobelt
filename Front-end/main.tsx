import type { Row, T } from './db'

export type Field = {
  key: string; type: 'text' | 'date' | 'select' | 'fk' | 'password' | 'number'
  req?: boolean; max?: number; head?: string; badge?: boolean
  opts?: [string, string][]; fk?: { table: T; label: (r: Row) => string }
}
export type Cat = { table: T; nuevo: string; fields: Field[] }

const AI: [string, string][] = [['A', 'A — Activo'], ['I', 'I — Inactivo']]
const SN: [string, string][] = [['S', 'S — Sí'], ['N', 'N — No']]
const txt = (key: string, max: number, req = true): Field => ({ key, type: 'text', max, req })

export const CATALOGS: Record<string, Cat> = {
  Usuarios: { table: 'USUARIO', nuevo: 'Usuario', fields: [
    { key: 'ID_ROL', head: 'ROL', type: 'fk', req: true, fk: { table: 'ROL', label: (r) => r.NOMBRE_ROL } },
    { key: 'ID_PERSONAL', head: 'PERSONAL', type: 'fk', req: false, fk: { table: 'PERSONAL', label: (r) => r.NOMBRE } },
    txt('USERNAME', 30), { key: 'PASSWORD_HASH', type: 'password', max: 255 },
    { key: 'ESTADO', type: 'select', req: true, opts: AI, badge: true }] },
  Personal: { table: 'PERSONAL', nuevo: 'Personal', fields: [txt('RUT', 12), txt('NOMBRE', 100), txt('CARGO', 50), { key: 'ESTADO', type: 'select', req: true, opts: AI, badge: true }] },
  Clientes: { table: 'CLIENTE', nuevo: 'Cliente', fields: [txt('RUT', 12), txt('RAZON_SOCIAL', 120), txt('CONTACTO', 100, false), txt('EMAIL', 100, false), txt('TELEFONO', 20, false)] },
  Faenas: { table: 'FAENA', nuevo: 'Faena', fields: [{ key: 'ID_CLIENTE', head: 'CLIENTE', type: 'fk', req: true, fk: { table: 'CLIENTE', label: (r) => r.RAZON_SOCIAL } }, txt('NOMBRE', 100), txt('UBICACION', 150, false)] },
  Proveedores: { table: 'PROVEEDOR', nuevo: 'Proveedor', fields: [txt('RUT', 12), txt('RAZON_SOCIAL', 120), txt('CONTACTO', 100, false), txt('TELEFONO', 20, false)] },
  Vehículos: { table: 'VEHICULO', nuevo: 'Vehículo', fields: [txt('PATENTE', 10), txt('TIPO', 40), { key: 'ESTADO', type: 'select', req: true, opts: AI, badge: true }] },
  'Tipos de Trabajo': { table: 'TIPO_TRABAJO', nuevo: 'Tipo de Trabajo', fields: [txt('NOMBRE', 80), txt('DESCRIPCION', 250, false)] },
  Categorías: { table: 'CATEGORIA_ITEM', nuevo: 'Categoría', fields: [txt('NOMBRE', 40), { key: 'ES_RETORNABLE', type: 'select', req: true, opts: SN }] },
  Ítems: { table: 'ITEM', nuevo: 'Ítem', fields: [
    { key: 'ID_CATEGORIA', head: 'CATEGORIA', type: 'fk', req: true, fk: { table: 'CATEGORIA_ITEM', label: (r) => r.NOMBRE } },
    txt('NOMBRE', 120), txt('DIMENSION', 40, false), txt('UNIDAD', 20), { key: 'ES_IDENTIFICABLE', type: 'select', req: true, opts: SN }] },
  'Unidades de Equipo': { table: 'UNIDAD_EQUIPO', nuevo: 'Equipo', fields: [
    { key: 'ID_ITEM', head: 'ITEM', type: 'fk', req: true, fk: { table: 'ITEM', label: (r) => r.NOMBRE } },
    txt('CODIGO', 30), txt('NRO_SERIE', 50, false),
    { key: 'ESTADO', type: 'select', req: true, badge: true, opts: ['En bodega', 'En terreno', 'En mantención', 'De baja'].map((s) => [s, s] as [string, string]) },
    { key: 'FECHA_PROXIMA_CALIBRACION', type: 'date', req: false }] },
  Roles: { table: 'ROL', nuevo: 'Rol', fields: [txt('NOMBRE_ROL', 30)] },
  'Plantilla de Ítems': { table: 'PLANTILLA_ITEM', nuevo: 'Ítem de Plantilla', fields: [
    { key: 'ID_TIPO_TRABAJO', head: 'TIPO_TRABAJO', type: 'fk', req: true, fk: { table: 'TIPO_TRABAJO', label: (r) => r.NOMBRE } },
    { key: 'ID_ITEM', head: 'ITEM', type: 'fk', req: true, fk: { table: 'ITEM', label: (r) => r.NOMBRE } },
    { key: 'CANTIDAD_ESTANDAR', type: 'number', req: true }] },
}

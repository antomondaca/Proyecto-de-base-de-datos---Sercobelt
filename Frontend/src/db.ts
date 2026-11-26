// Capa de datos: NO guarda datos ni reglas. Solo llama a Flask (/api), que invoca los procedimientos de Oracle.
import { useSyncExternalStore } from 'react'

export type Row = Record<string, any>
export const PK = {
  ROL: ['ID_ROL'], PERSONAL: ['ID_PERSONAL'], CLIENTE: ['ID_CLIENTE'], PROVEEDOR: ['ID_PROVEEDOR'],
  VEHICULO: ['ID_VEHICULO'], TIPO_TRABAJO: ['ID_TIPO_TRABAJO'], CATEGORIA_ITEM: ['ID_CATEGORIA'],
  BITACORA: ['ID_BITACORA'], USUARIO: ['ID_USUARIO'], FAENA: ['ID_FAENA'], ITEM: ['ID_ITEM'],
  UNIDAD_EQUIPO: ['ID_UNIDAD'], PLANTILLA_ITEM: ['ID_TIPO_TRABAJO', 'ID_ITEM'], ORDEN_TRABAJO: ['ID_OT'],
  MANTENCION: ['ID_MANTENCION'], CHECKLIST_DETALLE: ['ID_DETALLE'], ALERTA: ['ID_ALERTA'], REQ_COMPRA: ['ID_REQUERIMIENTO'],
} as const
export type T = keyof typeof PK
export type DB = { [K in T]: Row[] }

const API: string = (import.meta as any).env?.VITE_API ?? 'http://localhost:5000/api'

// Error devuelto por Flask/Oracle (la operación NO se ejecutó)
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message) }
}
// La operación sí se guardó en Oracle, pero falló la recarga posterior de datos
export class RefreshError extends Error {}

let onUnauthorized: (() => void) | null = null
export const setUnauthorizedHandler = (fn: (() => void) | null) => { onUnauthorized = fn }

async function req(path: string, init?: RequestInit) {
  let r: Response
  try { r = await fetch(API + path, init) } catch { throw new ApiError('No se pudo conectar con Flask (' + API + ')', 0) }
  const j = await r.json().catch(() => ({}))
  if (!r.ok) {
    if (r.status === 401 && path !== '/login') onUnauthorized?.()
    if (r.status === 403) throw new ApiError(j.error ?? 'Acceso denegado: su perfil no tiene permiso para esta operación', 403)
    throw new ApiError(j.error ?? 'Error del servidor', r.status)
  }
  return j
}

export const hash = (s: string) => 'sha$' + btoa(unescape(encodeURIComponent(s)))

// ---- Cache de lectura (se rellena con los procedimientos LISTAR_ de Oracle)
const empty = (): DB => Object.fromEntries(Object.keys(PK).map((k) => [k, []])) as unknown as DB
let db: DB = empty()
const subs = new Set<() => void>()
export const useDB = () => useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f) } }, () => db)

// Oracle devuelve 'Activo'/'Inactivo' y 'Sí'/'No' en algunos listados; el formulario usa los códigos A/I y S/N
const norm = (t: T, r: Row): Row => {
  if (['PERSONAL', 'VEHICULO', 'USUARIO'].includes(t) && 'ESTADO' in r) r.ESTADO = r.ESTADO === 'Activo' ? 'A' : r.ESTADO === 'Inactivo' ? 'I' : r.ESTADO
  for (const k of ['ES_RETORNABLE', 'ES_IDENTIFICABLE']) if (k in r) r[k] = r[k] === 'Sí' ? 'S' : r[k] === 'No' ? 'N' : r[k]
  return r
}

export const listar = (nombre: string): Promise<Row[]> => req('/list/' + nombre)

// Listas necesarias por perfil (los permisos reales deben aplicarse en Flask)
const BASE_GESTORES: T[] = ['FAENA', 'TIPO_TRABAJO', 'VEHICULO', 'PERSONAL', 'PLANTILLA_ITEM', 'ITEM', 'CATEGORIA_ITEM', 'ORDEN_TRABAJO', 'CHECKLIST_DETALLE', 'UNIDAD_EQUIPO', 'ALERTA']
export function listasParaRol(rol: string): T[] {
  const r = rol.trim().toLowerCase()
  const todas = Object.keys(PK) as T[]
  if (r === 'administrador') return todas
  if (r === 'jefe de bodega') return todas.filter((t) => !['USUARIO', 'ROL', 'BITACORA'].includes(t))
  if (r === 'supervisor') return BASE_GESTORES
  if (r === 'gerencia') return ['ALERTA', 'BITACORA']
  return []
}
let currentRol = ''
export const clearData = () => { currentRol = ''; db = empty(); subs.forEach((s) => s()) }

export async function loadAll(rol: string = currentRol) {
  currentRol = rol
  const tablas = listasParaRol(rol)
  const datos = await Promise.all(tablas.map((t) => listar(t)))
  const next = empty()
  tablas.forEach((t, i) => { next[t] = datos[i].map((r) => norm(t, r)) })
  db = next
  subs.forEach((s) => s())
}

// Reportes: se consultan directamente a Flask (REPORTE_* de Oracle), sin cache global
export type ReporteNombre = 'REPORTE_FUERA_BODEGA' | 'REPORTE_PENDIENTES_FALTANTES' | 'REPORTE_CONSUMO_MENSUAL'
export const cargarReporte = (n: ReporteNombre) => listar(n)

const exec = (proc: string, args: any[]) => req('/proc/' + proc, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ args }) })
const refresh = async () => {
  try { await loadAll() } catch (e) { throw new RefreshError('La operación se guardó correctamente en Oracle, pero no se pudo actualizar la vista: ' + (e as Error).message) }
}
const call = async (proc: string, args: any[]) => { await exec(proc, args); await refresh(); return [] as string[] }

export async function spLogin(username: string, passHash: string) {
  try { return await req('/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password_hash: passHash }) }) }
  catch (e) { if ((e as Error).message.startsWith('Credenciales')) return null; throw e }
}

// ---- Mantenedores: columnas (sin la clave) en el orden de los parametros de INSERTAR_/ACTUALIZAR_
const COLS: Partial<Record<T, string[]>> = {
  ROL: ['NOMBRE_ROL'], PERSONAL: ['RUT', 'NOMBRE', 'CARGO', 'ESTADO'], CLIENTE: ['RUT', 'RAZON_SOCIAL', 'CONTACTO', 'EMAIL', 'TELEFONO'],
  PROVEEDOR: ['RUT', 'RAZON_SOCIAL', 'CONTACTO', 'TELEFONO'], VEHICULO: ['PATENTE', 'TIPO', 'ESTADO'], TIPO_TRABAJO: ['NOMBRE', 'DESCRIPCION'],
  CATEGORIA_ITEM: ['NOMBRE', 'ES_RETORNABLE'], FAENA: ['ID_CLIENTE', 'NOMBRE', 'UBICACION'],
  ITEM: ['ID_CATEGORIA', 'NOMBRE', 'DIMENSION', 'UNIDAD', 'ES_IDENTIFICABLE'],
  UNIDAD_EQUIPO: ['ID_ITEM', 'CODIGO', 'NRO_SERIE', 'ESTADO', 'FECHA_PROXIMA_CALIBRACION'],
  USUARIO: ['ID_ROL', 'ID_PERSONAL', 'USERNAME', 'PASSWORD_HASH', 'ESTADO'], PLANTILLA_ITEM: ['CANTIDAD_ESTANDAR'],
}
const nn = (v: any) => (v === undefined || v === '' ? null : v)

export const insertRow = (t: T, v: Row) =>
  call('INSERTAR_' + t, [...(PK[t].length > 1 ? PK[t].map((k) => v[k]) : []), ...COLS[t]!.map((c) => nn(v[c]))])
export const updateRow = (t: T, key: Row, v: Row) =>
  call('ACTUALIZAR_' + t, [...PK[t].map((k) => key[k]), ...COLS[t]!.map((c) => nn(v[c]))])
export const deleteRow = (t: T, key: Row) => call('ELIMINAR_' + t, PK[t].map((k) => key[k]))

// ---- Gestores (cada uno es un procedimiento de Oracle)
export const crearOtConChecklist = (p: { id_faena: number; id_tipo_trabajo: number; id_vehiculo: number; id_supervisor: number; id_maestro: number; nro_ot: string; fecha_retorno_prevista: string | null }, _items?: unknown) =>
  call('CREAR_OT_CON_CHECKLIST', [p.id_faena, p.id_tipo_trabajo, p.id_vehiculo, p.id_supervisor, p.id_maestro, p.nro_ot, p.fecha_retorno_prevista])
export const verificarDespacharItem = (id: number, unidad: number | null, cant: number, obs: string | null) =>
  call('VERIFICAR_DESPACHAR_ITEM', [id, unidad, cant, obs])
export const confirmarSalidaOt = (id: number) => call('CONFIRMAR_SALIDA_OT', [id])
export const registrarRetornoLote = async (rows: { id: number; cant: number; obs: string | null }[]) => {
  try { for (const r of rows) await exec('REGISTRAR_RETORNO_ITEM', [r.id, r.cant, r.obs]) }
  catch (e) { await loadAll().catch(() => {}); throw e } // algunos ítems pudieron quedar registrados
  await refresh()
  return [] as string[]
}
export const cerrarOrdenTrabajo = (id: number) => call('CERRAR_ORDEN_TRABAJO', [id])
export const registrarMantencion = (p: { id_unidad: number; tipo: string; fecha_proxima: string | null; observacion: string | null; estado_equipo: string }) =>
  call('REGISTRAR_MANTENCION', [p.id_unidad, p.tipo, p.fecha_proxima, p.observacion, p.estado_equipo])
export const generarReqCompra = (idDetalle: number, idProveedor: number) => call('GENERAR_REQ_COMPRA', [idDetalle, idProveedor])
export const actualizarEstadoCompra = (id: number, estado: string) => call('ACTUALIZAR_ESTADO_COMPRA', [id, estado])
export const marcarAlertaAtendida = (id: number) => call('ATENDER_ALERTA', [id])

// ---- Solo para mostrar en pantalla (misma formula que FN_POR_DESPACHAR / FN_NO_RETORNADO de Oracle)
export const itemEsRetornable = (d: DB, det: Row) => {
  const item = d.ITEM.find((i) => i.ID_ITEM === det.ID_ITEM)
  return d.CATEGORIA_ITEM.find((c) => c.ID_CATEGORIA === item?.ID_CATEGORIA)?.ES_RETORNABLE === 'S'
}
export const fnPorDespachar = (det: Row) => (det.CANTIDAD_REQUERIDA ?? 0) - (det.CANTIDAD_DESPACHADA ?? 0)
export const fnNoRetornado = (d: DB, det: Row, retornada = det.CANTIDAD_RETORNADA) =>
  itemEsRetornable(d, det) ? (det.CANTIDAD_DESPACHADA ?? 0) - (retornada ?? 0) : 0
// Base de datos en memoria que replica el esquema Oracle (18 tablas), sus procedimientos y triggers.
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

// [tabla hija, columna, tabla padre, nombre de la restricción]
const FKS: [T, string, T, string][] = [
  ['USUARIO', 'ID_ROL', 'ROL', 'FK_USUARIO_ROL'], ['USUARIO', 'ID_PERSONAL', 'PERSONAL', 'FK_USUARIO_PERSONAL'],
  ['FAENA', 'ID_CLIENTE', 'CLIENTE', 'FK_FAENA_CLIENTE'], ['ITEM', 'ID_CATEGORIA', 'CATEGORIA_ITEM', 'FK_ITEM_CATEGORIA'],
  ['UNIDAD_EQUIPO', 'ID_ITEM', 'ITEM', 'FK_UNIDAD_ITEM'],
  ['PLANTILLA_ITEM', 'ID_TIPO_TRABAJO', 'TIPO_TRABAJO', 'FK_PLANTILLA_TIPO_TRABAJO'], ['PLANTILLA_ITEM', 'ID_ITEM', 'ITEM', 'FK_PLANTILLA_ITEM'],
  ['ORDEN_TRABAJO', 'ID_FAENA', 'FAENA', 'FK_OT_FAENA'], ['ORDEN_TRABAJO', 'ID_TIPO_TRABAJO', 'TIPO_TRABAJO', 'FK_OT_TIPO_TRABAJO'],
  ['ORDEN_TRABAJO', 'ID_VEHICULO', 'VEHICULO', 'FK_OT_VEHICULO'], ['ORDEN_TRABAJO', 'ID_SUPERVISOR', 'PERSONAL', 'FK_OT_SUPERVISOR'],
  ['ORDEN_TRABAJO', 'ID_MAESTRO', 'PERSONAL', 'FK_OT_MAESTRO'], ['MANTENCION', 'ID_UNIDAD', 'UNIDAD_EQUIPO', 'FK_MANTENCION_UNIDAD'],
  ['CHECKLIST_DETALLE', 'ID_OT', 'ORDEN_TRABAJO', 'FK_CHECKLIST_OT'], ['CHECKLIST_DETALLE', 'ID_ITEM', 'ITEM', 'FK_CHECKLIST_ITEM'],
  ['CHECKLIST_DETALLE', 'ID_UNIDAD', 'UNIDAD_EQUIPO', 'FK_CHECKLIST_UNIDAD'], ['ALERTA', 'ID_OT', 'ORDEN_TRABAJO', 'FK_ALERTA_OT'],
  ['ALERTA', 'ID_UNIDAD', 'UNIDAD_EQUIPO', 'FK_ALERTA_UNIDAD'], ['REQ_COMPRA', 'ID_DETALLE', 'CHECKLIST_DETALLE', 'FK_REQ_DETALLE'],
  ['REQ_COMPRA', 'ID_PROVEEDOR', 'PROVEEDOR', 'FK_REQ_PROVEEDOR'],
]

export const hash = (s: string) => 'sha$' + btoa(unescape(encodeURIComponent(s)))
const nowTs = () => new Date().toISOString().slice(0, 19)
const D = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10)

function seed(): DB {
  const per = (id: number, rut: string, nombre: string, cargo: string) => ({ ID_PERSONAL: id, RUT: rut, NOMBRE: nombre, CARGO: cargo, ESTADO: 'A' })
  const un = (id: number, it: number, cod: string, serie: string, est: string, cal: string) => ({ ID_UNIDAD: id, ID_ITEM: it, CODIGO: cod, NRO_SERIE: serie, ESTADO: est, FECHA_PROXIMA_CALIBRACION: cal })
  const it = (id: number, cat: number, n: string, dim: string | null, u: string, ident: string) => ({ ID_ITEM: id, ID_CATEGORIA: cat, NOMBRE: n, DIMENSION: dim, UNIDAD: u, ES_IDENTIFICABLE: ident })
  const det = (id: number, ot: number, item: number, uni: number | null, req: number, desp: number, ret: number, est: string, ver: string) => ({
    ID_DETALLE: id, ID_OT: ot, ID_ITEM: item, ID_UNIDAD: uni, CANTIDAD_REQUERIDA: req, CANTIDAD_DESPACHADA: desp, CANTIDAD_RETORNADA: ret,
    ESTADO_ITEM: est, OBSERVACION: null, VERIFICADO: ver, FECHA_VERIFICACION: ver === 'S' ? D(-6) : null,
  })
  const ot = (id: number, faena: number, tipo: number, veh: number, sup: number, mae: number, nro: string, sal: string, prev: string, ret: string | null, est: string) => ({
    ID_OT: id, ID_FAENA: faena, ID_TIPO_TRABAJO: tipo, ID_VEHICULO: veh, ID_SUPERVISOR: sup, ID_MAESTRO: mae, NRO_OT: nro,
    FECHA_SALIDA: sal, FECHA_RETORNO_PREVISTA: prev, FECHA_RETORNO: ret, ESTADO: est,
  })
  const pw = hash('sercobelt2026')
  return {
    ROL: [{ ID_ROL: 1, NOMBRE_ROL: 'Administrador' }, { ID_ROL: 2, NOMBRE_ROL: 'Jefe de Bodega' }, { ID_ROL: 3, NOMBRE_ROL: 'Supervisor' }, { ID_ROL: 4, NOMBRE_ROL: 'Gerencia' }],
    PERSONAL: [
      per(1, '10.234.567-8', 'Marcela Fuentes', 'Administradora'), per(2, '11.345.678-9', 'Pedro Alarcón', 'Jefe de Bodega'),
      per(3, '12.456.789-0', 'Carlos Muñoz', 'Supervisor'), per(4, '13.567.890-1', 'Andrea Rojas', 'Supervisor'),
      per(5, '14.678.901-2', 'Luis Pizarro', 'Maestro empalmador'), per(6, '15.789.012-3', 'Jorge Contreras', 'Maestro empalmador'),
      per(7, '9.890.123-4', 'Ricardo Vega', 'Gerente General'),
    ],
    USUARIO: [
      { ID_USUARIO: 1, ID_ROL: 1, ID_PERSONAL: 1, USERNAME: 'mfuentes', PASSWORD_HASH: pw, ESTADO: 'A' },
      { ID_USUARIO: 2, ID_ROL: 2, ID_PERSONAL: 2, USERNAME: 'palarcon', PASSWORD_HASH: pw, ESTADO: 'A' },
      { ID_USUARIO: 3, ID_ROL: 3, ID_PERSONAL: 3, USERNAME: 'cmunoz', PASSWORD_HASH: pw, ESTADO: 'A' },
      { ID_USUARIO: 4, ID_ROL: 4, ID_PERSONAL: 7, USERNAME: 'rvega', PASSWORD_HASH: pw, ESTADO: 'A' },
    ],
    CLIENTE: [
      { ID_CLIENTE: 1, RUT: '79.587.210-8', RAZON_SOCIAL: 'Minera Escondida Ltda.', CONTACTO: 'Daniela Soto', EMAIL: 'contratos@escondida.cl', TELEFONO: '+56 55 2 123456' },
      { ID_CLIENTE: 2, RUT: '76.123.456-K', RAZON_SOCIAL: 'Minera Spence S.A.', CONTACTO: 'Marcos Peña', EMAIL: 'abastecimiento@spence.cl', TELEFONO: '+56 55 2 654321' },
      { ID_CLIENTE: 3, RUT: '96.800.570-7', RAZON_SOCIAL: 'Cía. Minera Doña Inés de Collahuasi', CONTACTO: 'Paula Rivas', EMAIL: 'compras@collahuasi.cl', TELEFONO: '+56 57 2 400100' },
    ],
    PROVEEDOR: [
      { ID_PROVEEDOR: 1, RUT: '77.001.002-3', RAZON_SOCIAL: 'Gomas Industriales SpA', CONTACTO: 'Hugo Lara', TELEFONO: '+56 2 2345 6789' },
      { ID_PROVEEDOR: 2, RUT: '76.998.877-1', RAZON_SOCIAL: 'Seguridad Norte Ltda.', CONTACTO: 'Sonia Vera', TELEFONO: '+56 55 2 998877' },
    ],
    VEHICULO: [
      { ID_VEHICULO: 1, PATENTE: 'KLBT42', TIPO: 'Camioneta 4x4', ESTADO: 'A' },
      { ID_VEHICULO: 2, PATENTE: 'RTYZ18', TIPO: 'Camión 3/4', ESTADO: 'A' },
      { ID_VEHICULO: 3, PATENTE: 'HDWP77', TIPO: 'Camioneta 4x4', ESTADO: 'I' },
    ],
    TIPO_TRABAJO: [
      { ID_TIPO_TRABAJO: 1, NOMBRE: 'Empalme en caliente', DESCRIPCION: 'Vulcanizado con plato y prensa' },
      { ID_TIPO_TRABAJO: 2, NOMBRE: 'Empalme en frío', DESCRIPCION: 'Unión con adhesivo de contacto' },
      { ID_TIPO_TRABAJO: 3, NOMBRE: 'Reparación de correa', DESCRIPCION: 'Parches y reparación de cortes' },
    ],
    CATEGORIA_ITEM: [
      { ID_CATEGORIA: 1, NOMBRE: 'Equipos', ES_RETORNABLE: 'S' }, { ID_CATEGORIA: 2, NOMBRE: 'Herramientas', ES_RETORNABLE: 'S' },
      { ID_CATEGORIA: 3, NOMBRE: 'Insumos', ES_RETORNABLE: 'N' }, { ID_CATEGORIA: 4, NOMBRE: 'EPP', ES_RETORNABLE: 'S' },
    ],
    FAENA: [
      { ID_FAENA: 1, ID_CLIENTE: 1, NOMBRE: 'Minera Escondida', UBICACION: 'Antofagasta' },
      { ID_FAENA: 2, ID_CLIENTE: 2, NOMBRE: 'Spence', UBICACION: 'Sierra Gorda, Antofagasta' },
      { ID_FAENA: 3, ID_CLIENTE: 3, NOMBRE: 'Collahuasi', UBICACION: 'Pozo Almonte, Tarapacá' },
    ],
    ITEM: [
      it(1, 1, 'Plato Vulcanizador', '1200 x 600 mm', 'UN', 'S'), it(2, 1, 'Generador', '10 kVA', 'UN', 'S'), it(3, 1, 'Prensa Hidráulica', '50 ton', 'UN', 'S'),
      it(4, 2, 'Cuchillo de empalme', null, 'UN', 'N'), it(5, 3, 'Cemento de contacto', 'Tarro 1 gal', 'TARRO', 'N'),
      it(6, 3, 'Banda cruda', '10 mm', 'M', 'N'), it(7, 4, 'Arnés de seguridad', null, 'UN', 'N'), it(8, 2, 'Rodillo de presión', null, 'UN', 'N'),
    ],
    UNIDAD_EQUIPO: [
      un(1, 1, 'PV-001', 'SN-884120', 'En bodega', D(120)), un(2, 1, 'PV-002', 'SN-884121', 'En terreno', D(60)), un(3, 1, 'PV-003', 'SN-884122', 'En bodega', D(200)),
      un(4, 2, 'GEN-003', 'GX-220931', 'En terreno', D(150)), un(5, 2, 'GEN-004', 'GX-220940', 'En bodega', D(90)),
      un(6, 3, 'PRE-004', 'HP-550012', 'En mantención', D(-12)), un(7, 3, 'PRE-005', 'HP-550013', 'En bodega', D(300)), un(8, 2, 'GEN-006', 'GX-220990', 'De baja', D(-90)),
    ],
    PLANTILLA_ITEM: [
      ...[[1, 1], [2, 1], [4, 4], [5, 12], [7, 6]].map(([i, c]) => ({ ID_TIPO_TRABAJO: 1, ID_ITEM: i, CANTIDAD_ESTANDAR: c })),
      ...[[4, 4], [5, 20], [6, 10], [8, 3]].map(([i, c]) => ({ ID_TIPO_TRABAJO: 2, ID_ITEM: i, CANTIDAD_ESTANDAR: c })),
      ...[[4, 2], [5, 6], [6, 5]].map(([i, c]) => ({ ID_TIPO_TRABAJO: 3, ID_ITEM: i, CANTIDAD_ESTANDAR: c })),
    ],
    ORDEN_TRABAJO: [
      ot(1, 2, 2, 2, 4, 6, 'OT-2025-118', D(-25), D(-20), D(-20), 'Cerrada'),
      ot(2, 1, 1, 1, 3, 5, 'OT-2026-001', D(-6), D(-1), null, 'En terreno'),
      ot(3, 1, 1, 2, 3, 6, 'OT-2026-002', nowTs(), D(4), null, 'Borrador'),
    ],
    MANTENCION: [{ ID_MANTENCION: 1, ID_UNIDAD: 6, TIPO: 'Mantención', FECHA: D(-10), FECHA_PROXIMA: null, OBSERVACION: 'Cambio de sellos del cilindro hidráulico' }],
    CHECKLIST_DETALLE: [
      det(1, 1, 4, null, 4, 4, 4, 'Retornado', 'S'), det(2, 1, 5, null, 20, 20, 0, 'Consumido', 'S'), det(3, 1, 6, null, 10, 10, 0, 'Consumido', 'S'), det(4, 1, 8, null, 3, 3, 3, 'Retornado', 'S'),
      det(5, 2, 1, 2, 1, 1, 0, 'Despachado', 'S'), det(6, 2, 2, 4, 1, 1, 0, 'Despachado', 'S'), det(7, 2, 4, null, 4, 4, 0, 'Despachado', 'S'),
      det(8, 2, 5, null, 12, 12, 0, 'Despachado', 'S'), det(9, 2, 7, null, 6, 6, 0, 'Despachado', 'S'),
      det(10, 3, 1, null, 1, 0, 0, 'Pendiente', 'N'), det(11, 3, 2, null, 1, 0, 0, 'Pendiente', 'N'), det(12, 3, 4, null, 4, 0, 0, 'Pendiente', 'N'),
      det(13, 3, 5, null, 12, 0, 0, 'Pendiente', 'N'), det(14, 3, 7, null, 6, 0, 0, 'Pendiente', 'N'),
    ],
    ALERTA: [
      { ID_ALERTA: 1, ID_OT: 2, ID_UNIDAD: null, TIPO: 'Retorno atrasado', MENSAJE: 'Retorno atrasado OT-2026-001', FECHA: D(-1) + 'T08:00:00', ATENDIDA: 'N' },
      { ID_ALERTA: 2, ID_OT: null, ID_UNIDAD: 6, TIPO: 'Calibración vencida', MENSAJE: 'Calibración vencida Prensa #04', FECHA: D(-2) + 'T09:30:00', ATENDIDA: 'N' },
      { ID_ALERTA: 3, ID_OT: null, ID_UNIDAD: 8, TIPO: 'Calibración vencida', MENSAJE: 'El equipo GEN-006 tiene su fecha de calibración vencida.', FECHA: D(-30) + 'T10:00:00', ATENDIDA: 'S' },
    ],
    REQ_COMPRA: [{ ID_REQUERIMIENTO: 1, ID_DETALLE: 2, ID_PROVEEDOR: 1, CANTIDAD: 5, ESTADO: 'Recibido', FECHA: D(-22) }],
    BITACORA: [
      { ID_BITACORA: 1, TABLA: 'ORDEN_TRABAJO', OPERACION: 'INSERT', ID_REGISTRO: 2, VALOR_ANTERIOR: null, VALOR_NUEVO: 'OT-2026-001 - Borrador', USUARIO_BD: 'SERCOBELT', FECHA: D(-7) + 'T15:10:00' },
      { ID_BITACORA: 2, TABLA: 'ORDEN_TRABAJO', OPERACION: 'UPDATE', ID_REGISTRO: 2, VALOR_ANTERIOR: 'Borrador', VALOR_NUEVO: 'En terreno', USUARIO_BD: 'SERCOBELT', FECHA: D(-6) + 'T07:45:00' },
      { ID_BITACORA: 3, TABLA: 'ORDEN_TRABAJO', OPERACION: 'INSERT', ID_REGISTRO: 3, VALOR_ANTERIOR: null, VALOR_NUEVO: 'OT-2026-002 - Borrador', USUARIO_BD: 'SERCOBELT', FECHA: nowTs() },
    ],
  }
}

let db: DB = seed()
const seqs: Partial<Record<T, number>> = {}
const subs = new Set<() => void>()
let fired: string[] = []
export const useDB = () => useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f) } }, () => db)

const nextId = (d: DB, t: T) => {
  const col = PK[t][0]
  seqs[t] = Math.max(seqs[t] ?? 0, ...d[t].map((r) => r[col])) + 1
  return seqs[t]!
}

// Ejecuta una operación como transacción: si lanza error se hace ROLLBACK. Devuelve los triggers disparados.
function tx(fn: (d: DB) => void): string[] {
  fired = []
  const next = structuredClone(db)
  try { fn(next) } catch (e) { fired = []; throw e }
  db = next
  subs.forEach((s) => s())
  return fired
}

const find = (d: DB, t: T, id: number) => d[t].find((r) => r[PK[t][0]] === id)!

function checkFks(d: DB, t: T, row: Row) {
  for (const [c, col, p, name] of FKS)
    if (c === t && row[col] != null && !d[p].some((r) => r[PK[p][0]] === row[col]))
      throw new Error(`ORA-02291: restricción de integridad (${name}) violada - clave principal no encontrada`)
}

function addAlerta(d: DB, a: { ID_OT: number | null; ID_UNIDAD: number | null; TIPO: string; MENSAJE: string }) {
  const id = nextId(d, 'ALERTA')
  d.ALERTA.push({ ID_ALERTA: id, ...a, FECHA: nowTs(), ATENDIDA: 'N' })
  return id
}

// ---- TRIGGER _ALERTA_CALIBRACION
function trgCalibracion(d: DB, u: Row) {
  if (u.FECHA_PROXIMA_CALIBRACION && u.FECHA_PROXIMA_CALIBRACION < nowTs()) {
    const id = addAlerta(d, { ID_OT: null, ID_UNIDAD: u.ID_UNIDAD, TIPO: 'Calibración vencida', MENSAJE: `El equipo ${u.CODIGO} tiene su fecha de calibración vencida.` })
    fired.push(`_ALERTA_CALIBRACION: alerta #${id} "Calibración vencida" para ${u.CODIGO}`)
  }
}

// ---- TRIGGERS de CHECKLIST_DETALLE (VALIDAR_EQUIPO_BODEGA, ESTADO_UNIDAD_EQUIPO, _ALERTA_RETORNO_INCOMPLETO)
function updDetalle(d: DB, id: number, patch: Row) {
  const row = find(d, 'CHECKLIST_DETALLE', id)
  const old = { ...row }
  const nw = { ...row, ...patch }
  const cols = Object.keys(patch)
  if ((cols.includes('ID_UNIDAD') || cols.includes('ESTADO_ITEM')) && nw.ID_UNIDAD != null && ['Despachado', 'Faltante'].includes(nw.ESTADO_ITEM)) {
    if (old.ID_UNIDAD == null || old.ID_UNIDAD !== nw.ID_UNIDAD || old.ESTADO_ITEM === 'Pendiente') {
      const u = find(d, 'UNIDAD_EQUIPO', nw.ID_UNIDAD)
      if (u.ESTADO !== 'En bodega') throw new Error('ORA-20001: El equipo seleccionado no está disponible en bodega.')
    }
  }
  Object.assign(row, patch)
  if ((cols.includes('ID_UNIDAD') || cols.includes('ESTADO_ITEM')) && nw.ID_UNIDAD != null) {
    const u = find(d, 'UNIDAD_EQUIPO', nw.ID_UNIDAD)
    if (['Despachado', 'Faltante'].includes(nw.ESTADO_ITEM) && old.ESTADO_ITEM === 'Pendiente') {
      u.ESTADO = 'En terreno'
      fired.push(`ESTADO_UNIDAD_EQUIPO: ${u.CODIGO} → "En terreno"`)
    } else if (nw.ESTADO_ITEM === 'Retornado') {
      u.ESTADO = 'En bodega'
      fired.push(`ESTADO_UNIDAD_EQUIPO: ${u.CODIGO} → "En bodega"`)
    }
  }
  if ((cols.includes('CANTIDAD_RETORNADA') || cols.includes('ESTADO_ITEM')) && nw.ESTADO_ITEM === 'Faltante' && nw.CANTIDAD_RETORNADA != null) {
    const aid = addAlerta(d, { ID_OT: nw.ID_OT, ID_UNIDAD: nw.ID_UNIDAD, TIPO: 'Faltante', MENSAJE: `Retorno incompleto en el detalle ID ${nw.ID_DETALLE}` })
    fired.push(`_ALERTA_RETORNO_INCOMPLETO: alerta #${aid} "Faltante" (detalle ${nw.ID_DETALLE})`)
  }
}

// ---- TRIGGERS de ORDEN_TRABAJO (TRG_VALIDAR_CIERRE_OT, TRG_BITACORA_OT)
function bitacora(d: DB, op: string, id: number, ant: string | null, nue: string | null) {
  d.BITACORA.push({ ID_BITACORA: nextId(d, 'BITACORA'), TABLA: 'ORDEN_TRABAJO', OPERACION: op, ID_REGISTRO: id, VALOR_ANTERIOR: ant, VALOR_NUEVO: nue, USUARIO_BD: 'SERCOBELT', FECHA: nowTs() })
  fired.push(`TRG_BITACORA_OT: ${op} registrado en BITACORA`)
}
function updOT(d: DB, id: number, patch: Row) {
  const row = find(d, 'ORDEN_TRABAJO', id)
  const old = { ...row }
  if (patch.ESTADO === 'Cerrada' && old.ESTADO !== 'Cerrada') {
    const n = d.CHECKLIST_DETALLE.filter((x) => x.ID_OT === id && ['Pendiente', 'Despachado'].includes(x.ESTADO_ITEM)).length
    if (n > 0) throw new Error('ORA-20002: No se puede cerrar la orden: aún existen ítems sin conciliar.')
  }
  Object.assign(row, patch)
  bitacora(d, 'UPDATE', id, old.ESTADO, row.ESTADO)
}

// ---- Funciones de cálculo
const esRetornable = (d: DB, det: Row) => find(d, 'CATEGORIA_ITEM', find(d, 'ITEM', det.ID_ITEM).ID_CATEGORIA).ES_RETORNABLE === 'S'
export const fnPorDespachar = (det: Row) => (det.CANTIDAD_REQUERIDA ?? 0) - (det.CANTIDAD_DESPACHADA ?? 0)
export const fnNoRetornado = (d: DB, det: Row, retornada = det.CANTIDAD_RETORNADA) =>
  esRetornable(d, det) ? (det.CANTIDAD_DESPACHADA ?? 0) - (retornada ?? 0) : 0
export const itemEsRetornable = esRetornable

// ---- CRUD genérico de mantenedores (INSERTAR_/ACTUALIZAR_/ELIMINAR_)
export const insertRow = (t: T, v: Row) => tx((d) => {
  const row = { ...v }
  if (PK[t].length === 1) row[PK[t][0]] = nextId(d, t)
  else if (d[t].some((r) => PK[t].every((k) => r[k] === row[k]))) throw new Error('ORA-00001: restricción única violada - la clave ya existe')
  checkFks(d, t, row)
  d[t].push(row)
  if (t === 'UNIDAD_EQUIPO') trgCalibracion(d, row)
})
export const updateRow = (t: T, key: Row, v: Row) => tx((d) => {
  const row = d[t].find((r) => PK[t].every((k) => r[k] === key[k]))!
  const nw = { ...row, ...v }
  checkFks(d, t, nw)
  Object.assign(row, v)
  if (t === 'UNIDAD_EQUIPO') trgCalibracion(d, row)
})
export const deleteRow = (t: T, key: Row) => tx((d) => {
  const col = PK[t][0]
  for (const [c, cc, p, name] of FKS)
    if (p === t && d[c].some((r) => r[cc] === key[col]))
      throw new Error(`ORA-02292: restricción de integridad (${name}) violada - registro secundario encontrado en ${c}`)
  d[t] = d[t].filter((r) => !PK[t].every((k) => r[k] === key[k]))
})

// ---- Procedimientos de negocio
export const crearOtConChecklist = (p: { id_faena: number; id_tipo_trabajo: number; id_vehiculo: number; id_supervisor: number; id_maestro: number; nro_ot: string; fecha_retorno_prevista: string | null }, items: { ID_ITEM: number; CANTIDAD: number }[]) => tx((d) => {
  const id = nextId(d, 'ORDEN_TRABAJO')
  const row = { ID_OT: id, ID_FAENA: p.id_faena, ID_TIPO_TRABAJO: p.id_tipo_trabajo, ID_VEHICULO: p.id_vehiculo, ID_SUPERVISOR: p.id_supervisor, ID_MAESTRO: p.id_maestro, NRO_OT: p.nro_ot, FECHA_SALIDA: nowTs(), FECHA_RETORNO_PREVISTA: p.fecha_retorno_prevista, FECHA_RETORNO: null, ESTADO: 'Borrador' }
  checkFks(d, 'ORDEN_TRABAJO', row)
  d.ORDEN_TRABAJO.push(row)
  bitacora(d, 'INSERT', id, null, `${row.NRO_OT} - ${row.ESTADO}`)
  for (const i of items)
    d.CHECKLIST_DETALLE.push({ ID_DETALLE: nextId(d, 'CHECKLIST_DETALLE'), ID_OT: id, ID_ITEM: i.ID_ITEM, ID_UNIDAD: null, CANTIDAD_REQUERIDA: i.CANTIDAD, CANTIDAD_DESPACHADA: 0, CANTIDAD_RETORNADA: 0, ESTADO_ITEM: 'Pendiente', OBSERVACION: null, VERIFICADO: 'N', FECHA_VERIFICACION: null })
})
export const verificarDespacharItem = (id: number, unidad: number | null, cant: number, obs: string | null) => tx((d) => {
  const det = find(d, 'CHECKLIST_DETALLE', id)
  updDetalle(d, id, { ID_UNIDAD: unidad, CANTIDAD_DESPACHADA: cant, ESTADO_ITEM: cant >= det.CANTIDAD_REQUERIDA ? 'Despachado' : 'Faltante', OBSERVACION: obs, VERIFICADO: 'S', FECHA_VERIFICACION: nowTs() })
})
export const confirmarSalidaOt = (id: number) => tx((d) => updOT(d, id, { ESTADO: 'En terreno', FECHA_SALIDA: nowTs() }))
export const registrarRetornoItem = (id: number, cant: number, obs: string | null) => tx((d) => {
  const det = find(d, 'CHECKLIST_DETALLE', id)
  const est = !esRetornable(d, det) ? 'Consumido' : cant >= det.CANTIDAD_DESPACHADA ? 'Retornado' : 'Faltante'
  updDetalle(d, id, { CANTIDAD_RETORNADA: cant, ESTADO_ITEM: est, OBSERVACION: obs })
})
export const registrarRetornoLote = (rows: { id: number; cant: number; obs: string | null }[]) => tx((d) => {
  for (const r of rows) {
    const det = find(d, 'CHECKLIST_DETALLE', r.id)
    const est = !esRetornable(d, det) ? 'Consumido' : r.cant >= det.CANTIDAD_DESPACHADA ? 'Retornado' : 'Faltante'
    updDetalle(d, r.id, { CANTIDAD_RETORNADA: r.cant, ESTADO_ITEM: est, OBSERVACION: r.obs })
  }
})
export const cerrarOrdenTrabajo = (id: number) => tx((d) => {
  for (const det of d.CHECKLIST_DETALLE.filter((x) => x.ID_OT === id && !esRetornable(d, x))) updDetalle(d, det.ID_DETALLE, { ESTADO_ITEM: 'Consumido' })
  updOT(d, id, { ESTADO: 'Cerrada', FECHA_RETORNO: nowTs() })
})
export const registrarMantencion = (p: { id_unidad: number; tipo: string; fecha_proxima: string | null; observacion: string | null; estado_equipo: string }) => tx((d) => {
  d.MANTENCION.push({ ID_MANTENCION: nextId(d, 'MANTENCION'), ID_UNIDAD: p.id_unidad, TIPO: p.tipo, FECHA: nowTs().slice(0, 10), FECHA_PROXIMA: p.fecha_proxima, OBSERVACION: p.observacion })
  const u = find(d, 'UNIDAD_EQUIPO', p.id_unidad)
  u.ESTADO = p.estado_equipo
  if (p.fecha_proxima) { u.FECHA_PROXIMA_CALIBRACION = p.fecha_proxima; trgCalibracion(d, u) }
  if (p.estado_equipo === 'En bodega')
    for (const a of d.ALERTA.filter((x) => x.ID_UNIDAD === p.id_unidad && x.ATENDIDA === 'N')) a.ATENDIDA = 'S'
})
export const generarReqCompra = (idDetalle: number, idProveedor: number) => tx((d) => {
  const det = find(d, 'CHECKLIST_DETALLE', idDetalle)
  const falt = fnPorDespachar(det) + fnNoRetornado(d, det)
  if (falt > 0) d.REQ_COMPRA.push({ ID_REQUERIMIENTO: nextId(d, 'REQ_COMPRA'), ID_DETALLE: idDetalle, ID_PROVEEDOR: idProveedor, CANTIDAD: falt, ESTADO: 'Solicitado', FECHA: nowTs().slice(0, 10) })
})
export const actualizarEstadoCompra = (id: number, estado: string) => tx((d) => { find(d, 'REQ_COMPRA', id).ESTADO = estado })
export const marcarAlertaAtendida = (id: number) => tx((d) => { find(d, 'ALERTA', id).ATENDIDA = 'S' })

export function spLogin(username: string, passHash: string) {
  const u = db.USUARIO.find((x) => x.USERNAME === username && x.PASSWORD_HASH === passHash && x.ESTADO === 'A')
  return u ? { ...u, ROL: find(db, 'ROL', u.ID_ROL).NOMBRE_ROL, NOMBRE_PERSONA: u.ID_PERSONAL ? find(db, 'PERSONAL', u.ID_PERSONAL).NOMBRE : u.USERNAME } : null
}

// ---- Reportes (cursores)
export function reporteFueraBodega(d: DB) {
  const out: Row[] = []
  for (const x of d.CHECKLIST_DETALLE) {
    const fuera = fnNoRetornado(d, x)
    if (fuera <= 0) continue
    const o = find(d, 'ORDEN_TRABAJO', x.ID_OT), f = find(d, 'FAENA', o.ID_FAENA), u = x.ID_UNIDAD ? find(d, 'UNIDAD_EQUIPO', x.ID_UNIDAD) : null
    out.push({ CLIENTE: find(d, 'CLIENTE', f.ID_CLIENTE).RAZON_SOCIAL, FAENA: f.NOMBRE, NRO_OT: o.NRO_OT, ESTADO_OT: o.ESTADO, FECHA_SALIDA: o.FECHA_SALIDA, FECHA_RETORNO_PREVISTA: o.FECHA_RETORNO_PREVISTA, ITEM: find(d, 'ITEM', x.ID_ITEM).NOMBRE, CODIGO_EQUIPO: u?.CODIGO ?? null, NRO_SERIE: u?.NRO_SERIE ?? null, CANTIDAD_DESPACHADA: x.CANTIDAD_DESPACHADA, CANTIDAD_FUERA: fuera })
  }
  return out.sort((a, b) => (a.FECHA_SALIDA + a.NRO_OT).localeCompare(b.FECHA_SALIDA + b.NRO_OT))
}
export function reportePendientesFaltantes(d: DB) {
  const out: Row[] = []
  for (const x of d.CHECKLIST_DETALLE) {
    const pd = fnPorDespachar(x), nr = fnNoRetornado(d, x), item = find(d, 'ITEM', x.ID_ITEM), o = find(d, 'ORDEN_TRABAJO', x.ID_OT)
    const base = { NRO_OT: o.NRO_OT, ITEM: item.NOMBRE, UNIDAD: item.UNIDAD, POR_DESPACHAR: pd, NO_RETORNADO: nr }
    const rcs = d.REQ_COMPRA.filter((r) => r.ID_DETALLE === x.ID_DETALLE)
    for (const rc of rcs.length ? rcs : [null]) {
      if (pd > 0 || nr > 0 || (rc && ['Solicitado', 'Comprado'].includes(rc.ESTADO)))
        out.push({ ...base, CANTIDAD_COMPRA: rc?.CANTIDAD ?? null, ESTADO_COMPRA: rc?.ESTADO ?? null, PROVEEDOR: rc ? find(d, 'PROVEEDOR', rc.ID_PROVEEDOR).RAZON_SOCIAL : null })
    }
  }
  return out.sort((a, b) => (a.NRO_OT + a.ITEM).localeCompare(b.NRO_OT + b.ITEM))
}
export function reporteConsumoMensual(d: DB) {
  const g: Record<string, Row> = {}
  for (const x of d.CHECKLIST_DETALLE) {
    if (esRetornable(d, x) || x.ESTADO_ITEM !== 'Consumido') continue
    const o = find(d, 'ORDEN_TRABAJO', x.ID_OT), f = find(d, 'FAENA', o.ID_FAENA), item = find(d, 'ITEM', x.ID_ITEM)
    const r = { MES: String(o.FECHA_SALIDA).slice(0, 7), CLIENTE: find(d, 'CLIENTE', f.ID_CLIENTE).RAZON_SOCIAL, NRO_OT: o.NRO_OT, CATEGORIA: find(d, 'CATEGORIA_ITEM', item.ID_CATEGORIA).NOMBRE, ITEM: item.NOMBRE, UNIDAD: item.UNIDAD, TOTAL_CONSUMIDO: 0 }
    const k = Object.values(r).slice(0, 6).join('|')
    g[k] ??= r
    g[k].TOTAL_CONSUMIDO += x.CANTIDAD_DESPACHADA ?? 0
  }
  return Object.values(g).sort((a, b) => b.MES.localeCompare(a.MES) || a.CLIENTE.localeCompare(b.CLIENTE) || a.NRO_OT.localeCompare(b.NRO_OT))
}

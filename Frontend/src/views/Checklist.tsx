import { useState } from 'react'
import { Send } from 'lucide-react'
import { crearOtConChecklist, useDB, type DB } from '../db'
import { useApp } from '../ctx'
import { Badge, Field, btnPrimary, card, fmt, inputCls, th } from '../ui'

type Line = { ID_ITEM: number; CANTIDAD: number }
const plantilla = (db: DB, tipo: number): Line[] => db.PLANTILLA_ITEM.filter((p) => p.ID_TIPO_TRABAJO === tipo).map((p) => ({ ID_ITEM: p.ID_ITEM, CANTIDAD: p.CANTIDAD_ESTANDAR }))
const plusDays = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10)

export default function Checklist() {
  const db = useDB()
  const { act, go } = useApp()
  const activos = (t: 'VEHICULO' | 'PERSONAL') => db[t].filter((r) => r.ESTADO === 'A')
  const sup = activos('PERSONAL').filter((p) => /supervisor/i.test(p.CARGO))
  const mae = activos('PERSONAL').filter((p) => /maestro/i.test(p.CARGO))
  const [f, setF] = useState({
    nro: `OT-2026-${String(db.ORDEN_TRABAJO.length + 1).padStart(3, '0')}`,
    faena: db.FAENA[0]?.ID_FAENA, tipo: db.TIPO_TRABAJO[0]?.ID_TIPO_TRABAJO, veh: activos('VEHICULO')[0]?.ID_VEHICULO,
    sup: sup[0]?.ID_PERSONAL, mae: mae[0]?.ID_PERSONAL, ret: plusDays(3),
  })
  const [lines, setLines] = useState<Line[]>(() => plantilla(db, db.TIPO_TRABAJO[0]?.ID_TIPO_TRABAJO))
  const set = (k: string, v: any) => setF({ ...f, [k]: v })
  const item = (id: number) => db.ITEM.find((i) => i.ID_ITEM === id)!
  const num = (v: string) => Number(v)
  const sel = (k: string, rows: any[], pk: string, label: (r: any) => string) => (
    <select className={inputCls} value={(f as any)[k] ?? ''} onChange={(e) => set(k, num(e.target.value))}>{rows.map((r) => <option key={r[pk]} value={r[pk]}>{label(r)}</option>)}</select>
  )
  const guardar = async () => {
    const ok = await act('OT creada en estado Borrador (CREAR_OT_CON_CHECKLIST)', () => crearOtConChecklist({ id_faena: f.faena, id_tipo_trabajo: f.tipo, id_vehiculo: f.veh!, id_supervisor: f.sup!, id_maestro: f.mae!, nro_ot: f.nro, fecha_retorno_prevista: f.ret || null }, lines))
    if (ok) go('Verificación y Salida')
  }
  const valid = f.nro.trim() && f.veh && f.sup && f.mae && lines.length > 0 && lines.every((l) => l.CANTIDAD > 0)
  return (
    <div className="space-y-6">
      <section className={`${card} p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">ORDEN_TRABAJO</h2>
          <Badge estado="Borrador" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="NRO_OT *"><input className={inputCls} maxLength={20} value={f.nro} onChange={(e) => set('nro', e.target.value)} /></Field>
          <Field label="ID_FAENA *">{sel('faena', db.FAENA, 'ID_FAENA', (r) => r.NOMBRE)}</Field>
          <Field label="ID_TIPO_TRABAJO *">
            <select className={inputCls} value={f.tipo} onChange={(e) => { set('tipo', num(e.target.value)); setLines(plantilla(db, num(e.target.value))) }}>
              {db.TIPO_TRABAJO.map((t) => <option key={t.ID_TIPO_TRABAJO} value={t.ID_TIPO_TRABAJO}>{t.NOMBRE}</option>)}
            </select>
          </Field>
          <Field label="ID_VEHICULO * (PATENTE)">{sel('veh', activos('VEHICULO'), 'ID_VEHICULO', (r) => `${r.PATENTE} · ${r.TIPO}`)}</Field>
          <Field label="ID_SUPERVISOR *">{sel('sup', sup, 'ID_PERSONAL', (r) => r.NOMBRE)}</Field>
          <Field label="ID_MAESTRO *">{sel('mae', mae, 'ID_PERSONAL', (r) => r.NOMBRE)}</Field>
          <Field label="FECHA_RETORNO_PREVISTA"><input type="date" className={inputCls} value={f.ret} onChange={(e) => set('ret', e.target.value)} /></Field>
          <Field label="FECHA_SALIDA"><input disabled className={inputCls} value={fmt(new Date().toISOString())} /></Field>
        </div>
        <p className="mt-3 text-xs text-slate-500">El checklist se genera en Oracle desde PLANTILLAS_ITEMS (CANTIDAD_ESTANDAR) al ejecutar CREAR_OT_CON_CHECKLIST.</p>
      </section>
      <section className={card}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold">CHECKLIST_DETALLE <span className="ml-1 text-sm font-normal text-slate-500">({lines.length})</span></h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className={th}>ITEM</th><th className={th}>CATEGORIA</th><th className={th}>ID_UNIDAD / CODIGO</th><th className={th}>CANTIDAD_REQUERIDA</th><th className={th}>ESTADO_ITEM</th><th className={th} /></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((l) => {
              const it = item(l.ID_ITEM)
              return (
                <tr key={l.ID_ITEM} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{it.NOMBRE}{it.DIMENSION && <span className="ml-1 text-xs font-normal text-slate-500">{it.DIMENSION}</span>}</td>
                  <td className="px-4 py-3 text-slate-600">{db.CATEGORIA_ITEM.find((c) => c.ID_CATEGORIA === it.ID_CATEGORIA)?.NOMBRE}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{it.ES_IDENTIFICABLE === 'S' ? 'NULL — se asigna en verificación' : '—'}</td>
                  <td className="px-4 py-3">{l.CANTIDAD} <span className="text-xs text-slate-500">{it.UNIDAD}</span></td>
                  <td className="px-4 py-3"><Badge estado="Pendiente" /></td>
                  <td className="px-4 py-3" />
                </tr>
              )
            })}
            {!lines.length && <tr><td colSpan={6} className="py-10 text-center text-slate-500">Sin ítems. Agregue el primero.</td></tr>}
          </tbody>
        </table>
        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button className={btnPrimary} disabled={!valid} onClick={guardar}><Send size={16} />Guardar y Enviar a Verificación</button>
        </div>
      </section>
    </div>
  )
}
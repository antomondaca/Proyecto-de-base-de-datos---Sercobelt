import { useState } from 'react'
import { Wrench } from 'lucide-react'
import { registrarMantencion, useDB } from '../db'
import { useApp } from '../ctx'
import { Badge, DataTable, Field, btnPrimary, card, inputCls } from '../ui'

export default function Mantencion() {
  const db = useDB()
  const { act } = useApp()
  const [f, setF] = useState({ u: String(db.UNIDAD_EQUIPO[0]?.ID_UNIDAD ?? ''), tipo: 'Mantención', prox: '', obs: '', est: 'En mantención' })
  const set = (k: string, v: string) => setF({ ...f, [k]: v })
  const u = db.UNIDAD_EQUIPO.find((x) => x.ID_UNIDAD === Number(f.u))
  const hoy = new Date().toISOString().slice(0, 10)
  return (
    <div className="space-y-6">
      <section className={`${card} p-6`}>
        <h2 className="mb-4 font-semibold">Registrar mantención / calibración <span className="font-normal text-slate-500">(REGISTRAR_MANTENCION)</span></h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label="ID_UNIDAD *"><select className={inputCls} value={f.u} onChange={(e) => set('u', e.target.value)}>{db.UNIDAD_EQUIPO.map((x) => <option key={x.ID_UNIDAD} value={x.ID_UNIDAD}>{x.CODIGO} · {db.ITEM.find((i) => i.ID_ITEM === x.ID_ITEM)?.NOMBRE}</option>)}</select></Field>
          <Field label="TIPO *"><select className={inputCls} value={f.tipo} onChange={(e) => set('tipo', e.target.value)}><option>Mantención</option><option>Calibración</option></select></Field>
          <Field label="FECHA_PROXIMA"><input type="date" className={inputCls} value={f.prox} onChange={(e) => set('prox', e.target.value)} /></Field>
          <Field label="p_estado_equipo (ESTADO de UNIDAD_EQUIPO) *"><select className={inputCls} value={f.est} onChange={(e) => set('est', e.target.value)}>{['En bodega', 'En mantención', 'De baja'].map((s) => <option key={s}>{s}</option>)}</select></Field>
          <div className="col-span-2"><Field label="OBSERVACION"><input maxLength={250} className={inputCls} value={f.obs} onChange={(e) => set('obs', e.target.value)} /></Field></div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">Estado actual: {u && <Badge estado={u.ESTADO} />} · Próxima calibración: {u?.FECHA_PROXIMA_CALIBRACION ?? '—'}{u?.FECHA_PROXIMA_CALIBRACION && u.FECHA_PROXIMA_CALIBRACION < hoy && <span className="ml-2 font-medium text-red-600">vencida</span>}</div>
          <button className={btnPrimary} disabled={!u || u.ESTADO === 'En terreno'} title={u?.ESTADO === 'En terreno' ? 'El equipo está en terreno' : ''} onClick={() => act('Mantención registrada (REGISTRAR_MANTENCION)', () => registrarMantencion({ id_unidad: Number(f.u), tipo: f.tipo, fecha_proxima: f.prox || null, observacion: f.obs || null, estado_equipo: f.est }))}><Wrench size={16} />Registrar</button>
        </div>
      </section>
      <DataTable cols={['ID_MANTENCION', 'CODIGO', 'TIPO', 'FECHA', 'FECHA_PROXIMA', 'OBSERVACION']} rows={[...db.MANTENCION].reverse().map((m) => ({ ...m, CODIGO: db.UNIDAD_EQUIPO.find((x) => x.ID_UNIDAD === m.ID_UNIDAD)?.CODIGO }))} />
    </div>
  )
}

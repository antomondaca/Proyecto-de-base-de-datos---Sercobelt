import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { actualizarEstadoCompra, fnNoRetornado, fnPorDespachar, generarReqCompra, useDB } from '../db'
import { useApp } from '../ctx'
import { Badge, Field, btnPrimary, card, fmt, inputCls, th } from '../ui'

export default function Compra() {
  const db = useDB()
  const { act } = useApp()
  const cand = db.CHECKLIST_DETALLE.filter((d) => fnPorDespachar(d) + fnNoRetornado(db, d) > 0 && db.ORDEN_TRABAJO.find((o) => o.ID_OT === d.ID_OT)?.ESTADO !== 'Borrador')
  const [det, setDet] = useState('')
  const [prov, setProv] = useState(String(db.PROVEEDOR[0]?.ID_PROVEEDOR ?? ''))
  const lbl = (d: any) => `${db.ORDEN_TRABAJO.find((o) => o.ID_OT === d.ID_OT)?.NRO_OT} · ${db.ITEM.find((i) => i.ID_ITEM === d.ID_ITEM)?.NOMBRE}`
  const cur = det || String(cand[0]?.ID_DETALLE ?? '')
  const d = cand.find((x) => x.ID_DETALLE === Number(cur))
  return (
    <div className="space-y-6">
      <section className={`${card} p-6`}>
        <h2 className="mb-4 font-semibold">Nuevo requerimiento <span className="font-normal text-slate-500">(GENERAR_REQ_COMPRA)</span></h2>
        <div className="flex items-end gap-4">
          <div className="w-96"><Field label="ID_DETALLE (con faltante)"><select className={inputCls} value={cur} onChange={(e) => setDet(e.target.value)}>{cand.map((x) => <option key={x.ID_DETALLE} value={x.ID_DETALLE}>{lbl(x)}</option>)}</select></Field></div>
          <div className="w-64"><Field label="ID_PROVEEDOR"><select className={inputCls} value={prov} onChange={(e) => setProv(e.target.value)}>{db.PROVEEDOR.map((p) => <option key={p.ID_PROVEEDOR} value={p.ID_PROVEEDOR}>{p.RAZON_SOCIAL}</option>)}</select></Field></div>
          <div className="pb-2 text-sm text-slate-600">CANTIDAD = <b>{d ? fnPorDespachar(d) + fnNoRetornado(db, d) : 0}</b></div>
          <button className={btnPrimary} disabled={!d} onClick={() => act('Requerimiento generado en estado Solicitado', () => generarReqCompra(Number(cur), Number(prov)))}><ShoppingCart size={16} />Generar</button>
        </div>
      </section>
      <section className={`${card} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>{['ID_REQUERIMIENTO', 'ID_DETALLE', 'ID_PROVEEDOR', 'CANTIDAD', 'ESTADO', 'FECHA'].map((c) => <th key={c} className={th}>{c}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {db.REQ_COMPRA.map((r) => (
              <tr key={r.ID_REQUERIMIENTO}>
                <td className="px-4 py-3 font-mono text-xs">{r.ID_REQUERIMIENTO}</td>
                <td className="px-4 py-3">{lbl(db.CHECKLIST_DETALLE.find((x) => x.ID_DETALLE === r.ID_DETALLE))}</td>
                <td className="px-4 py-3">{db.PROVEEDOR.find((p) => p.ID_PROVEEDOR === r.ID_PROVEEDOR)?.RAZON_SOCIAL}</td>
                <td className="px-4 py-3">{r.CANTIDAD}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><Badge estado={r.ESTADO} />
                  <select className="rounded border border-slate-300 px-1 py-0.5 text-xs" value={r.ESTADO} onChange={(e) => act('Estado actualizado (ACTUALIZAR_ESTADO_COMPRA)', () => actualizarEstadoCompra(r.ID_REQUERIMIENTO, e.target.value))}>{['Solicitado', 'Comprado', 'Recibido'].map((s) => <option key={s}>{s}</option>)}</select></div></td>
                <td className="px-4 py-3">{fmt(r.FECHA)}</td>
              </tr>
            ))}
            {!db.REQ_COMPRA.length && <tr><td colSpan={6} className="py-10 text-center text-slate-500">Sin requerimientos.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  )
}

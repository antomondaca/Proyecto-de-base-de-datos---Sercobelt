import { useState } from 'react'
import { CheckCircle2, Lock } from 'lucide-react'
import { cerrarOrdenTrabajo, fnNoRetornado, itemEsRetornable, registrarRetornoLote, useDB } from '../db'
import { useApp } from '../ctx'
import { Badge, btnGhost, btnPrimary, card, fmt, inputCls, th } from '../ui'

export default function Retorno() {
  const db = useDB()
  const { act } = useApp()
  const ots = db.ORDEN_TRABAJO.filter((o) => o.ESTADO === 'En terreno')
  const [sel, setSel] = useState<number | null>(null)
  const [ret, setRet] = useState<Record<number, string>>({})
  const [obs, setObs] = useState<Record<number, string>>({})
  const ot = ots.find((o) => o.ID_OT === sel) ?? ots[0]
  if (!ot) return <div className={`${card} py-20 text-center text-slate-500`}>No hay órdenes En terreno pendientes de retorno.</div>
  const dets = db.CHECKLIST_DETALLE.filter((d) => d.ID_OT === ot.ID_OT)
  const val = (d: any) => ret[d.ID_DETALLE] ?? String(d.CANTIDAD_RETORNADA ?? 0)
  const pend = dets.filter((d) => !['Retornado', 'Consumido'].includes(d.ESTADO_ITEM))
  const faltantes = dets.filter((d) => fnNoRetornado(db, d, Number(val(d))) > 0).length
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select className={`${inputCls} w-72`} value={ot.ID_OT} onChange={(e) => setSel(Number(e.target.value))}>{ots.map((o) => <option key={o.ID_OT} value={o.ID_OT}>{o.NRO_OT}</option>)}</select>
          <span className="text-sm text-slate-600">Retorno previsto: {fmt(ot.FECHA_RETORNO_PREVISTA)}</span>
          <Badge estado={ot.ESTADO} />
        </div>
        <span className={`rounded-md px-3 py-1 text-sm font-medium ${faltantes ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{faltantes ? `${faltantes} ítem(s) con diferencia` : 'Sin diferencias'}</span>
      </div>
      <section className={`${card} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className={th}>ITEM</th><th className={th}>ID_UNIDAD (CODIGO)</th><th className={th}>CANTIDAD_DESPACHADA</th><th className={th}>CANTIDAD_RETORNADA</th><th className={th}>DIFERENCIA (FN_NO_RETORNADO)</th><th className={th}>OBSERVACION</th><th className={th}>ESTADO_ITEM</th></tr></thead>
          <tbody>
            {dets.map((d) => {
              const it = db.ITEM.find((i) => i.ID_ITEM === d.ID_ITEM)!
              const retornable = itemEsRetornable(db, d)
              const dif = fnNoRetornado(db, d, Number(val(d)))
              const cerrado = ['Retornado', 'Consumido'].includes(d.ESTADO_ITEM)
              return (
                <tr key={d.ID_DETALLE} className={`border-t border-slate-100 ${dif > 0 ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-medium">{it.NOMBRE}{!retornable && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">ES_RETORNABLE = N</span>}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{db.UNIDAD_EQUIPO.find((u) => u.ID_UNIDAD === d.ID_UNIDAD)?.CODIGO ?? '—'}</td>
                  <td className="px-4 py-3">{d.CANTIDAD_DESPACHADA}</td>
                  <td className="px-4 py-3">{retornable ? <input type="number" min={0} step="0.01" disabled={cerrado} value={val(d)} onChange={(e) => setRet({ ...ret, [d.ID_DETALLE]: e.target.value })} className={`${inputCls} w-24`} /> : <span className="text-slate-400">Se consume</span>}</td>
                  <td className={`px-4 py-3 font-semibold ${dif > 0 ? 'text-red-700' : 'text-green-700'}`}>{dif}{dif > 0 && ' (faltante)'}</td>
                  <td className="px-4 py-3"><input maxLength={250} disabled={cerrado} className={inputCls} value={obs[d.ID_DETALLE] ?? d.OBSERVACION ?? ''} onChange={(e) => setObs({ ...obs, [d.ID_DETALLE]: e.target.value })} /></td>
                  <td className="px-4 py-3"><Badge estado={d.ESTADO_ITEM} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button className={btnGhost} onClick={() => act(`${ot.NRO_OT} cerrada (CERRAR_ORDEN_TRABAJO)`, () => cerrarOrdenTrabajo(ot.ID_OT))}><Lock size={16} />Cerrar OT</button>
          <button className={btnPrimary} disabled={!pend.length} onClick={() => act('Retorno registrado (REGISTRAR_RETORNO_ITEM)', () => registrarRetornoLote(pend.map((d) => ({ id: d.ID_DETALLE, cant: Number(val(d)), obs: (obs[d.ID_DETALLE] ?? d.OBSERVACION) || null }))))}><CheckCircle2 size={16} />Registrar retorno</button>
        </div>
      </section>
    </div>
  )
}

import { useState } from 'react'
import { CheckCircle2, Truck } from 'lucide-react'
import { confirmarSalidaOt, useDB, verificarDespacharItem } from '../db'
import { useApp } from '../ctx'
import { Badge, btnPrimary, card, fmt, inputCls, th } from '../ui'

export default function Verificacion() {
  const db = useDB()
  const { act } = useApp()
  const ots = db.ORDEN_TRABAJO.filter((o) => o.ESTADO === 'Borrador').sort((a, b) => b.ID_OT - a.ID_OT)
  const [sel, setSel] = useState<number | null>(null)
  const [draft, setDraft] = useState<Record<number, { u?: string; c?: string; o?: string }>>({})
  const ot = ots.find((o) => o.ID_OT === sel) ?? ots[0]
  if (!ot) return <div className={`${card} py-20 text-center text-slate-500`}>No hay órdenes en estado Borrador pendientes de verificación.</div>
  const dets = db.CHECKLIST_DETALLE.filter((d) => d.ID_OT === ot.ID_OT)
  const todo = dets.every((d) => d.VERIFICADO === 'S')
  const faena = db.FAENA.find((f) => f.ID_FAENA === ot.ID_FAENA)
  const up = (id: number, p: object) => setDraft({ ...draft, [id]: { ...draft[id], ...p } })
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select className={`${inputCls} w-72`} value={ot.ID_OT} onChange={(e) => setSel(Number(e.target.value))}>{ots.map((o) => <option key={o.ID_OT} value={o.ID_OT}>{o.NRO_OT}</option>)}</select>
          <span className="text-sm text-slate-600">{faena?.NOMBRE} · {db.TIPO_TRABAJO.find((t) => t.ID_TIPO_TRABAJO === ot.ID_TIPO_TRABAJO)?.NOMBRE}</span>
          <Badge estado={ot.ESTADO} />
        </div>
        <button className={btnPrimary} disabled={!todo} title={todo ? '' : 'Verifique todos los ítems'} onClick={() => act(`Salida confirmada: ${ot.NRO_OT} en terreno (CONFIRMAR_SALIDA_OT)`, () => confirmarSalidaOt(ot.ID_OT))}><Truck size={16} />Confirmar salida de OT</button>
      </div>
      <section className={`${card} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className={th}>ITEM</th><th className={th}>ID_UNIDAD (CODIGO)</th><th className={th}>CANTIDAD_REQUERIDA</th><th className={th}>CANTIDAD_DESPACHADA</th><th className={th}>OBSERVACION</th><th className={th}>ESTADO_ITEM</th><th className={th}>VERIFICADO</th><th className={th} /></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {dets.map((d) => {
              const it = db.ITEM.find((i) => i.ID_ITEM === d.ID_ITEM)!
              const ver = d.VERIFICADO === 'S'
              const dr = draft[d.ID_DETALLE] ?? {}
              const unidades = db.UNIDAD_EQUIPO.filter((u) => u.ID_ITEM === d.ID_ITEM && u.ESTADO === 'En bodega')
              const cant = dr.c ?? String(d.CANTIDAD_REQUERIDA)
              const ident = it.ES_IDENTIFICABLE === 'S'
              const ok = !ident || Number(cant) === 0 || !!dr.u
              return (
                <tr key={d.ID_DETALLE}>
                  <td className="px-4 py-3 font-medium">{it.NOMBRE}</td>
                  <td className="px-4 py-3">
                    {ver ? <span className="font-mono text-xs font-semibold text-primary">{db.UNIDAD_EQUIPO.find((u) => u.ID_UNIDAD === d.ID_UNIDAD)?.CODIGO ?? '—'}</span>
                      : ident ? (
                        <select className={`${inputCls} w-48`} value={dr.u ?? ''} onChange={(e) => up(d.ID_DETALLE, { u: e.target.value })}>
                          <option value="">Seleccione equipo...</option>
                          {unidades.map((u) => <option key={u.ID_UNIDAD} value={u.ID_UNIDAD}>{u.CODIGO} · {u.NRO_SERIE}</option>)}
                        </select>
                      ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">{d.CANTIDAD_REQUERIDA}</td>
                  <td className="px-4 py-3">{ver ? d.CANTIDAD_DESPACHADA : <input type="number" min={0} step="0.01" className={`${inputCls} w-24`} value={cant} onChange={(e) => up(d.ID_DETALLE, { c: e.target.value })} />}</td>
                  <td className="px-4 py-3">{ver ? fmt(d.OBSERVACION) : <input maxLength={250} className={inputCls} value={dr.o ?? ''} onChange={(e) => up(d.ID_DETALLE, { o: e.target.value })} />}</td>
                  <td className="px-4 py-3"><Badge estado={d.ESTADO_ITEM} /></td>
                  <td className="px-4 py-3">{ver ? 'Sí' : 'No'}{ver && <span className="ml-1 text-xs text-slate-500">{fmt(d.FECHA_VERIFICACION)}</span>}</td>
                  <td className="px-4 py-3 text-right">{!ver && <button className={btnPrimary} disabled={!ok} onClick={() => act(`Ítem verificado (VERIFICAR_DESPACHAR_ITEM)`, () => verificarDespacharItem(d.ID_DETALLE, dr.u ? Number(dr.u) : null, Number(cant), dr.o || null))}><CheckCircle2 size={15} />Verificar</button>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
      <p className="text-xs text-slate-500">Si CANTIDAD_DESPACHADA &lt; CANTIDAD_REQUERIDA el ítem queda como Faltante. El trigger ESTADO_UNIDAD_EQUIPO pasa el equipo a "En terreno" y VALIDAR_EQUIPO_BODEGA rechaza equipos que no estén "En bodega".</p>
    </div>
  )
}
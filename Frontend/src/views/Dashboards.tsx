import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { cargarReporte, type ReporteNombre, type Row } from '../db'
import { DataTable, card, inputCls } from '../ui'

const uniq = (rows: Row[], k: string) => [...new Set(rows.map((r) => r[k]).filter((v) => v != null))].sort() as string[]

function Kpi({ label, value }: { label: string; value: number | string }) {
  return <div className={`${card} border-l-4 border-l-accent p-5`}><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 text-3xl font-bold text-primary">{value}</div></div>
}
function Filter({ label, value, opts, onChange }: { label: string; value: string; opts: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block text-xs font-medium text-slate-600">{label}
      <select className={`${inputCls} mt-1`} value={value} onChange={(e) => onChange(e.target.value)}><option value="">Todos</option>{opts.map((o) => <option key={o}>{o}</option>)}</select>
    </label>
  )
}
function Bars({ title, data, suffix = '', color = 'bg-primary' }: { title: string; data: { label: string; value: number }[]; suffix?: string; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 0)
  return (
    <div className={`${card} p-5`}>
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      {!data.length ? <p className="py-8 text-center text-sm text-slate-500">Sin datos para graficar.</p> : (
        <div className="space-y-2.5">
          {data.map((d) => (
            <div key={d.label} className="grid grid-cols-[180px_1fr_70px] items-center gap-3 text-sm">
              <span className="truncate text-slate-700" title={d.label}>{d.label}</span>
              <div className="h-5 rounded bg-slate-100"><div className={`h-5 rounded ${color}`} style={{ width: `${max ? (d.value / max) * 100 : 0}%` }} /></div>
              <span className="text-right font-medium tabular-nums">{d.value}{suffix}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
const group = (rows: Row[], key: (r: Row) => string, val: (r: Row) => number) => {
  const m = new Map<string, number>()
  rows.forEach((r) => m.set(key(r), (m.get(key(r)) ?? 0) + val(r)))
  return [...m].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}
const useFilters = (keys: string[]) => {
  const [f, setF] = useState<Record<string, string>>(Object.fromEntries(keys.map((k) => [k, ''])))
  return [f, (k: string, v: string) => setF({ ...f, [k]: v }), (rows: Row[]) => rows.filter((r) => keys.every((k) => !f[k] || r[k] === f[k]))] as const
}
const Empty = () => <div className={`${card} py-20 text-center text-slate-500`}>El reporte no devolvió registros.</div>

function Fuera({ rows }: { rows: Row[] }) {
  const [f, set, apply] = useFilters(['CLIENTE', 'FAENA', 'NRO_OT'])
  const r = apply(rows)
  const cols = ['CLIENTE', 'FAENA', 'NRO_OT', 'ESTADO_OT', 'FECHA_SALIDA', 'FECHA_RETORNO_PREVISTA', 'ITEM', 'CODIGO_EQUIPO', 'NRO_SERIE', 'CANTIDAD_DESPACHADA', 'CANTIDAD_FUERA']
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4"><Kpi label="Órdenes de trabajo" value={uniq(r, 'NRO_OT').length} /><Kpi label="Clientes" value={uniq(r, 'CLIENTE').length} /><Kpi label="Faenas" value={uniq(r, 'FAENA').length} /></div>
      <div className={`${card} grid grid-cols-3 gap-4 p-4`}>
        <Filter label="CLIENTE" value={f.CLIENTE} opts={uniq(rows, 'CLIENTE')} onChange={(v) => set('CLIENTE', v)} />
        <Filter label="FAENA" value={f.FAENA} opts={uniq(rows, 'FAENA')} onChange={(v) => set('FAENA', v)} />
        <Filter label="NRO_OT" value={f.NRO_OT} opts={uniq(rows, 'NRO_OT')} onChange={(v) => set('NRO_OT', v)} />
      </div>
      <Bars title="CANTIDAD_FUERA por ítem (cada barra suma un solo ítem, por lo que no mezcla unidades)" data={group(r, (x) => x.ITEM, (x) => Number(x.CANTIDAD_FUERA))} />
      <DataTable cols={cols} rows={r} empty="Sin registros para los filtros seleccionados." />
    </div>
  )
}
function Faltantes({ rows }: { rows: Row[] }) {
  const [f, set, apply] = useFilters(['NRO_OT', 'ITEM', 'PROVEEDOR'])
  const r = apply(rows)
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4"><Kpi label="Registros pendientes" value={r.length} /><Kpi label="Ítems afectados" value={uniq(r, 'ITEM').length} /><Kpi label="Requerimientos de compra" value={r.filter((x) => x.ESTADO_COMPRA != null).length} /></div>
      <div className={`${card} grid grid-cols-3 gap-4 p-4`}>
        <Filter label="NRO_OT" value={f.NRO_OT} opts={uniq(rows, 'NRO_OT')} onChange={(v) => set('NRO_OT', v)} />
        <Filter label="ITEM" value={f.ITEM} opts={uniq(rows, 'ITEM')} onChange={(v) => set('ITEM', v)} />
        <Filter label="PROVEEDOR" value={f.PROVEEDOR} opts={uniq(rows, 'PROVEEDOR')} onChange={(v) => set('PROVEEDOR', v)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Bars title="Frecuencia de registros por ítem" data={group(r, (x) => x.ITEM, () => 1)} />
        <Bars color="bg-accent" title="Registros por ESTADO_COMPRA" data={group(r, (x) => x.ESTADO_COMPRA ?? 'Sin requerimiento', () => 1)} />
      </div>
      <DataTable cols={['NRO_OT', 'ITEM', 'UNIDAD', 'POR_DESPACHAR', 'NO_RETORNADO', 'CANTIDAD_COMPRA', 'ESTADO_COMPRA', 'PROVEEDOR']} rows={r} empty="Sin registros para los filtros seleccionados." />
    </div>
  )
}
function Consumo({ rows }: { rows: Row[] }) {
  const [f, set, apply] = useFilters(['MES', 'CLIENTE', 'CATEGORIA', 'ITEM'])
  const r = apply(rows)
  const unidades = uniq(r, 'UNIDAD')
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4"><Kpi label="Clientes" value={uniq(r, 'CLIENTE').length} /><Kpi label="Órdenes de trabajo" value={uniq(r, 'NRO_OT').length} /></div>
      <div className={`${card} grid grid-cols-4 gap-4 p-4`}>
        {(['MES', 'CLIENTE', 'CATEGORIA', 'ITEM'] as const).map((k) => <Filter key={k} label={k} value={f[k]} opts={uniq(rows, k)} onChange={(v) => set(k, v)} />)}
      </div>
      <p className="text-xs text-slate-500">Un gráfico por unidad de medida: nunca se suman cantidades de unidades distintas.</p>
      <div className="grid grid-cols-2 gap-4">
        {unidades.map((u) => <Bars key={u} color="bg-accent" title={`Consumo mensual por ítem — unidad ${u}`} suffix={` ${u}`} data={group(r.filter((x) => x.UNIDAD === u), (x) => `${x.MES} · ${x.ITEM}`, (x) => Number(x.TOTAL_CONSUMIDO))} />)}
        {!unidades.length && <Bars title="Consumo mensual por ítem" data={[]} />}
      </div>
      <DataTable cols={['MES', 'CLIENTE', 'NRO_OT', 'CATEGORIA', 'ITEM', 'UNIDAD', 'TOTAL_CONSUMIDO']} rows={r} empty="Sin registros para los filtros seleccionados." />
    </div>
  )
}

const FUENTES = { fuera: 'REPORTE_FUERA_BODEGA', faltantes: 'REPORTE_PENDIENTES_FALTANTES', consumo: 'REPORTE_CONSUMO_MENSUAL' } as const

export function Reporte({ kind }: { kind: 'fuera' | 'faltantes' | 'consumo' }) {
  const nombre: ReporteNombre = FUENTES[kind]
  const [rows, setRows] = useState<Row[] | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const load = useCallback(() => {
    setLoading(true); setError('')
    cargarReporte(nombre).then(setRows).catch((e: Error) => { setRows(null); setError(e.message) }).finally(() => setLoading(false))
  }, [nombre])
  useEffect(load, [load])
  const bar = (
    <div className="flex items-center justify-between text-xs text-slate-500">
      <span>Fuente: GET /api/list/{nombre}</span>
      <button onClick={load} disabled={loading} className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={12} className={loading ? 'animate-spin' : ''} />Actualizar</button>
    </div>
  )
  if (loading && !rows) return <div className={`${card} py-20 text-center text-slate-500`}>Cargando reporte desde Oracle...</div>
  if (error) return <div className="space-y-3">{bar}<div className={`${card} border-red-200 bg-red-50 py-12 text-center text-red-700`}><p className="font-semibold">No se pudo cargar el reporte</p><p className="text-sm">{error}</p></div></div>
  if (!rows?.length) return <div className="space-y-3">{bar}<Empty /></div>
  return <div className="space-y-4">{bar}{kind === 'fuera' ? <Fuera rows={rows} /> : kind === 'faltantes' ? <Faltantes rows={rows} /> : <Consumo rows={rows} />}</div>
}

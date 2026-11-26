import { useEffect, useState } from 'react'
import { listar, marcarAlertaAtendida, useDB, type Row } from '../db'
import { useApp } from '../ctx'
import { Badge, DataTable, btnGhost, card, fmt, th } from '../ui'

export function Alertas() {
  const db = useDB()
  const { act } = useApp()
  const rows = [...db.ALERTA].sort((a, b) => b.ID_ALERTA - a.ID_ALERTA)
  return (
    <section className={`${card} overflow-x-auto`}>
      <table className="w-full text-sm">
        <thead className="bg-slate-50"><tr>{['ID_ALERTA', 'NRO_OT', 'CODIGO', 'TIPO', 'MENSAJE', 'FECHA', 'ATENDIDA', ''].map((c) => <th key={c} className={th}>{c}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((a) => (
            <tr key={a.ID_ALERTA} className={a.ATENDIDA === 'N' ? 'bg-orange-50/40' : ''}>
              <td className="px-4 py-3 font-mono text-xs">{a.ID_ALERTA}</td>
              <td className="px-4 py-3">{a.NRO_OT ?? '—'}</td>
              <td className="px-4 py-3 font-mono text-xs text-primary">{a.CODIGO_EQUIPO ?? '—'}</td>
              <td className="px-4 py-3"><Badge estado={a.TIPO} /></td>
              <td className="px-4 py-3">{a.MENSAJE}</td>
              <td className="px-4 py-3">{fmt(a.FECHA)}</td>
              <td className="px-4 py-3">{a.ATENDIDA === 'S' ? 'Sí' : 'No'}</td>
              <td className="px-4 py-3 text-right">{a.ATENDIDA === 'N' && <button className={btnGhost} onClick={() => act('Alerta marcada como atendida', () => marcarAlertaAtendida(a.ID_ALERTA))}>Marcar atendida</button>}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={8} className="py-10 text-center text-slate-500">Sin alertas.</td></tr>}
        </tbody>
      </table>
    </section>
  )
}
export function Bitacora() {
  const db = useDB()
  return <DataTable cols={['ID_BITACORA', 'TABLA', 'OPERACION', 'ID_REGISTRO', 'VALOR_ANTERIOR', 'VALOR_NUEVO', 'USUARIO_BD', 'FECHA']} rows={db.BITACORA} />
}
// Los 3 reportes los calcula Oracle (cursores REPORTE_*)
export function Reporte({ kind }: { kind: 'fuera' | 'faltantes' | 'consumo' }) {
  const [rows, setRows] = useState<Row[]>([])
  const [err, setErr] = useState('')
  const nombre = kind === 'fuera' ? 'REPORTE_FUERA_BODEGA' : kind === 'faltantes' ? 'REPORTE_PENDIENTES_FALTANTES' : 'REPORTE_CONSUMO_MENSUAL'
  useEffect(() => { listar(nombre).then(setRows).catch((e) => setErr(e.message)) }, [nombre])
  const cols = kind === 'fuera'
    ? ['CLIENTE', 'FAENA', 'NRO_OT', 'ESTADO_OT', 'FECHA_SALIDA', 'FECHA_RETORNO_PREVISTA', 'ITEM', 'CODIGO_EQUIPO', 'NRO_SERIE', 'CANTIDAD_DESPACHADA', 'CANTIDAD_FUERA']
    : kind === 'faltantes'
      ? ['NRO_OT', 'ITEM', 'UNIDAD', 'POR_DESPACHAR', 'NO_RETORNADO', 'CANTIDAD_COMPRA', 'ESTADO_COMPRA', 'PROVEEDOR']
      : ['MES', 'CLIENTE', 'NRO_OT', 'CATEGORIA', 'ITEM', 'UNIDAD', 'TOTAL_CONSUMIDO']
  return <>{err && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}<DataTable cols={cols} rows={rows} /></>
}
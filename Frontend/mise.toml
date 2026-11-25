import { marcarAlertaAtendida, reporteConsumoMensual, reporteFueraBodega, reportePendientesFaltantes, useDB } from '../db'
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
              <td className="px-4 py-3">{db.ORDEN_TRABAJO.find((o) => o.ID_OT === a.ID_OT)?.NRO_OT ?? '—'}</td>
              <td className="px-4 py-3 font-mono text-xs text-primary">{db.UNIDAD_EQUIPO.find((u) => u.ID_UNIDAD === a.ID_UNIDAD)?.CODIGO ?? '—'}</td>
              <td className="px-4 py-3"><Badge estado={a.TIPO} /></td>
              <td className="px-4 py-3">{a.MENSAJE}</td>
              <td className="px-4 py-3">{fmt(a.FECHA)}</td>
              <td className="px-4 py-3">{a.ATENDIDA}</td>
              <td className="px-4 py-3 text-right">{a.ATENDIDA === 'N' && <button className={btnGhost} onClick={() => act('Alerta marcada como atendida', () => marcarAlertaAtendida(a.ID_ALERTA))}>Marcar atendida</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
export function Bitacora() {
  const db = useDB()
  return <DataTable cols={['ID_BITACORA', 'TABLA', 'OPERACION', 'ID_REGISTRO', 'VALOR_ANTERIOR', 'VALOR_NUEVO', 'USUARIO_BD', 'FECHA']} rows={[...db.BITACORA].reverse()} />
}
export function Reporte({ kind }: { kind: 'fuera' | 'faltantes' | 'consumo' }) {
  const db = useDB()
  if (kind === 'fuera') return <DataTable cols={['CLIENTE', 'FAENA', 'NRO_OT', 'ESTADO_OT', 'FECHA_SALIDA', 'FECHA_RETORNO_PREVISTA', 'ITEM', 'CODIGO_EQUIPO', 'NRO_SERIE', 'CANTIDAD_DESPACHADA', 'CANTIDAD_FUERA']} rows={reporteFueraBodega(db)} empty="No hay ítems fuera de bodega." />
  if (kind === 'faltantes') return <DataTable cols={['NRO_OT', 'ITEM', 'UNIDAD', 'POR_DESPACHAR', 'NO_RETORNADO', 'CANTIDAD_COMPRA', 'ESTADO_COMPRA', 'PROVEEDOR']} rows={reportePendientesFaltantes(db)} />
  return <DataTable cols={['MES', 'CLIENTE', 'NRO_OT', 'CATEGORIA', 'ITEM', 'UNIDAD', 'TOTAL_CONSUMIDO']} rows={reporteConsumoMensual(db)} />
}

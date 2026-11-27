import { marcarAlertaAtendida, useDB } from '../db'
import { useApp } from '../ctx'
import { Badge, DataTable, btnGhost, card, fmt, th } from '../ui'

export function Alertas() {
  const db = useDB()
  const { act, canAtender } = useApp()
  const rows = [...db.ALERTA].sort((a, b) => b.ID_ALERTA - a.ID_ALERTA)
  return (
    <section className={`${card} overflow-x-auto`}>
      <table className="w-full text-sm">
        <thead className="bg-slate-50"><tr>{['ID_ALERTA', 'NRO_OT', 'CODIGO_EQUIPO', 'TIPO', 'MENSAJE', 'FECHA', 'ATENDIDA', ''].map((c) => <th key={c} className={th}>{c}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((a) => (
            <tr key={a.ID_ALERTA} className={a.ATENDIDA === 'N' ? 'bg-orange-50/40' : ''}>
              <td className="px-4 py-3 font-mono text-xs">{a.ID_ALERTA}</td>
              <td className="px-4 py-3">{a.NRO_OT ?? '—'}</td>
              <td className="px-4 py-3 font-mono text-xs text-primary">{a.CODIGO_EQUIPO ?? '—'}</td>
              <td className="px-4 py-3"><Badge estado={a.TIPO} /></td>
              <td className="px-4 py-3">{a.MENSAJE}</td>
              <td className="px-4 py-3">{fmt(a.FECHA)}</td>
              <td className="px-4 py-3">{a.ATENDIDA}</td>
              <td className="px-4 py-3 text-right">{a.ATENDIDA === 'N' && canAtender && <button className={btnGhost} onClick={() => act('Alerta marcada como atendida', () => marcarAlertaAtendida(a.ID_ALERTA))}>Marcar atendida</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
export function Bitacora() {
  const db = useDB()
  return <DataTable cols={['ID_BITACORA', 'ID_USUARIO', 'TABLA', 'OPERACION', 'ID_REGISTRO', 'VALOR_ANTERIOR', 'VALOR_NUEVO', 'USUARIO_BD', 'FECHA']} rows={db.BITACORA} />
}
export { Reporte } from './Dashboards'

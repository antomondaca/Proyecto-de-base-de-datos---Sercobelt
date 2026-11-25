import { ReactNode } from 'react'
import { X } from 'lucide-react'

export const ESTADOS_UNIDAD = ['En bodega', 'En terreno', 'En mantención', 'De baja']
const CG = 'bg-green-100 text-green-800 border-green-200', CB = 'bg-blue-100 text-blue-800 border-blue-200', CA = 'bg-amber-100 text-amber-800 border-amber-200', CR = 'bg-red-100 text-red-800 border-red-200', CX = 'bg-gray-100 text-gray-700 border-gray-200'
const COLORS: Record<string, string> = {
  'En bodega': CG, Retornado: CG, Cerrada: CG, Recibido: CG, A: CG,
  'En terreno': CB, Despachado: CB, Comprado: CB,
  'En mantención': CA,
  'De baja': CR, Faltante: CR, 'Retorno atrasado': CR, 'Calibración vencida': CA,
  Pendiente: CX, Borrador: CX, Consumido: CX, Solicitado: CX, I: CX,
}
export function Badge({ estado, label }: { estado: string; label?: string }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${COLORS[estado] ?? CX}`}>{label ?? estado}</span>
}
export const fmt = (v: any) => (v == null || v === '' ? '—' : String(v).replace('T', ' ').slice(0, String(v).length > 10 ? 16 : 10))
export function DataTable({ cols, rows, empty = 'Sin registros.' }: { cols: string[]; rows: Record<string, any>[]; empty?: string }) {
  return (
    <section className={card + ' overflow-x-auto'}>
      <table className="w-full text-sm">
        <thead className="bg-slate-50"><tr>{cols.map((c) => <th key={c} className={th}>{c}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => <tr key={i} className="hover:bg-slate-50">{cols.map((c) => <td key={c} className="px-4 py-3">{c.includes('ESTADO') && r[c] ? <Badge estado={r[c]} /> : fmt(r[c])}</td>)}</tr>)}
          {!rows.length && <tr><td colSpan={cols.length} className="py-10 text-center text-slate-500">{empty}</td></tr>}
        </tbody>
      </table>
    </section>
  )
}
export function Modal({ title, onClose, children, width = 'max-w-lg' }: { title: string; onClose: () => void; children: ReactNode; width?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div className={`w-full ${width} rounded-xl bg-white shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
export const inputCls = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm"><span className="mb-1 block font-medium text-slate-600">{label}</span>{children}</label>
}
export const btnPrimary = 'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-[#0c3d69]'
export const btnGhost = 'inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50'
export const card = 'rounded-xl border border-slate-200 bg-white'
export const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'

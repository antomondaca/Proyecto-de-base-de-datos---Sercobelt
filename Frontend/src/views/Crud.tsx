import { useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { type Row, PK, deleteRow, hash, insertRow, updateRow, useDB } from '../db'
import type { Cat, Field } from '../catalogs'
import { useApp } from '../ctx'
import RutInput from '../RutInput'
import { Badge, Field as FormField, Modal, btnGhost, btnPrimary, card, fmt, inputCls, th } from '../ui'

export default function Crud({ cat }: { cat: Cat }) {
  const db = useDB()
  const { act } = useApp()
  const { table, fields } = cat
  const pk: readonly string[] = PK[table]
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState<Row | null>(null)
  const [creating, setCreating] = useState(false)
  const [del, setDel] = useState<Row | null>(null)
  const rows = db[table]
  const keyOf = (r: Row) => pk.map((k) => r[k]).join('|')
  const text = (f: Field, r: Row): string => {
    const v = r[f.key]
    if (f.type === 'fk') return v == null ? '—' : f.fk!.label(db[f.fk!.table].find((x) => x[PK[f.fk!.table][0]] === v) ?? {})
    if (f.type === 'password') return '••••••••'
    if (f.type === 'select') return f.opts!.find((o) => o[0] === v)?.[1] ?? v
    return fmt(v)
  }
  const shown = rows.filter((r) => [...(pk.length === 1 ? [String(r[pk[0]])] : []), ...fields.map((f) => text(f, r))].some((s) => s.toLowerCase().includes(q.toLowerCase())))
  const conv = (f: Field, raw: FormDataEntryValue | null) => {
    const s = raw == null ? '' : String(raw)
    if (s === '') return null
    return f.type === 'number' || f.type === 'fk' ? Number(s) : s
  }
  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const v: Row = {}
    for (const f of fields) {
      if (f.type === 'password') { const p = String(fd.get(f.key) ?? ''); if (p) v[f.key] = hash(p); continue }
      if (edit && pk.length > 1 && pk.includes(f.key)) continue
      v[f.key] = conv(f, fd.get(f.key))
    }
    const ok = await act(creating ? `${cat.nuevo} creado (INSERTAR_${table})` : `${cat.nuevo} actualizado (ACTUALIZAR_${table})`, () => {
      if (creating) {
        if (pk.length > 1) for (const k of pk) v[k] = conv(fields.find((f) => f.key === k)!, fd.get(k))
        return insertRow(table, v)
      }
      return updateRow(table, edit!, v)
    })
    if (ok) { setEdit(null); setCreating(false) }
  }
  const open = edit !== null || creating
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className={`${inputCls} pl-9`} />
        </div>
        <button className={btnPrimary} onClick={() => { setCreating(true); setEdit({}) }}><Plus size={16} />Nuevo {cat.nuevo}</button>
      </div>
      <section className={`${card} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            {pk.length === 1 && <th className={th}>{pk[0]}</th>}
            {fields.map((f) => <th key={f.key} className={th}>{f.head ?? f.key}</th>)}
            <th className={`${th} text-right`}>Acciones</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {shown.map((r) => (
              <tr key={keyOf(r)} className="hover:bg-slate-50">
                {pk.length === 1 && <td className="px-4 py-3 font-mono text-xs text-slate-500">{r[pk[0]]}</td>}
                {fields.map((f) => (
                  <td key={f.key} className={`px-4 py-3 ${f.key === 'CODIGO' ? 'font-mono text-xs font-semibold text-primary' : ''}`}>
                    {f.badge ? <Badge estado={r[f.key]} label={text(f, r)} /> : text(f, r)}
                  </td>
                ))}
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button title="Editar" onClick={() => { setCreating(false); setEdit(r) }} className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-primary"><Pencil size={16} /></button>
                  <button title="Eliminar" onClick={() => setDel(r)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={fields.length + 2} className="py-10 text-center text-slate-500">Sin resultados.</td></tr>}
          </tbody>
        </table>
        <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">{shown.length} de {rows.length} registros · tabla {table}</div>
      </section>
      {open && edit && (
        <Modal title={creating ? `Nuevo ${cat.nuevo}` : `Editar ${cat.nuevo}`} onClose={() => { setEdit(null); setCreating(false) }}>
          <form onSubmit={save} className="space-y-4">
            {fields.map((f) => {
              const lockedPk = !creating && pk.length > 1 && pk.includes(f.key)
              const req = f.type === 'password' ? true : f.req
              return (
                <FormField key={f.key} label={`${f.key}${req ? ' *' : ''}`}>
                  {f.type === 'fk' ? (
                    <select name={f.key} required={req} disabled={lockedPk} defaultValue={edit[f.key] ?? ''} className={inputCls}>
                      <option value="">{req ? 'Seleccione...' : '(NULL)'}</option>
                      {db[f.fk!.table].map((o) => <option key={o[PK[f.fk!.table][0]]} value={o[PK[f.fk!.table][0]]}>{f.fk!.label(o)}</option>)}
                    </select>
                  ) : f.type === 'select' ? (
                    <select name={f.key} required defaultValue={edit[f.key] ?? f.opts![0][0]} className={inputCls}>{f.opts!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                  ) : f.type === 'number' ? (
                    <input name={f.key} required={req} type="number" step="0.01" min="0.01" max="999999.99" defaultValue={edit[f.key] ?? ''} className={inputCls} />
                  ) : f.key === 'RUT' ? (
                    <RutInput name={f.key} required={req} defaultValue={edit[f.key]} className={inputCls} />
                  ) : (
                    <input name={f.key} required={req} maxLength={f.max} type={f.type === 'date' ? 'date' : f.type === 'password' ? 'password' : 'text'}
                      placeholder={f.type === 'password' ? (creating ? '' : 'Obligatoria: ACTUALIZAR_USUARIO exige PASSWORD_HASH') : undefined} defaultValue={f.type === 'password' ? '' : edit[f.key] ?? ''} className={inputCls} />
                  )}
                </FormField>
              )
            })}
            <div className="flex justify-end gap-2 pt-2"><button type="button" className={btnGhost} onClick={() => { setEdit(null); setCreating(false) }}>Cancelar</button><button className={btnPrimary}>Guardar</button></div>
          </form>
        </Modal>
      )}
      {del && (
        <Modal title={`Eliminar ${cat.nuevo}`} onClose={() => setDel(null)} width="max-w-md">
          <p className="text-sm text-slate-600">¿Confirma que desea eliminar el registro <b>{pk.map((k) => `${k}=${del[k]}`).join(', ')}</b> de {table}? Si tiene registros asociados, la base de datos rechazará la operación.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button className={btnGhost} onClick={() => setDel(null)}>Cancelar</button>
            <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700" onClick={async () => { await act(`${cat.nuevo} eliminado (ELIMINAR_${table})`, () => deleteRow(table, del)); setDel(null) }}>Eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

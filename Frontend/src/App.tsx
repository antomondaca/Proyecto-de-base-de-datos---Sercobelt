import { useState } from 'react'
import { AlertTriangle, Briefcase, Building2, Cpu, Factory, FileSpreadsheet, MapPin, Package, ShieldCheck, Tags, Bell, ClipboardCheck, ClipboardList, Construction, Database, FileBarChart, HardHat, LogOut, PackageCheck, ScrollText, ShoppingCart, Truck, Users, Wrench, Zap } from 'lucide-react'
import Checklist from './views/Checklist'
import Verificacion from './views/Verificacion'
import Retorno from './views/Retorno'
import Mantencion from './views/Mantencion'
import Compra from './views/Compra'
import Crud from './views/Crud'
import { Alertas, Bitacora, Reporte } from './views/Sistema'
import { CATALOGS } from './catalogs'
import { AppCtx } from './ctx'
import { hash, spLogin, useDB } from './db'
import { Field, btnPrimary, card, inputCls } from './ui'

const GROUPS = [
  { name: 'Operaciones', items: ['Armado de Checklist', 'Verificación y Salida', 'Retorno y Conciliación', 'Mantención y Calibración', 'Requerimiento de Compra'] },
  { name: 'Catálogos', items: ['Usuarios', 'Personal', 'Clientes', 'Faenas', 'Proveedores', 'Vehículos', 'Tipos de Trabajo', 'Categorías', 'Ítems', 'Unidades de Equipo', 'Roles', 'Plantilla de Ítems'] },
  { name: 'Reportes', items: ['Faltantes Recurrentes', 'Equipos en Terreno', 'Consumo por OT/Cliente'] },
  { name: 'Sistema', items: ['Alertas', 'Bitácora de Cambios'] },
]
const ICONS: Record<string, typeof Bell> = { 'Armado de Checklist': ClipboardList, 'Verificación y Salida': ClipboardCheck, 'Retorno y Conciliación': PackageCheck, 'Mantención y Calibración': Wrench, 'Requerimiento de Compra': ShoppingCart, Clientes: Building2, Faenas: MapPin, Proveedores: Factory, 'Tipos de Trabajo': Briefcase, Categorías: Tags, Ítems: Package, 'Unidades de Equipo': Cpu, Roles: ShieldCheck, 'Plantilla de Ítems': FileSpreadsheet, Vehículos: Truck, Personal: HardHat, Usuarios: Users, Alertas: AlertTriangle, 'Bitácora de Cambios': ScrollText }
type Toast = { kind: 'ok' | 'err'; text: string; notes: string[] }
type Session = { ID_USUARIO: number; ID_ROL: number; ROL: string; NOMBRE_PERSONA: string }

export default function App() {
  const db = useDB()
  const [page, setPage] = useState('Armado de Checklist')
  const [session, setSession] = useState<Session | null>({ ID_USUARIO: 1, ID_ROL: 1, ROL: 'Administrador', NOMBRE_PERSONA: 'Marcela Fuentes' })
  const [bell, setBell] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [err, setErr] = useState('')

  const act = (ok: string, fn: () => string[]) => {
    try {
      const notes = fn()
      setToast({ kind: 'ok', text: ok, notes })
      setTimeout(() => setToast(null), notes.length ? 7000 : 3000)
      return true
    } catch (e) {
      setToast({ kind: 'err', text: (e as Error).message, notes: [] })
      setTimeout(() => setToast(null), 6000)
      return false
    }
  }
  const pendientes = db.ALERTA.filter((a) => a.ATENDIDA === 'N').sort((a, b) => b.ID_ALERTA - a.ID_ALERTA)

  if (!session)
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary p-6">
        <form onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          const u = spLogin(String(fd.get('u')), hash(String(fd.get('p'))))
          if (u) { setSession(u as Session); setErr('') } else setErr("Usuario o contraseña incorrectos, o usuario con ESTADO distinto de 'A'.")
        }} className={`${card} w-full max-w-sm space-y-4 p-8 shadow-xl`}>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white"><Construction /></div>
            <h1 className="text-xl font-bold tracking-wide text-primary">SERCOBELT</h1>
            <p className="text-sm text-slate-500">Gestión y control de bodega</p>
          </div>
          <Field label="USERNAME"><input name="u" required maxLength={30} className={inputCls} placeholder="mfuentes" autoFocus /></Field>
          <Field label="Contraseña"><input name="p" required type="password" className={inputCls} placeholder="••••••••" /></Field>
          {err && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
          <button className={`${btnPrimary} w-full justify-center`}>Ingresar</button>
          <p className="text-center text-xs text-slate-500">Demo: mfuentes, palarcon, cmunoz o rvega · contraseña <span className="font-mono">sercobelt2026</span></p>
        </form>
      </div>
    )

  const cat = CATALOGS[page]
  const body = page === 'Armado de Checklist' ? <Checklist />
    : page === 'Verificación y Salida' ? <Verificacion />
    : page === 'Retorno y Conciliación' ? <Retorno />
    : page === 'Mantención y Calibración' ? <Mantencion />
    : page === 'Requerimiento de Compra' ? <Compra />
    : page === 'Alertas' ? <Alertas />
    : page === 'Bitácora de Cambios' ? <Bitacora />
    : page === 'Faltantes Recurrentes' ? <Reporte kind="faltantes" />
    : page === 'Equipos en Terreno' ? <Reporte kind="fuera" />
    : page === 'Consumo por OT/Cliente' ? <Reporte kind="consumo" />
    : <Crud key={page} cat={cat} />

  const cambiarPerfil = (idRol: number) => {
    const u = db.USUARIO.find((x) => x.ID_ROL === idRol && x.ESTADO === 'A')
    const rol = db.ROL.find((r) => r.ID_ROL === idRol)!
    setSession({ ID_USUARIO: u?.ID_USUARIO ?? 0, ID_ROL: idRol, ROL: rol.NOMBRE_ROL, NOMBRE_PERSONA: u ? (db.PERSONAL.find((p) => p.ID_PERSONAL === u.ID_PERSONAL)?.NOMBRE ?? u.USERNAME) : '(sin usuario activo)' })
  }

  return (
    <AppCtx.Provider value={{ act, go: setPage }}>
      <div className="flex min-h-screen">
        <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-primary text-white">
          <div className="flex items-center gap-2 px-5 py-5"><div className="flex h-8 w-8 items-center justify-center rounded bg-accent"><Construction size={18} /></div><span className="text-lg font-bold tracking-widest">SERCOBELT</span></div>
          <div className="px-4 pb-3">
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-blue-200">Vista de perfil (ROL)</label>
            <select value={session.ID_ROL} onChange={(e) => cambiarPerfil(Number(e.target.value))} className="w-full rounded-md border border-white/20 bg-white/10 px-2 py-2 text-sm outline-none">
              {db.ROL.map((r) => <option key={r.ID_ROL} value={r.ID_ROL} className="text-ink">{r.NOMBRE_ROL}</option>)}
            </select>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            {GROUPS.map((g) => (
              <div key={g.name} className="mt-4">
                <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-blue-200">{g.name}</div>
                {g.items.map((it) => {
                  const Icon = ICONS[it] ?? (g.name === 'Reportes' ? FileBarChart : Database)
                  const on = page === it
                  return (
                    <button key={it} onClick={() => setPage(it)} className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] ${on ? 'bg-white/15 font-medium' : 'text-blue-50/90 hover:bg-white/10'}`}>
                      <Icon size={15} className={on ? 'text-accent' : ''} /><span className="flex-1">{it}</span>
                      {it === 'Alertas' && pendientes.length > 0 && <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold">{pendientes.length}</span>}
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
            <h1 className="text-lg font-semibold">{page}</h1>
            <div className="flex items-center gap-5">
              <div className="relative">
                <button onClick={() => setBell(!bell)} className="relative rounded-full p-2 hover:bg-slate-100"><Bell size={20} />{pendientes.length > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{pendientes.length}</span>}</button>
                {bell && (
                  <div className={`${card} absolute right-0 mt-2 w-96 shadow-lg`}>
                    <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold">Alertas activas (ATENDIDA = 'N')</div>
                    {pendientes.slice(0, 6).map((a) => <button key={a.ID_ALERTA} onClick={() => { setPage('Alertas'); setBell(false) }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-slate-50"><AlertTriangle size={16} className="shrink-0 text-accent" />{a.MENSAJE}</button>)}
                    {!pendientes.length && <p className="px-4 py-6 text-center text-sm text-slate-500">Sin alertas pendientes.</p>}
                  </div>
                )}
              </div>
              <div className="text-right leading-tight"><div className="text-sm font-medium">{session.NOMBRE_PERSONA}</div><div className="text-xs text-slate-500">{session.ROL}</div></div>
              <button onClick={() => setSession(null)} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"><LogOut size={15} />Cerrar sesión</button>
            </div>
          </header>
          <main className="p-8">{body}</main>
        </div>
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 max-w-md rounded-lg px-4 py-3 text-sm text-white shadow-lg ${toast.kind === 'err' ? 'bg-red-700' : 'bg-ink'}`}>
            <div className="font-medium">{toast.text}</div>
            {toast.notes.map((n, i) => <div key={i} className="mt-1.5 flex items-start gap-1.5 text-xs text-orange-200"><Zap size={12} className="mt-0.5 shrink-0" /><span>TRIGGER {n}</span></div>)}
          </div>
        )}
      </div>
    </AppCtx.Provider>
  )
}

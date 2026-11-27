import { useCallback, useEffect, useRef, useState } from 'react'
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
import { allowedPages, canAtenderAlertas } from './perms'
import { ApiError, RefreshError, clearData, getSession, loadAll, logoutServer, setUnauthorizedHandler, spLogin, useDB } from './db'
import { Field, btnPrimary, card, inputCls } from './ui'

const GROUPS = [
  { name: 'Operaciones', items: ['Armado de Checklist', 'Verificación y Salida', 'Retorno y Conciliación', 'Mantención y Calibración', 'Requerimiento de Compra'] },
  { name: 'Catálogos', items: ['Usuarios', 'Personal', 'Clientes', 'Faenas', 'Proveedores', 'Vehículos', 'Tipos de Trabajo', 'Categorías', 'Ítems', 'Unidades de Equipo', 'Roles', 'Plantilla de Ítems'] },
  { name: 'Reportes', items: ['Faltantes Recurrentes', 'Equipos en Terreno', 'Consumo por OT/Cliente'] },
  { name: 'Sistema', items: ['Alertas', 'Bitácora de Cambios'] },
]
const ICONS: Record<string, typeof Bell> = { 'Armado de Checklist': ClipboardList, 'Verificación y Salida': ClipboardCheck, 'Retorno y Conciliación': PackageCheck, 'Mantención y Calibración': Wrench, 'Requerimiento de Compra': ShoppingCart, Clientes: Building2, Faenas: MapPin, Proveedores: Factory, 'Tipos de Trabajo': Briefcase, Categorías: Tags, Ítems: Package, 'Unidades de Equipo': Cpu, Roles: ShieldCheck, 'Plantilla de Ítems': FileSpreadsheet, Vehículos: Truck, Personal: HardHat, Usuarios: Users, Alertas: AlertTriangle, 'Bitácora de Cambios': ScrollText }
type Toast = { kind: 'ok' | 'err' | 'warn'; text: string; notes: string[] }
type Session = { ID_USUARIO: number; ID_ROL: number; ROL: string; NOMBRE_PERSONA: string }

export default function App() {
  const db = useDB()
  const [page, setPage] = useState('Armado de Checklist')
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)
  const [sessionErr, setSessionErr] = useState('')
  const [bell, setBell] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [err, setErr] = useState('')

  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const [loading, setLoading] = useState(false)
  const [loadErr, setLoadErr] = useState('')
  const show = (t: Toast, ms: number) => { setToast(t); setTimeout(() => setToast(null), ms) }

  const logout = useCallback(() => { clearData(); setSession(null); setLoadErr(''); setBell(false) }, [])
  const cargar = useCallback((rol: string) => {
    setLoading(true); setLoadErr('')
    loadAll(rol).catch((e: Error) => setLoadErr(e.message)).finally(() => setLoading(false))
  }, [])
  useEffect(() => {
    setUnauthorizedHandler(() => { logout(); setErr('La sesión expiró. Inicie sesión nuevamente.') })
    return () => setUnauthorizedHandler(null)
  }, [logout])

  // Recupera la sesión (cookie HttpOnly) al montar la app y al reintentar tras un error de conexión
  const restaurarSesion = useCallback(() => {
    setChecking(true); setSessionErr('')
    getSession()
      .then((u) => { if (u) { setSession(u as Session); setPage(allowedPages(u.ROL)[0]); cargar(u.ROL) } })
      .catch((e: Error) => setSessionErr(e.message))
      .finally(() => setChecking(false))
  }, [cargar])
  const iniciado = useRef(false)
  useEffect(() => { if (iniciado.current) return; iniciado.current = true; restaurarSesion() }, [restaurarSesion])
  const cerrarSesion = async () => {
    if (busyRef.current) return
    busyRef.current = true; setBusy(true)
    try { await logoutServer(); logout() }
    catch (e) { show({ kind: 'err', text: 'No se pudo cerrar la sesión. Reintente: ' + (e as Error).message, notes: [] }, 9000) }
    finally { busyRef.current = false; setBusy(false) }
  }

  // Ejecuta una operación contra Flask/Oracle bloqueando la interfaz mientras dura
  const act = async (ok: string, fn: () => Promise<string[]>): Promise<boolean> => {
    if (busyRef.current) return false
    busyRef.current = true; setBusy(true)
    try {
      const notes = await fn()
      show({ kind: 'ok', text: ok, notes }, 3500)
      return true
    } catch (e) {
      if (e instanceof RefreshError) { show({ kind: 'warn', text: e.message, notes: [] }, 9000); return true }
      show({ kind: 'err', text: e instanceof ApiError && e.status === 403 ? 'Acceso denegado: ' + e.message : (e as Error).message, notes: [] }, 7000)
      return false
    } finally { busyRef.current = false; setBusy(false) }
  }
  const pendientes = db.ALERTA.filter((a) => a.ATENDIDA === 'N').sort((a, b) => b.ID_ALERTA - a.ID_ALERTA)

  if (checking)
    return <div className="flex min-h-screen items-center justify-center bg-primary text-white"><span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />Verificando sesión...</div>
  if (!session && sessionErr)
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary p-6">
        <div className={`${card} w-full max-w-sm space-y-3 p-8 text-center shadow-xl`}>
          <p className="font-semibold text-red-700">No se pudo verificar la sesión</p>
          <p className="text-sm text-slate-600">{sessionErr}</p>
          <button onClick={restaurarSesion} className={`${btnPrimary} w-full justify-center`}>Reintentar</button>
        </div>
      </div>
    )
  if (!session)
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary p-6">
        <form onSubmit={async (e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          setBusy(true); setErr('')
          try {
            const u = await spLogin(String(fd.get('u')), String(fd.get('p')))
            if (u) { setSession(u as Session); setPage(allowedPages(u.ROL)[0]); cargar(u.ROL) }
            else setErr("Usuario o contraseña incorrectos, o usuario con ESTADO distinto de 'A'.")
          } catch (ex) { setErr((ex as Error).message) } finally { setBusy(false) }
        }} className={`${card} w-full max-w-sm space-y-4 p-8 shadow-xl`}>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white"><Construction /></div>
            <h1 className="text-xl font-bold tracking-wide text-primary">SERCOBELT</h1>
            <p className="text-sm text-slate-500">Gestión y control de bodega</p>
          </div>
          <Field label="USERNAME"><input name="u" required maxLength={30} className={inputCls} placeholder="mfuentes" autoFocus /></Field>
          <Field label="Contraseña"><input name="p" required type="password" className={inputCls} placeholder="••••••••" /></Field>
          {err && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
          <button disabled={busy} className={`${btnPrimary} w-full justify-center disabled:opacity-60`}>{busy ? 'Ingresando...' : 'Ingresar'}</button>
        </form>
      </div>
    )

  const cat = CATALOGS[page]
  const denied = !allowedPages(session.ROL).includes(page)
  const body = denied ? <div className={`${card} py-20 text-center`}><p className="font-semibold">Acceso denegado</p><p className="text-sm text-slate-500">Su perfil ({session.ROL}) no tiene permiso para esta sección.</p></div> : page === 'Armado de Checklist' ? <Checklist />
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

  const allowed = allowedPages(session.ROL)
  return (
    <AppCtx.Provider value={{ act, busy, go: (p) => { if (allowed.includes(p)) setPage(p) }, canAtender: canAtenderAlertas(session.ROL) }}>
      <div className="flex min-h-screen">
        <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-primary text-white">
          <div className="flex items-center gap-2 px-5 py-5"><div className="flex h-8 w-8 items-center justify-center rounded bg-accent"><Construction size={18} /></div><span className="text-lg font-bold tracking-widest">SERCOBELT</span></div>
          <div className="mx-4 mb-3 rounded-md border border-white/20 bg-white/10 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-blue-200">Sesión activa</div>
            <div className="truncate text-sm font-medium">{session.NOMBRE_PERSONA}</div>
            <div className="text-xs text-blue-100">{session.ROL}</div>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            {GROUPS.map((g) => ({ ...g, items: g.items.filter((it) => allowed.includes(it)) })).filter((g) => g.items.length > 0).map((g) => (
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
        <fieldset disabled={busy} className="contents">
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
              <button onClick={cerrarSesion} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"><LogOut size={15} />Cerrar sesión</button>
            </div>
          </header>
          <main className="p-8">
            {loading ? <div className={`${card} flex items-center justify-center gap-3 py-24 text-slate-500`}><span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />Cargando datos desde Oracle...</div>
              : loadErr ? <div className={`${card} border-red-200 bg-red-50 py-16 text-center text-red-700`}><p className="font-semibold">No se pudieron cargar los datos</p><p className="mt-1 text-sm">{loadErr}</p><button onClick={() => cargar(session.ROL)} className={`${btnPrimary} mt-4`}>Reintentar</button></div>
              : body}
          </main>
        </div>
        </fieldset>
        {busy && <div className="fixed inset-x-0 top-0 z-[60] h-1 animate-pulse bg-accent" />}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 max-w-md rounded-lg px-4 py-3 text-sm text-white shadow-lg ${toast.kind === 'err' ? 'bg-red-700' : toast.kind === 'warn' ? 'bg-amber-700' : 'bg-ink'}`}>
            <div className="font-medium">{toast.text}</div>
            {toast.notes.map((n, i) => <div key={i} className="mt-1.5 flex items-start gap-1.5 text-xs text-orange-200"><Zap size={12} className="mt-0.5 shrink-0" /><span>TRIGGER {n}</span></div>)}
          </div>
        )}
      </div>
    </AppCtx.Provider>
  )
}

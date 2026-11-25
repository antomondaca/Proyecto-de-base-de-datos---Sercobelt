import { createContext, useContext } from 'react'
export type Ctx = { act: (ok: string, fn: () => string[]) => boolean; go: (page: string) => void }
export const AppCtx = createContext<Ctx>(null as unknown as Ctx)
export const useApp = () => useContext(AppCtx)

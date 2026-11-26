import { createContext, useContext } from 'react'
export type Ctx = { act: (ok: string, fn: () => Promise<string[]>) => Promise<boolean>; busy: boolean; go: (page: string) => void; canAtender: boolean }
export const AppCtx = createContext<Ctx>(null as unknown as Ctx)
export const useApp = () => useContext(AppCtx)

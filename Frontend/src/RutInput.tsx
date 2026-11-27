import { useLayoutEffect, useRef, useState } from 'react'
import { contarSignificativos, formatearRut, formatearRutLimpio, limpiarRut, posicionTrasSignificativos } from './rut'

type Props = { name: string; required?: boolean; defaultValue?: string | null; className?: string }

// Input de RUT con formato automático; conserva la posición del cursor al escribir, borrar o pegar
export default function RutInput({ name, required, defaultValue, className }: Props) {
  const [value, setValue] = useState(() => formatearRut(defaultValue ?? ''))
  const ref = useRef<HTMLInputElement>(null)
  const caret = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (caret.current !== null && ref.current) { ref.current.setSelectionRange(caret.current, caret.current); caret.current = null }
  }, [value])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const pos = e.target.selectionStart ?? raw.length
    const tipo = (e.nativeEvent as InputEvent).inputType ?? ''
    let sig = contarSignificativos(raw, pos)
    let limpio = raw.toUpperCase().replace(/[^0-9K]/g, '')
    // Si se borró solo un separador (punto o guion), se elimina el carácter significativo contiguo
    if (contarSignificativos(raw, raw.length) === contarSignificativos(value, value.length)) {
      if (tipo === 'deleteContentBackward' && sig > 0) { limpio = limpio.slice(0, sig - 1) + limpio.slice(sig); sig -= 1 }
      else if (tipo === 'deleteContentForward') limpio = limpio.slice(0, sig) + limpio.slice(sig + 1)
    }
    const formateado = formatearRutLimpio(limpiarRut(limpio))
    caret.current = posicionTrasSignificativos(formateado, sig)
    setValue(formateado)
  }

  return <input ref={ref} name={name} required={required} maxLength={12} inputMode="text" autoComplete="off" placeholder="12.345.678-9" value={value} onChange={onChange} className={className} />
}

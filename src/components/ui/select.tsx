import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export type SelectProps = {
  value?: string
  onValueChange?: (v: string) => void
  children: React.ReactNode
}

const SelectContext = React.createContext<{
  value: string
  setValue: (v: string) => void
  open: boolean
  setOpen: (v: boolean) => void
} | null>(null)

export function Select({ value: valueProp = '', onValueChange, children }: SelectProps) {
  const [value, setValue] = React.useState(valueProp)
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => setValue(valueProp), [valueProp])
  const ctx = React.useMemo(() => ({ value, setValue: (v: string) => {
    setValue(v)
    onValueChange?.(v)
  }, open, setOpen }), [value, onValueChange, open])
  return <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>
}

export function SelectTrigger({ className, children }: { className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(SelectContext)!
  return (
    <button type="button" onClick={() => ctx.setOpen(!ctx.open)} className={cn('inline-flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm', className)}>
      <div className="flex items-center gap-2">{children}</div>
      <ChevronDown className={cn('h-4 w-4 transition-transform', ctx.open && 'rotate-180')} />
    </button>
  )
}

export function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(SelectContext)!
  if (!ctx.open) return null
  return (
    <div className={cn('mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md', className)}>
      {children}
    </div>
  )
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(SelectContext)!
  const selected = ctx.value === value
  return (
    <button
      type="button"
      onClick={() => {
        ctx.setValue(value)
        ctx.setOpen(false)
      }}
      className={cn('w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground', selected && 'bg-accent/50')}
    >
      {children}
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext)!
  return <span className="truncate text-left flex-1">{ctx.value || placeholder}</span>
}

import * as React from 'react'
import { cn } from '../../lib/utils'

export function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'destructive' | 'outline' }) {
  const styles: Record<string, string> = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border',
  }
  return <div className={cn('inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium', styles[variant], className)} {...props} />
}

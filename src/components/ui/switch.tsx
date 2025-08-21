"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
    }

    return (
      <label className={cn("relative inline-flex h-6 w-11 cursor-pointer", className)}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />
        <span
          className={cn(
            "inline-block h-6 w-11 rounded-full bg-gray-200 transition-colors duration-200 ease-in-out",
            checked && "bg-primary"
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              checked ? "translate-x-5" : "translate-x-0.5 translate-y-0.5"
            )}
          />
        </span>
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }

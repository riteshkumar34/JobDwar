import { X } from 'lucide-react'
import { Job, FiltersState } from '@/lib/types'
import { FiltersBar } from './FiltersBar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FiltersSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FiltersState
  jobs: Job[]
  onChange: (filters: Partial<FiltersState>) => void
  onReset: () => void
}

export function FiltersSheet({ 
  open, 
  onOpenChange, 
  filters, 
  jobs, 
  onChange, 
  onReset 
}: FiltersSheetProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
      )}
      
      {/* Sheet */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out sm:max-w-md",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mt-6 h-full overflow-y-auto pb-16">
          <FiltersBar
            filters={filters}
            jobs={jobs}
            onChange={onChange}
          />
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onReset}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

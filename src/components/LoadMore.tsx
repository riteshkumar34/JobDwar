import { motion } from 'framer-motion'
import { Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LoadMoreProps {
  onLoadMore: () => void
  hasMore: boolean
  loading: boolean
  className?: string
}

export function LoadMore({ onLoadMore, hasMore, loading, className }: LoadMoreProps) {
  if (!hasMore) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex justify-center ${className}`}
    >
      <Button
        variant="outline"
        size="lg"
        onClick={onLoadMore}
        disabled={loading}
        className="w-full max-w-xs"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <ChevronDown className="mr-2 h-4 w-4" />
            Load More Jobs
          </>
        )}
      </Button>
    </motion.div>
  )
}

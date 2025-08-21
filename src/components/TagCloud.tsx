import { motion } from 'framer-motion'
import { Job } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Hash } from 'lucide-react'

interface TagCloudProps {
  jobs: Job[]
  selectedTags: string[]
  onTagClick: (tag: string) => void
  maxTags?: number
}

export function TagCloud({ jobs, selectedTags, onTagClick, maxTags = 20 }: TagCloudProps) {
  // Count tag frequencies
  const tagCounts = jobs.reduce((acc, job) => {
    job.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  // Sort tags by frequency and take top N
  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxTags)

  if (sortedTags.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Popular Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {sortedTags.map(([tag, count], index) => {
            const isSelected = selectedTags.includes(tag)
            const size = Math.min(Math.max(count, 1), 5) // Scale between 1-5
            
            return (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={isSelected ? "default" : "secondary"}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'hover:bg-primary/20 hover:text-primary'
                  }`}
                  style={{
                    fontSize: `${0.75 + (size - 1) * 0.05}rem`,
                    padding: `${2 + (size - 1) * 0.5}px ${4 + (size - 1) * 1}px`
                  }}
                  onClick={() => onTagClick(tag)}
                >
                  {tag}
                  <span className="ml-1 text-xs opacity-70">
                    {count}
                  </span>
                </Badge>
              </motion.div>
            )
          })}
        </div>
        
        {sortedTags.length === maxTags && Object.keys(tagCounts).length > maxTags && (
          <p className="mt-3 text-xs text-muted-foreground">
            Showing top {maxTags} of {Object.keys(tagCounts).length} skills
          </p>
        )}
      </CardContent>
    </Card>
  )
}

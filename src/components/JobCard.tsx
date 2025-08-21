import { motion } from 'framer-motion'
import { MapPin, Clock, DollarSign, Users, Building2 } from 'lucide-react'
import { Job } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface JobCardProps {
  job: Job
  onClick?: () => void
  className?: string
}

export function JobCard({ job, onClick, className }: JobCardProps) {
  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
      return num.toString()
    }
    
    return `$${formatNumber(min)} - $${formatNumber(max)}`
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'part-time': return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'contract': return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case 'freelance': return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
      case 'internship': return 'bg-pink-100 text-pink-800 hover:bg-pink-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'entry': return 'bg-emerald-100 text-emerald-800'
      case 'mid': return 'bg-yellow-100 text-yellow-800'
      case 'senior': return 'bg-red-100 text-red-800'
      case 'lead': return 'bg-indigo-100 text-indigo-800'
      case 'principal': return 'bg-violet-100 text-violet-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card 
      className={cn(
        "h-full cursor-pointer transition-all duration-200 hover:shadow-md group",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{job.company}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge variant="secondary" className={getTypeColor(job.type)}>
              {job.type}
            </Badge>
            <Badge variant="outline" className={getLevelColor(job.level)}>
              {job.level}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
            {job.remote_friendly && (
              <Badge variant="outline" className="text-xs ml-auto">
                Remote
              </Badge>
            )}
          </div>

          {/* Salary */}
          {job.salary_min && job.salary_max && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 flex-shrink-0 text-green-600" />
              <span className="font-medium text-green-700">
                {formatSalary(job.salary_min, job.salary_max)}
              </span>
              <span className="text-muted-foreground text-xs">/ year</span>
            </div>
          )}

          {/* Posted Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
          </div>

          {/* Description preview */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {job.description}
          </p>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {tag}
                </Badge>
              ))}
              {job.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Button 
          className="w-full group-hover:shadow-sm transition-shadow" 
          size="sm"
        >
          <Users className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}

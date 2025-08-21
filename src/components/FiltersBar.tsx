import { Search, MapPin, Briefcase, TrendingUp, DollarSign } from 'lucide-react'
import { Job, FiltersState } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FiltersBarProps {
  filters: FiltersState
  jobs: Job[]
  onChange: (filters: Partial<FiltersState>) => void
}

export function FiltersBar({ filters, jobs, onChange }: FiltersBarProps) {
  // Get unique values for filter options
  const locations = Array.from(new Set(jobs.map(job => job.location).filter(Boolean)))
  const types = Array.from(new Set(jobs.map(job => job.type)))
  const levels = Array.from(new Set(jobs.map(job => job.level)))

  // Calculate salary range from jobs
  const salaries = jobs
    .filter(job => job.salary_min && job.salary_max)
    .flatMap(job => [job.salary_min!, job.salary_max!])
  
  const minSalary = salaries.length > 0 ? Math.min(...salaries) : 0
  const maxSalary = salaries.length > 0 ? Math.max(...salaries) : 200000

  const formatSalary = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Input
            placeholder="Search jobs, companies, skills..."
            value={filters.search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ search: e.target.value })}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select
            value={filters.location}
            onValueChange={(value) => onChange({ location: value === 'all' ? '' : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Job Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Job Type
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select
            value={filters.type}
            onValueChange={(value) => onChange({ type: value === 'all' ? '' : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Experience Level */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Experience Level
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select
            value={filters.level}
            onValueChange={(value) => onChange({ level: value === 'all' ? '' : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Salary Range */}
      {salaries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Salary Range
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="px-2">
              <Slider
                value={filters.salaryRange}
                onValueChange={(value: number[]) => onChange({ salaryRange: value as [number, number] })}
                max={maxSalary}
                min={minSalary}
                step={5000}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatSalary(filters.salaryRange[0])}</span>
              <span>{formatSalary(filters.salaryRange[1])}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remote Only */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="remote-only" className="text-sm font-medium">
                Remote jobs only
              </Label>
              <p className="text-xs text-muted-foreground">
                Show only remote-friendly positions
              </p>
            </div>
            <Switch
              id="remote-only"
              checked={filters.remoteOnly}
              onCheckedChange={(checked: boolean) => onChange({ remoteOnly: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sort */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Sort by</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select
            value={filters.sort}
            onValueChange={(value) => onChange({ sort: value as FiltersState['sort'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="salary-high">Salary: High to Low</SelectItem>
              <SelectItem value="salary-low">Salary: Low to High</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}

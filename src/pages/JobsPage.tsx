import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'

import { Job, FiltersState, defaultFilters, LoadingState, PaginationState } from '@/lib/types'
import { loadJobsFromCSV } from '@/lib/csv'
import { searchJobs, filterJobs, sortJobs, filtersToSearchParams, searchParamsToFilters, debounce } from '@/lib/utils'

import { JobsList } from '@/components/JobsList'
import { FiltersBar } from '@/components/FiltersBar'
import { FiltersSheet } from '@/components/FiltersSheet'
import { TagCloud } from '@/components/TagCloud'
import { EmptyState } from '@/components/EmptyState'
import { Skeletons } from '@/components/Skeletons'
import { LoadMore } from '@/components/LoadMore'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const JOBS_PER_PAGE = 12

export function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Data state
  const [allJobs, setAllJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true, error: null })
  
  // Filter state
  const [filters, setFilters] = useState<FiltersState>(() => ({
    ...defaultFilters,
    ...searchParamsToFilters(searchParams),
  }))
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: JOBS_PER_PAGE,
    total: 0,
  })
  
  // UI state
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Load jobs data
  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading({ isLoading: true, error: null })
        const result = await loadJobsFromCSV()
        
        if (result.errors.length > 0) {
          console.warn('CSV parsing warnings:', result.errors)
        }
        
        setAllJobs(result.jobs)
        setLoading({ isLoading: false, error: null })
        
      } catch (error) {
        setLoading({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load jobs'
        })
      }
    }
    
    loadJobs()
  }, [])

  // Update URL when filters change
  const updateSearchParams = useCallback(
    debounce((newFilters: FiltersState) => {
      const params = filtersToSearchParams(newFilters)
      setSearchParams(params, { replace: true })
    }, 300),
    [setSearchParams]
  )

  useEffect(() => {
    updateSearchParams(filters)
  }, [filters, updateSearchParams])

  // Process jobs (search, filter, sort)
  const processedJobs = useMemo(() => {
    let jobs = allJobs
    
    // Apply search
    if (filters.search) {
      jobs = searchJobs(jobs, filters.search)
    }
    
    // Apply filters
    jobs = filterJobs(jobs, filters)
    
    // Apply sorting
    jobs = sortJobs(jobs, filters.sort)
    
    return jobs
  }, [allJobs, filters])

  // Paginate jobs
  const paginatedJobs = useMemo(() => {
    const start = 0
    const end = pagination.page * pagination.limit
    return processedJobs.slice(start, end)
  }, [processedJobs, pagination])

  // Update pagination when processed jobs change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: processedJobs.length,
    }))
  }, [processedJobs.length])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Partial<FiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }, [])

  // Handle search
  const handleSearchChange = useCallback((search: string) => {
    handleFiltersChange({ search })
  }, [handleFiltersChange])

  // Handle load more
  const handleLoadMore = useCallback(() => {
    setPagination(prev => ({ ...prev, page: prev.page + 1 }))
  }, [])

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== defaultFilters.search ||
      filters.location !== defaultFilters.location ||
      filters.type !== defaultFilters.type ||
      filters.level !== defaultFilters.level ||
      filters.tags.length > 0 ||
      filters.salaryRange[0] !== defaultFilters.salaryRange[0] ||
      filters.salaryRange[1] !== defaultFilters.salaryRange[1] ||
      filters.remoteOnly !== defaultFilters.remoteOnly ||
      filters.sort !== defaultFilters.sort
    )
  }, [filters])

  const hasMoreJobs = paginatedJobs.length < processedJobs.length

  if (loading.error) {
    return (
      <div className="container py-16">
        <EmptyState
          title="Failed to load jobs"
          description={loading.error}
          action={{
            label: "Try again",
            onClick: () => window.location.reload()
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Job Listings</h1>
              <p className="text-muted-foreground">
                {loading.isLoading ? 'Loading...' : `${processedJobs.length} jobs available`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset filters
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen(true)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="mt-4 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <FiltersBar
                filters={filters}
                jobs={allJobs}
                onChange={handleFiltersChange}
              />
              
              <TagCloud
                jobs={allJobs}
                selectedTags={filters.tags}
                onTagClick={(tag) => {
                  const newTags = filters.tags.includes(tag)
                    ? filters.tags.filter(t => t !== tag)
                    : [...filters.tags, tag]
                  handleFiltersChange({ tags: newTags })
                }}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {loading.isLoading ? (
              <Skeletons count={6} />
            ) : processedJobs.length === 0 ? (
              <EmptyState
                title="No jobs found"
                description="Try adjusting your search criteria or filters."
                action={hasActiveFilters ? {
                  label: "Clear filters",
                  onClick: handleResetFilters
                } : undefined}
              />
            ) : (
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${filters.search}-${filters.location}-${filters.type}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <JobsList
                      jobs={paginatedJobs}
                      onJobSelect={setSelectedJob}
                    />
                  </motion.div>
                </AnimatePresence>
                
                {hasMoreJobs && (
                  <LoadMore
                    onLoadMore={handleLoadMore}
                    hasMore={hasMoreJobs}
                    loading={false}
                  />
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      <FiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        jobs={allJobs}
        onChange={handleFiltersChange}
        onReset={handleResetFilters}
      />
    </div>
  )
}

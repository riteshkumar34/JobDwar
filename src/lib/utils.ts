import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Job, FiltersState } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format salary range
 */
export function formatSalaryRange(min?: number, max?: number): string {
  if (!min && !max) return ''
  if (min && max) {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`
  }
  if (min) return `From ${formatCurrency(min)}`
  if (max) return `Up to ${formatCurrency(max)}`
  return ''
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatTimeAgo(date: string | Date): string {
  const now = new Date()
  const past = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(past.getTime())) {
    return 'Recently'
  }

  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`
  
  return past.toLocaleDateString()
}

/**
 * Parse date string to Date object with fallback
 */
export function parseDate(dateString: string): Date {
  if (!dateString) return new Date()
  
  // Try ISO format first
  let date = new Date(dateString)
  if (!isNaN(date.getTime())) return date
  
  // Try common formats
  const formats = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
  ]
  
  for (const format of formats) {
    if (format.test(dateString)) {
      date = new Date(dateString)
      if (!isNaN(date.getTime())) return date
    }
  }
  
  return new Date() // Fallback to current date
}

/**
 * Normalize string for search (lowercase, trim, remove special chars)
 */
export function normalizeSearchString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
}

/**
 * Search jobs by query string
 */
export function searchJobs(jobs: Job[], query: string): Job[] {
  if (!query.trim()) return jobs
  
  const normalizedQuery = normalizeSearchString(query)
  const searchTerms = normalizedQuery.split(' ').filter(Boolean)
  
  return jobs.filter(job => {
    const searchableText = [
      job.title,
      job.company,
      job.location,
      job.description,
      ...job.tags,
      job.type,
      job.level,
    ].join(' ')
    
    const normalizedText = normalizeSearchString(searchableText)
    
    return searchTerms.every(term => 
      normalizedText.includes(term)
    )
  })
}

/**
 * Filter jobs by filters state
 */
export function filterJobs(jobs: Job[], filters: FiltersState): Job[] {
  return jobs.filter(job => {
    // Location filter
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false
    }
    
    // Type filter
    if (filters.type && job.type !== filters.type) {
      return false
    }
    
    // Level filter
    if (filters.level && job.level !== filters.level) {
      return false
    }
    
    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag =>
        job.tags.some(jobTag =>
          jobTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
      if (!hasMatchingTag) return false
    }
    
    // Salary range filter
    const [minSalary, maxSalary] = filters.salaryRange
    if (job.salary_min && job.salary_min < minSalary) return false
    if (job.salary_max && job.salary_max > maxSalary) return false
    
    // Remote filter
    if (filters.remoteOnly && !job.remote_friendly) return false
    
    return true
  })
}

/**
 * Sort jobs by sort option
 */
export function sortJobs(jobs: Job[], sortBy: FiltersState['sort']): Job[] {
  const sorted = [...jobs]
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => 
        parseDate(b.posted_at).getTime() - parseDate(a.posted_at).getTime()
      )
    case 'oldest':
      return sorted.sort((a, b) => 
        parseDate(a.posted_at).getTime() - parseDate(b.posted_at).getTime()
      )
    case 'salary-high':
      return sorted.sort((a, b) => {
        const aSalary = a.salary_max || a.salary_min || 0
        const bSalary = b.salary_max || b.salary_min || 0
        return bSalary - aSalary
      })
    case 'salary-low':
      return sorted.sort((a, b) => {
        const aSalary = a.salary_min || a.salary_max || 0
        const bSalary = b.salary_min || b.salary_max || 0
        return aSalary - bSalary
      })
    case 'alphabetical':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return sorted
  }
}

/**
 * Get unique values from jobs for filter options
 */
export function getUniqueValues<K extends keyof Job>(
  jobs: Job[],
  key: K,
  includeCount = false
): Array<{ value: string; label: string; count?: number }> {
  const valueMap = new Map<string, number>()
  
  jobs.forEach(job => {
    const value = job[key]
    if (value && typeof value === 'string') {
      const count = valueMap.get(value) || 0
      valueMap.set(value, count + 1)
    }
  })
  
  return Array.from(valueMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([value, count]) => ({
      value,
      label: value,
      ...(includeCount && { count }),
    }))
}

/**
 * Get unique tags from all jobs
 */
export function getUniqueTags(jobs: Job[], includeCount = false): Array<{ value: string; label: string; count?: number }> {
  const tagMap = new Map<string, number>()
  
  jobs.forEach(job => {
    job.tags.forEach(tag => {
      if (tag) {
        const count = tagMap.get(tag) || 0
        tagMap.set(tag, count + 1)
      }
    })
  })
  
  return Array.from(tagMap.entries())
    .sort(([, a], [, b]) => b - a) // Sort by count descending
    .map(([tag, count]) => ({
      value: tag,
      label: tag,
      ...(includeCount && { count }),
    }))
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Generate URL search params from filters
 */
export function filtersToSearchParams(filters: FiltersState): URLSearchParams {
  const params = new URLSearchParams()
  
  if (filters.search) params.set('q', filters.search)
  if (filters.location) params.set('location', filters.location)
  if (filters.type) params.set('type', filters.type)
  if (filters.level) params.set('level', filters.level)
  if (filters.tags.length > 0) params.set('tags', filters.tags.join(','))
  if (filters.salaryRange[0] > 0) params.set('salaryMin', filters.salaryRange[0].toString())
  if (filters.salaryRange[1] < 200000) params.set('salaryMax', filters.salaryRange[1].toString())
  if (filters.remoteOnly) params.set('remote', 'true')
  if (filters.sort !== 'newest') params.set('sort', filters.sort)
  
  return params
}

/**
 * Parse URL search params to filters
 */
export function searchParamsToFilters(params: URLSearchParams): Partial<FiltersState> {
  const filters: Partial<FiltersState> = {}
  
  const search = params.get('q')
  if (search) filters.search = search
  
  const location = params.get('location')
  if (location) filters.location = location
  
  const type = params.get('type')
  if (type) filters.type = type
  
  const level = params.get('level')
  if (level) filters.level = level
  
  const tags = params.get('tags')
  if (tags) filters.tags = tags.split(',').filter(Boolean)
  
  const salaryMin = params.get('salaryMin')
  const salaryMax = params.get('salaryMax')
  if (salaryMin || salaryMax) {
    filters.salaryRange = [
      salaryMin ? parseInt(salaryMin, 10) : 0,
      salaryMax ? parseInt(salaryMax, 10) : 200000,
    ]
  }
  
  const remote = params.get('remote')
  if (remote === 'true') filters.remoteOnly = true
  
  const sort = params.get('sort')
  if (sort && ['newest', 'oldest', 'salary-high', 'salary-low', 'alphabetical'].includes(sort)) {
    filters.sort = sort as FiltersState['sort']
  }
  
  return filters
}

/**
 * Local storage helpers
 */
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore storage errors
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore storage errors
    }
  },
}

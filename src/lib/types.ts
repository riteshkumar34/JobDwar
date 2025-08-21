import { z } from 'zod'

// Core Job Schema
export const JobSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().default(''),
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']).default('Full-time'),
  level: z.enum(['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Principal', 'Director']).default('Mid'),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  tags: z.array(z.string()).default([]),
  posted_at: z.string().default(''),
  apply_url: z.string().url().optional(),
  description: z.string().default(''),
  benefits: z.string().optional(),
  requirements: z.string().optional(),
  company_logo: z.string().url().optional(),
  company_website: z.string().url().optional(),
  remote_friendly: z.boolean().default(false),
  featured: z.boolean().default(false),
})

export type Job = z.infer<typeof JobSchema>

// Filter State
export interface FiltersState {
  search: string
  location: string
  type: string
  level: string
  tags: string[]
  salaryRange: [number, number]
  remoteOnly: boolean
  sort: 'newest' | 'oldest' | 'salary-high' | 'salary-low' | 'alphabetical'
}

export const defaultFilters: FiltersState = {
  search: '',
  location: '',
  type: '',
  level: '',
  tags: [],
  salaryRange: [0, 200000],
  remoteOnly: false,
  sort: 'newest',
}

// Search and Filter Types
export interface SearchParams {
  q?: string
  location?: string
  type?: string
  level?: string
  tags?: string
  salaryMin?: string
  salaryMax?: string
  remote?: string
  sort?: string
  page?: string
}

// UI State Types
export interface PaginationState {
  page: number
  limit: number
  total: number
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

// CSV Parsing Types
export interface CSVRow {
  [key: string]: string
}

export interface ParsedCSVResult {
  jobs: Job[]
  errors: string[]
  totalRows: number
  validRows: number
}

// Component Props Types
export interface JobCardProps {
  job: Job
  onSelect?: (job: Job) => void
  featured?: boolean
}

export interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

// Analytics Events
export interface AnalyticsEvent {
  event: string
  properties: Record<string, any>
}

// Utility Types
export type SortOption = {
  value: FiltersState['sort']
  label: string
}

export type FilterOption = {
  value: string
  label: string
  count?: number
}

// Error Types
export class CSVParsingError extends Error {
  constructor(
    message: string,
    public rowIndex?: number,
    public field?: string
  ) {
    super(message)
    this.name = 'CSVParsingError'
  }
}

export class DataFetchError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'DataFetchError'
  }
}

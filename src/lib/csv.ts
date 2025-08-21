import Papa from 'papaparse'
import { Job, JobSchema, CSVRow, ParsedCSVResult, CSVParsingError, DataFetchError } from './types'
import { parseDate } from './utils'

/**
 * Fetch CSV data from URL or file
 */
export async function fetchCSVData(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new DataFetchError(
        `Failed to fetch CSV: ${response.statusText}`,
        response.status
      )
    }
    
    const text = await response.text()
    
    if (!text.trim()) {
      throw new DataFetchError('CSV file is empty')
    }
    
    return text
  } catch (error) {
    if (error instanceof DataFetchError) {
      throw error
    }
    
    throw new DataFetchError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Parse CSV string to jobs array with validation
 */
export function parseCSVToJobs(csvText: string): ParsedCSVResult {
  const result: ParsedCSVResult = {
    jobs: [],
    errors: [],
    totalRows: 0,
    validRows: 0,
  }
  
  try {
    const parseResult = Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Normalize common header variations
        const normalized = header.toLowerCase().trim()
        const headerMap: Record<string, string> = {
          'job title': 'title',
          'job_title': 'title',
          'position': 'title',
          'role': 'title',
          'company name': 'company',
          'company_name': 'company',
          'organization': 'company',
          'org': 'company',
          'job type': 'type',
          'job_type': 'type',
          'employment_type': 'type',
          'employment': 'type',
          'experience_level': 'level',
          'seniority_level': 'level',
          'seniority': 'level',
          'experience': 'level',
          'min_salary': 'salary_min',
          'max_salary': 'salary_max',
          'minimum_salary': 'salary_min',
          'maximum_salary': 'salary_max',
          'salary_minimum': 'salary_min',
          'salary_maximum': 'salary_max',
          'skills': 'tags',
          'technologies': 'tags',
          'tech_stack': 'tags',
          'requirements': 'tags',
          'posted': 'posted_at',
          'post_date': 'posted_at',
          'date_posted': 'posted_at',
          'publish_date': 'posted_at',
          'application_url': 'apply_url',
          'apply_link': 'apply_url',
          'application_link': 'apply_url',
          'url': 'apply_url',
          'job_description': 'description',
          'job_summary': 'description',
          'summary': 'description',
          'remote': 'remote_friendly',
          'is_remote': 'remote_friendly',
          'remote_work': 'remote_friendly',
          'work_from_home': 'remote_friendly',
        }
        
        return headerMap[normalized] || normalized
      }
    })
    
    result.totalRows = parseResult.data.length
    
    if (parseResult.errors.length > 0) {
      result.errors.push(
        ...parseResult.errors.map(error => 
          `Row ${error.row}: ${error.message}`
        )
      )
    }
    
    // Process each row
    parseResult.data.forEach((row, index) => {
      try {
        const job = processCSVRow(row, index)
        if (job) {
          result.jobs.push(job)
          result.validRows++
        }
      } catch (error) {
        const errorMessage = error instanceof CSVParsingError 
          ? error.message 
          : `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
        
        result.errors.push(`Row ${index + 2}: ${errorMessage}`)
      }
    })
    
    return result
    
  } catch (error) {
    throw new CSVParsingError(
      `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Process a single CSV row into a Job object
 */
function processCSVRow(row: CSVRow, rowIndex: number): Job | null {
  // Skip empty rows
  if (!row || Object.values(row).every(value => !value?.trim())) {
    return null
  }
  
  try {
    // Generate ID if not provided
    const id = row.id?.trim() || `job-${rowIndex + 1}`
    
    // Required fields
    const title = row.title?.trim()
    const company = row.company?.trim()
    
    if (!title) {
      throw new CSVParsingError('Title is required', rowIndex, 'title')
    }
    
    if (!company) {
      throw new CSVParsingError('Company is required', rowIndex, 'company')
    }
    
    // Parse and normalize job type
    const type = normalizeJobType(row.type?.trim() || '')
    
    // Parse and normalize experience level
    const level = normalizeExperienceLevel(row.level?.trim() || '')
    
    // Parse salary values
    const salary_min = parseSalary(row.salary_min)
    const salary_max = parseSalary(row.salary_max)
    
    // Validate salary range
    if (salary_min && salary_max && salary_min > salary_max) {
      throw new CSVParsingError(
        'Minimum salary cannot be greater than maximum salary',
        rowIndex,
        'salary'
      )
    }
    
    // Parse tags (comma or pipe separated)
    const tags = parseTags(row.tags || '')
    
    // Parse boolean fields
    const remote_friendly = parseBoolean(row.remote_friendly)
    const featured = parseBoolean(row.featured)
    
    // Parse and validate URLs
    const apply_url = parseURL(row.apply_url)
    const company_logo = parseURL(row.company_logo)
    const company_website = parseURL(row.company_website)
    
    // Create job object
    const jobData = {
      id,
      title,
      company,
      location: row.location?.trim() || '',
      type,
      level,
      salary_min,
      salary_max,
      tags,
      posted_at: row.posted_at?.trim() || new Date().toISOString(),
      apply_url,
      description: row.description?.trim() || '',
      benefits: row.benefits?.trim() || undefined,
      requirements: row.requirements?.trim() || undefined,
      company_logo,
      company_website,
      remote_friendly,
      featured,
    }
    
    // Validate with Zod schema
    const validatedJob = JobSchema.parse(jobData)
    
    return validatedJob
    
  } catch (error) {
    if (error instanceof CSVParsingError) {
      throw error
    }
    
    throw new CSVParsingError(
      `Invalid job data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      rowIndex
    )
  }
}

/**
 * Normalize job type to match schema enum
 */
function normalizeJobType(type: string): Job['type'] {
  const normalized = type.toLowerCase().trim()
  
  const typeMap: Record<string, Job['type']> = {
    'full-time': 'Full-time',
    'fulltime': 'Full-time',
    'full time': 'Full-time',
    'ft': 'Full-time',
    'part-time': 'Part-time',
    'parttime': 'Part-time',
    'part time': 'Part-time',
    'pt': 'Part-time',
    'contract': 'Contract',
    'contractor': 'Contract',
    'freelance': 'Freelance',
    'freelancer': 'Freelance',
    'intern': 'Internship',
    'internship': 'Internship',
    'temporary': 'Contract',
    'temp': 'Contract',
  }
  
  return typeMap[normalized] || 'Full-time'
}

/**
 * Normalize experience level to match schema enum
 */
function normalizeExperienceLevel(level: string): Job['level'] {
  const normalized = level.toLowerCase().trim()
  
  const levelMap: Record<string, Job['level']> = {
    'entry': 'Entry',
    'entry-level': 'Entry',
    'entry level': 'Entry',
    'graduate': 'Entry',
    'junior': 'Junior',
    'jr': 'Junior',
    'mid': 'Mid',
    'mid-level': 'Mid',
    'mid level': 'Mid',
    'middle': 'Mid',
    'intermediate': 'Mid',
    'senior': 'Senior',
    'sr': 'Senior',
    'senior-level': 'Senior',
    'senior level': 'Senior',
    'lead': 'Lead',
    'team lead': 'Lead',
    'tech lead': 'Lead',
    'technical lead': 'Lead',
    'principal': 'Principal',
    'staff': 'Principal',
    'architect': 'Principal',
    'director': 'Director',
    'head': 'Director',
    'vp': 'Director',
    'vice president': 'Director',
  }
  
  return levelMap[normalized] || 'Mid'
}

/**
 * Parse salary string to number
 */
function parseSalary(salary: string | undefined): number | undefined {
  if (!salary?.trim()) return undefined
  
  // Remove currency symbols and common formatting
  const cleaned = salary
    .replace(/[$,\s]/g, '')
    .replace(/k$/i, '000')
    .replace(/m$/i, '000000')
  
  const number = parseFloat(cleaned)
  
  if (isNaN(number) || number < 0) return undefined
  
  // Convert to annual if looks like hourly (< 200)
  if (number < 200) {
    return Math.round(number * 40 * 52) // 40 hours/week, 52 weeks/year
  }
  
  return Math.round(number)
}

/**
 * Parse tags from string (comma or pipe separated)
 */
function parseTags(tagsString: string): string[] {
  if (!tagsString?.trim()) return []
  
  return tagsString
    .split(/[,|;]/)
    .map(tag => tag.trim())
    .filter(Boolean)
    .slice(0, 10) // Limit to 10 tags
}

/**
 * Parse boolean value from string
 */
function parseBoolean(value: string | undefined): boolean {
  if (!value?.trim()) return false
  
  const normalized = value.toLowerCase().trim()
  return ['true', '1', 'yes', 'y', 'on'].includes(normalized)
}

/**
 * Parse and validate URL
 */
function parseURL(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined
  
  try {
    const trimmed = url.trim()
    
    // Add protocol if missing
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`
    }
    
    // Validate URL
    new URL(trimmed)
    return trimmed
    
  } catch {
    return undefined
  }
}

/**
 * Load jobs from CSV URL with caching
 */
export async function loadJobsFromCSV(url?: string): Promise<ParsedCSVResult> {
  const csvUrl = url || import.meta.env.VITE_JOBS_CSV_URL
  
  if (!csvUrl) {
    // Fallback to local sample data
    try {
      const csvText = await fetchCSVData('/sample-jobs.csv')
      return parseCSVToJobs(csvText)
    } catch {
      throw new DataFetchError(
        'No CSV URL configured and sample data not available. Please set VITE_JOBS_CSV_URL environment variable.'
      )
    }
  }
  
  const csvText = await fetchCSVData(csvUrl)
  return parseCSVToJobs(csvText)
}

/**
 * Validate CSV headers to ensure required fields are present
 */
export function validateCSVHeaders(headers: string[]): string[] {
  const requiredFields = ['title', 'company']
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
  
  const missingFields = requiredFields.filter(field => {
    const variations = getHeaderVariations(field)
    return !variations.some(variation => 
      normalizedHeaders.includes(variation)
    )
  })
  
  return missingFields
}

/**
 * Get common header variations for a field
 */
function getHeaderVariations(field: string): string[] {
  const variations: Record<string, string[]> = {
    'title': ['title', 'job title', 'job_title', 'position', 'role'],
    'company': ['company', 'company name', 'company_name', 'organization', 'org'],
  }
  
  return variations[field] || [field]
}

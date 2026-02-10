/**
 * Client-side jobs storage using localStorage
 * This persists jobs across page refreshes and browser sessions
 */

import { JobPosting } from '@/types'

const STORAGE_KEY_PREFIX = 'stored_jobs_'
const STORAGE_META_KEY = 'stored_jobs_metadata'

export interface StoredJobsMetadata {
  dateRange: string
  totalJobs: number
  searchDate: string
  dateRangeInfo: {
    from: string
    to: string
    fromFormatted: string
    toFormatted: string
  }
}

/**
 * Save jobs to localStorage
 */
export function saveJobsToStorage(
  dateRange: string,
  jobs: JobPosting[],
  totalJobs: number,
  dateRangeInfo: {
    from: string
    to: string
    fromFormatted: string
    toFormatted: string
  }
): void {
  if (typeof window === 'undefined') return

  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${dateRange}`
    const metadata: StoredJobsMetadata = {
      dateRange,
      totalJobs,
      searchDate: new Date().toISOString(),
      dateRangeInfo
    }

    // Store jobs
    localStorage.setItem(storageKey, JSON.stringify(jobs))
    
    // Store metadata
    const allMetadata = getAllMetadata()
    allMetadata[dateRange] = metadata
    localStorage.setItem(STORAGE_META_KEY, JSON.stringify(allMetadata))

    console.log(`💾 Saved ${jobs.length} jobs to localStorage for date range: ${dateRange} days`)
  } catch (error) {
    console.error('Error saving jobs to localStorage:', error)
    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Clearing old data...')
      clearOldStoredJobs()
      // Retry once
      try {
        const storageKey = `${STORAGE_KEY_PREFIX}${dateRange}`
        localStorage.setItem(storageKey, JSON.stringify(jobs))
        const allMetadata = getAllMetadata()
        allMetadata[dateRange] = {
          dateRange,
          totalJobs,
          searchDate: new Date().toISOString(),
          dateRangeInfo
        }
        localStorage.setItem(STORAGE_META_KEY, JSON.stringify(allMetadata))
      } catch (retryError) {
        console.error('Failed to save after clearing old data:', retryError)
      }
    }
  }
}

/**
 * Load jobs from localStorage
 */
export function loadJobsFromStorage(dateRange: string): {
  jobs: JobPosting[]
  metadata: StoredJobsMetadata | null
} | null {
  if (typeof window === 'undefined') return null

  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${dateRange}`
    const jobsJson = localStorage.getItem(storageKey)
    
    if (!jobsJson) {
      return null
    }

    const jobs = JSON.parse(jobsJson) as JobPosting[]
    const allMetadata = getAllMetadata()
    const metadata = allMetadata[dateRange] || null

    // Check if jobs are still fresh (less than 24 hours old)
    if (metadata) {
      const storedDate = new Date(metadata.searchDate)
      const now = new Date()
      const hoursSinceSearch = (now.getTime() - storedDate.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceSearch > 24) {
        // Jobs are older than 24 hours, remove them
        clearStoredJobs(dateRange)
        return null
      }
    }

    return {
      jobs,
      metadata
    }
  } catch (error) {
    console.error('Error loading jobs from localStorage:', error)
    return null
  }
}

/**
 * Get metadata for all stored date ranges
 */
function getAllMetadata(): Record<string, StoredJobsMetadata> {
  if (typeof window === 'undefined') return {}
  
  try {
    const metadataJson = localStorage.getItem(STORAGE_META_KEY)
    return metadataJson ? JSON.parse(metadataJson) : {}
  } catch (error) {
    console.error('Error loading metadata:', error)
    return {}
  }
}

/**
 * Get all stored jobs metadata (for UI display)
 */
export function getAllStoredJobsMetadata(): Array<{
  dateRange: string
  count: number
  searchDate: string
  dateRangeInfo: StoredJobsMetadata['dateRangeInfo']
}> {
  if (typeof window === 'undefined') return []

  try {
    const allMetadata = getAllMetadata()
    const result: Array<{
      dateRange: string
      count: number
      searchDate: string
      dateRangeInfo: StoredJobsMetadata['dateRangeInfo']
    }> = []

    for (const [dateRange, metadata] of Object.entries(allMetadata)) {
      const storageKey = `${STORAGE_KEY_PREFIX}${dateRange}`
      const jobsJson = localStorage.getItem(storageKey)
      
      if (jobsJson) {
        const jobs = JSON.parse(jobsJson) as JobPosting[]
        result.push({
          dateRange,
          count: jobs.length,
          searchDate: metadata.searchDate,
          dateRangeInfo: metadata.dateRangeInfo
        })
      }
    }

    return result.sort((a, b) => new Date(b.searchDate).getTime() - new Date(a.searchDate).getTime())
  } catch (error) {
    console.error('Error getting all stored jobs metadata:', error)
    return []
  }
}

/**
 * Clear stored jobs for a specific date range
 */
export function clearStoredJobs(dateRange: string): void {
  if (typeof window === 'undefined') return

  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${dateRange}`
    localStorage.removeItem(storageKey)
    
    const allMetadata = getAllMetadata()
    delete allMetadata[dateRange]
    localStorage.setItem(STORAGE_META_KEY, JSON.stringify(allMetadata))
  } catch (error) {
    console.error('Error clearing stored jobs:', error)
  }
}

/**
 * Clear all stored jobs
 */
export function clearAllStoredJobs(): void {
  if (typeof window === 'undefined') return

  try {
    // Remove all job storage keys
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    localStorage.removeItem(STORAGE_META_KEY)
  } catch (error) {
    console.error('Error clearing all stored jobs:', error)
  }
}

/**
 * Clear old stored jobs (older than 7 days)
 */
function clearOldStoredJobs(): void {
  if (typeof window === 'undefined') return

  try {
    const allMetadata = getAllMetadata()
    const now = new Date()
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000

    for (const [dateRange, metadata] of Object.entries(allMetadata)) {
      const storedDate = new Date(metadata.searchDate)
      if (storedDate.getTime() < sevenDaysAgo) {
        clearStoredJobs(dateRange)
      }
    }
  } catch (error) {
    console.error('Error clearing old stored jobs:', error)
  }
}


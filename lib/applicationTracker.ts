/**
 * Application Tracker - Manages tracking of applied jobs
 * Uses localStorage for client-side persistence
 */

export interface ApplicationRecord {
  jobId: string
  jobTitle: string
  company: string
  appliedDate: string
  applyUrl?: string
}

const STORAGE_KEY = 'job_applications'

/**
 * Get all applied jobs from storage
 */
export function getAppliedJobs(): ApplicationRecord[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored) as ApplicationRecord[]
  } catch (error) {
    console.error('Error reading applied jobs:', error)
    return []
  }
}

/**
 * Check if a job has been applied to
 */
export function isJobApplied(jobId: string): boolean {
  const appliedJobs = getAppliedJobs()
  return appliedJobs.some(job => job.jobId === jobId)
}

/**
 * Get application record for a job
 */
export function getApplicationRecord(jobId: string): ApplicationRecord | null {
  const appliedJobs = getAppliedJobs()
  return appliedJobs.find(job => job.jobId === jobId) || null
}

/**
 * Mark a job as applied
 */
export function markJobAsApplied(jobId: string, jobTitle: string, company: string, applyUrl?: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const appliedJobs = getAppliedJobs()
    
    // Check if already applied
    if (isJobApplied(jobId)) {
      return // Already tracked
    }
    
    // Add new application
    const newApplication: ApplicationRecord = {
      jobId,
      jobTitle,
      company,
      appliedDate: new Date().toISOString(),
      applyUrl
    }
    
    appliedJobs.push(newApplication)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appliedJobs))
  } catch (error) {
    console.error('Error saving application:', error)
  }
}

/**
 * Remove application record (if user wants to unmark)
 */
export function unmarkJobAsApplied(jobId: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const appliedJobs = getAppliedJobs()
    const filtered = appliedJobs.filter(job => job.jobId !== jobId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error removing application:', error)
  }
}

/**
 * Get application statistics
 */
export function getApplicationStats(): { total: number; thisWeek: number; thisMonth: number } {
  const appliedJobs = getAppliedJobs()
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  return {
    total: appliedJobs.length,
    thisWeek: appliedJobs.filter(job => new Date(job.appliedDate) >= weekAgo).length,
    thisMonth: appliedJobs.filter(job => new Date(job.appliedDate) >= monthAgo).length
  }
}



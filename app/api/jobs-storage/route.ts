import { NextRequest, NextResponse } from 'next/server'
import { JobPosting } from '@/types'

// Ensure this route uses Node.js runtime (not Edge runtime)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// In-memory storage for jobs (in production, replace with a database like MongoDB, PostgreSQL, or Vercel KV)
// This will persist only during the serverless function's lifetime
// For true persistence across deployments, use a database
const jobsStorage = new Map<string, {
  jobs: JobPosting[]
  dateRange: string
  searchDate: string
  totalJobs: number
}>()

// Store jobs by date range key (e.g., "7" for 7 days)
const STORAGE_KEY_PREFIX = 'jobs_'

/**
 * GET /api/jobs-storage?dateRange=7
 * Retrieve stored jobs for a specific date range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '7'
    const storageKey = `${STORAGE_KEY_PREFIX}${dateRange}`
    
    const stored = jobsStorage.get(storageKey)
    
    if (!stored) {
      return NextResponse.json({
        success: true,
        jobs: [],
        totalJobs: 0,
        dateRange: dateRange,
        fromStorage: false,
        message: 'No stored jobs found for this date range'
      })
    }
    
    // Check if stored jobs are still fresh (less than 24 hours old)
    const storedDate = new Date(stored.searchDate)
    const now = new Date()
    const hoursSinceSearch = (now.getTime() - storedDate.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceSearch > 24) {
      // Jobs are older than 24 hours, return empty to trigger new search
      jobsStorage.delete(storageKey)
      return NextResponse.json({
        success: true,
        jobs: [],
        totalJobs: 0,
        dateRange: stored.dateRange,
        fromStorage: false,
        message: 'Stored jobs are older than 24 hours. Please search again.'
      })
    }
    
    return NextResponse.json({
      success: true,
      jobs: stored.jobs,
      totalJobs: stored.totalJobs,
      dateRange: stored.dateRange,
      fromStorage: true,
      searchDate: stored.searchDate,
      message: `Loaded ${stored.jobs.length} stored jobs from ${new Date(stored.searchDate).toLocaleString()}`
    })
  } catch (error) {
    console.error('Error retrieving stored jobs:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve stored jobs',
        jobs: [],
        totalJobs: 0
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/jobs-storage
 * Save jobs to storage
 * Body: { dateRange: string, jobs: JobPosting[], totalJobs: number, dateRangeInfo: {...} }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dateRange, jobs, totalJobs, dateRangeInfo } = body
    
    if (!dateRange || !jobs || !Array.isArray(jobs)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body. dateRange and jobs array are required.' },
        { status: 400 }
      )
    }
    
    const storageKey = `${STORAGE_KEY_PREFIX}${dateRange}`
    
    // Store jobs with metadata
    jobsStorage.set(storageKey, {
      jobs,
      dateRange: dateRangeInfo?.from || dateRange,
      searchDate: new Date().toISOString(),
      totalJobs: totalJobs || jobs.length
    })
    
    console.log(`💾 Saved ${jobs.length} jobs to storage for date range: ${dateRange} days`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully stored ${jobs.length} jobs`,
      storedCount: jobs.length
    })
  } catch (error) {
    console.error('Error saving jobs:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to save jobs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/jobs-storage?dateRange=7
 * Clear stored jobs for a specific date range
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange')
    
    if (dateRange) {
      const storageKey = `${STORAGE_KEY_PREFIX}${dateRange}`
      jobsStorage.delete(storageKey)
      return NextResponse.json({
        success: true,
        message: `Cleared stored jobs for date range: ${dateRange} days`
      })
    } else {
      // Clear all stored jobs
      jobsStorage.clear()
      return NextResponse.json({
        success: true,
        message: 'Cleared all stored jobs'
      })
    }
  } catch (error) {
    console.error('Error clearing stored jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear stored jobs' },
      { status: 500 }
    )
  }
}


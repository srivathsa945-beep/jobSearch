import { NextRequest, NextResponse } from 'next/server'
import { searchJobs } from '@/lib/jobSearch'

// Ensure this route uses Node.js runtime (not Edge runtime)
export const runtime = 'nodejs'

/**
 * API endpoint to search for Project Manager jobs WITHOUT requiring a resume
 * This is called first to fetch all available jobs
 */
export async function GET(request: NextRequest) {
  try {
    // Get date range from query parameter (default: 7 days)
    const { searchParams } = new URL(request.url)
    const dateRangeParam = searchParams.get('dateRange') || '7'
    
    console.log('🔍 Starting job search (without resume)...')
    console.log(`📅 Date range requested: ${dateRangeParam} days`)
    
    // Search for all Project Manager jobs (no resume needed)
    // Pass null for resume data since we're searching first, and the date range
    const result = await searchJobs(null, null, dateRangeParam)

    return NextResponse.json({
      success: true,
      jobs: result.jobs,
      totalJobs: result.totalJobs,
      dateRange: result.dateRange,
      filtersApplied: result.filtersApplied,
      extractedRole: 'Project Manager (initial search)',
      message: `Found ${result.totalJobs} Project Manager jobs. Upload your resume to see how you match!`
    })
  } catch (error) {
    console.error('Error searching jobs:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const now = new Date()
    const days = parseInt(dateRangeParam) || 7
    const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search jobs',
        details: errorMessage,
        jobs: [],
        totalJobs: 0,
        dateRange: {
          from: daysAgo.toISOString(),
          to: now.toISOString(),
          fromFormatted: daysAgo.toLocaleDateString(),
          toFormatted: now.toLocaleDateString()
        },
        filtersApplied: []
      },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { searchJobs } from '@/lib/jobSearch'

// Ensure this route uses Node.js runtime (not Edge runtime)
export const runtime = 'nodejs'
// Mark as dynamic since we use request.url
export const dynamic = 'force-dynamic'

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
    // Pass undefined for resume data since we're searching first, and the date range
    const result = await searchJobs(undefined, undefined, dateRangeParam)

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
    const { searchParams } = new URL(request.url)
    const dateRangeParam = searchParams.get('dateRange') || '7'
    const days = parseInt(dateRangeParam) || 7
    const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    // Check if it's an environment variable issue
    const isEnvError = !process.env.APIFY_API_TOKEN || 
                      errorMessage.includes('APIFY_API_TOKEN') ||
                      errorMessage.includes('environment variable') ||
                      errorMessage.includes('not set')
    
    // Check if it's a usage limit error
    const isLimitError = errorMessage.includes('usage') || 
                        errorMessage.includes('limit') ||
                        errorMessage.includes('403') ||
                        errorMessage.includes('Monthly')
    
    let userFriendlyError = 'Failed to search jobs'
    let userFriendlyDetails = errorMessage
    
    if (isEnvError) {
      userFriendlyError = 'Apify API Token Not Configured'
      userFriendlyDetails = `The APIFY_API_TOKEN environment variable is not set in Vercel.\n\n` +
        `To fix this:\n` +
        `1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables\n` +
        `2. Add: APIFY_API_TOKEN = apify_api_74LnWixKE5sIesne0Jormuz9GW19E444A30c\n` +
        `3. Select all environments (Production, Preview, Development)\n` +
        `4. Click Save\n` +
        `5. REDEPLOY your application (Deployments → ⋯ → Redeploy)`
    } else if (isLimitError) {
      userFriendlyError = 'Apify Usage Limit Reached'
      userFriendlyDetails = `Your Apify account has reached its monthly usage limit.\n\n` +
        `Solutions:\n` +
        `1. Upgrade your Apify plan at https://console.apify.com/account/billing\n` +
        `2. Wait for the monthly limit to reset\n` +
        `3. Check usage at https://console.apify.com/account/usage`
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: userFriendlyError,
        details: userFriendlyDetails,
        debugInfo: {
          hasToken: !!process.env.APIFY_API_TOKEN,
          tokenLength: process.env.APIFY_API_TOKEN?.length || 0,
          tokenPrefix: process.env.APIFY_API_TOKEN?.substring(0, 15) || 'N/A',
          nodeEnv: process.env.NODE_ENV
        },
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


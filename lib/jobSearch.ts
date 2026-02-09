import { JobPosting } from '@/types'
import { searchLinkedInJobs } from './linkedinScraper'
import { searchGoogleJobs } from './googleScraper'
import { filterJobs } from './jobFilters'

// Enhanced job search - SEARCHES FOR PROJECT MANAGER JOBS
// This function:
// 1. First fetches ALL Project Manager jobs
// 2. Then filters them based on criteria (full-time, no staffing, salary, benefits, end-clients)
// 3. Returns jobs ready to be scored against the resume
export async function searchJobs(
  resumeJobTitle?: string | null, 
  resumeKeywords?: string[],
  dateRangeDays: string = '7' // Number of days to search (1, 7, 14, 30)
): Promise<{ 
  jobs: JobPosting[], 
  totalJobs: number, 
  dateRange: { from: string, to: string, fromFormatted: string, toFormatted: string }, 
  filtersApplied: string[] 
}> {
  // Strategy: First get ALL Project Manager jobs, then filter for PMP requirement
  // This ensures we don't miss jobs due to search query limitations
  // Reduced queries to speed up search - focus on most relevant
  const projectManagerQueries = [
    'project manager',  // Primary search - get all PM jobs first
    'program manager'   // Also search program manager
    // Removed PMP-specific queries to reduce search time - PMP requirement will be checked during scoring
  ]
  
  // Also include the resume job title if it's project manager related
  if (resumeJobTitle && (
    resumeJobTitle.toLowerCase().includes('project') || 
    resumeJobTitle.toLowerCase().includes('program')
  )) {
    projectManagerQueries.unshift(resumeJobTitle) // Add to front
  }

  // Calculate date range dynamically based on selected days
  const days = parseInt(dateRangeDays) || 7
  const now = new Date()
  const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  console.log(`🔍 STEP 1: Searching for Project Manager jobs`)
  console.log(`📅 Date range: ${daysAgo.toISOString()} to ${now.toISOString()} (last ${days} days)`)
  
  // Debug: Check environment variables
  console.log(`🔍 DEBUG: Environment check:`)
  console.log(`   APIFY_API_TOKEN exists: ${!!process.env.APIFY_API_TOKEN}`)
  console.log(`   APIFY_API_TOKEN length: ${process.env.APIFY_API_TOKEN?.length || 0}`)
  console.log(`   APIFY_LINKEDIN_ACTOR_ID: ${process.env.APIFY_LINKEDIN_ACTOR_ID || 'NOT_SET'}`)

  // Search MULTIPLE job sources with MULTIPLE queries to find PMP-required Project Manager jobs
  let allJobs: JobPosting[] = []
  
  console.log(`📊 Searching MULTIPLE job sources with ${projectManagerQueries.length} queries`)
  console.log('Sources: LinkedIn, Google Jobs')
  console.log(`Queries: ${projectManagerQueries.join(', ')}`)
  
  // Search all sources with all queries in parallel
  const searchPromises: Promise<JobPosting[]>[] = []
  
  // For each job source, search with all PMP queries
  for (const query of projectManagerQueries) {
    // LinkedIn searches
    searchPromises.push(
      (async () => {
        try {
          console.log(`\n🔍 Starting LinkedIn search for: "${query}"`)
          // Convert days to LinkedIn time range format
          // r86400 = 1 day, r604800 = 7 days, r2592000 = 30 days
          let timeRange = 'r604800' // default 7 days
          if (days === 1) timeRange = 'r86400'
          else if (days === 7) timeRange = 'r604800'
          else if (days === 14) timeRange = 'r1209600'
          else if (days === 30) timeRange = 'r2592000'
          
          const jobs = await searchLinkedInJobs(query, 'United States', undefined, 'F', timeRange)
          console.log(`✅ LinkedIn "${query}": Found ${jobs.length} jobs`)
          return jobs
        } catch (error) {
          console.error(`❌ LinkedIn search failed for "${query}":`, error)
          console.error(`   Error details:`, error instanceof Error ? error.message : String(error))
          if (error instanceof Error && error.stack) {
            console.error(`   Stack:`, error.stack.split('\n').slice(0, 5).join('\n'))
          }
          return []
        }
      })()
    )
    
    // Google Jobs searches
    searchPromises.push(
      (async () => {
        try {
          console.log(`\n🔍 Starting Google Jobs search for: "${query}"`)
          const jobs = await searchGoogleJobs(query, 'United States', dateRangeDays)
          console.log(`✅ Google Jobs "${query}": Found ${jobs.length} jobs`)
          return jobs
        } catch (error) {
          console.error(`❌ Google Jobs search failed for "${query}":`, error)
          console.error(`   Error details:`, error instanceof Error ? error.message : String(error))
          return []
        }
      })()
    )
  }
  
  try {
    // Wait for all searches to complete
    console.log(`⏳ Waiting for ${searchPromises.length} search queries to complete...`)
    const results = await Promise.all(searchPromises)
    
    // Combine all results
    results.forEach((jobs) => {
      allJobs.push(...jobs)
    })
    
    console.log(`📊 STEP 2: Total jobs fetched from all sources: ${allJobs.length}`)
    
    if (allJobs.length === 0) {
      console.error('❌ CRITICAL: No jobs returned from ANY source!')
      console.error('   This means Apify is not returning any data.')
      console.error('   Possible causes:')
      console.error('   1. Apify monthly usage limit exceeded (check error messages above)')
      console.error('   2. Apify actors are not working')
      console.error('   3. LinkedIn/Google Jobs are blocking scrapers')
      console.error('   4. Actor input parameters are wrong')
      console.error('   5. Network/firewall issues')
      console.error('   Check the Apify run URLs in the logs above for details')
      console.error('   💡 If you see "Monthly usage hard limit exceeded", upgrade your Apify plan')
      return {
        jobs: [],
        totalJobs: 0,
        dateRange: {
          from: daysAgo.toISOString(),
          to: now.toISOString(),
          fromFormatted: daysAgo.toLocaleDateString(),
          toFormatted: now.toLocaleDateString()
        },
        filtersApplied: [
          'Full-time',
          'No Staffing Companies',
          'Salary >$100k (or not specified)',
          'Benefits Mentioned',
          'End-Client Companies Only',
          `Posted in last ${days} days`
        ]
      }
    }
    
    // Remove duplicates based on job title + company (more reliable than ID)
    const uniqueJobs = Array.from(
      new Map(
        allJobs.map(job => [`${job.title.toLowerCase()}-${job.company.toLowerCase()}`, job])
      ).values()
    )
    
    console.log(`📊 After deduplication: ${uniqueJobs.length} unique jobs`)
    
    // Log sample jobs for debugging
    if (uniqueJobs.length > 0) {
      console.log(`📋 Sample jobs found:`)
      uniqueJobs.slice(0, 5).forEach((job, idx) => {
        console.log(`   ${idx + 1}. ${job.title} at ${job.company} (${job.source})`)
      })
    }
    
    if (uniqueJobs.length > 0) {
      // STEP 3: Filter to Project Manager roles (don't require PMP yet - that will be part of scoring)
      console.log(`\n🔍 STEP 3: Filtering for Project Manager roles...`)
      console.log(`   Starting with ${uniqueJobs.length} unique jobs`)
      
      // Filter to Project Manager roles - be inclusive
      const pmJobs = uniqueJobs.filter(job => {
        const titleLower = job.title.toLowerCase()
        const descLower = (job.description || '').toLowerCase()
        return titleLower.includes('project manager') || 
               titleLower.includes('program manager') ||
               titleLower.includes('project management') ||
               titleLower.includes('program management') ||
               titleLower.includes('pmo') ||
               titleLower.includes('project lead') ||
               titleLower.includes('project coordinator') ||
               titleLower.includes('project director') ||
               titleLower.includes('project specialist') ||
               titleLower.includes('project analyst') ||
               // Also check description for project management keywords
               (descLower.includes('project management') && (descLower.includes('manager') || descLower.includes('lead')))
      })
      console.log(`   ✅ Found ${pmJobs.length} Project Manager roles`)
      
      if (pmJobs.length === 0) {
        console.log(`⚠️ No Project Manager jobs found in titles.`)
        console.log(`   This might mean:`)
        console.log(`   1. Apify returned jobs but titles don't match`)
        console.log(`   2. Jobs are in different format`)
        console.log(`   Sample job titles found:`, uniqueJobs.slice(0, 5).map(j => j.title))
        console.log(`   Returning all unique jobs (will filter during scoring)...`)
        // Return all jobs - let the scoring filter them
        // But first apply basic filters
        const dateFiltered = uniqueJobs.filter(job => {
          const jobDate = new Date(job.postedDate)
          return jobDate >= daysAgo
        })
        const basicFiltered = filterJobs(dateFiltered)
        return {
          jobs: basicFiltered,
          totalJobs: basicFiltered.length,
          dateRange: {
            from: daysAgo.toISOString(),
            to: now.toISOString(),
            fromFormatted: daysAgo.toLocaleDateString(),
            toFormatted: now.toLocaleDateString()
          },
          filtersApplied: [
            'Full-time',
            'No Staffing Companies',
            'Salary >$100k (or not specified)',
            'Benefits Mentioned',
            'End-Client Companies Only',
            `Posted in last ${days} days`
          ]
        }
      }
      
      // STEP 4: Filter jobs to ensure they're within the selected date range
      const dateFilteredJobs = pmJobs.filter(job => {
        const jobDate = new Date(job.postedDate)
        return jobDate >= daysAgo
      })
      
      console.log(`📅 STEP 4: Filtered to ${dateFilteredJobs.length} jobs posted in last ${days} days (from ${uniqueJobs.length} total)`)
      
      // STEP 5: Apply additional filters: full-time, no staffing, salary >$100k, benefits, end-clients only
      console.log(`\n🔍 STEP 5: Applying additional filters (full-time, no staffing, salary, benefits, end-clients)...`)
      const filteredJobs = filterJobs(dateFilteredJobs)
      
      console.log(`\n✅ FINAL RESULT: ${filteredJobs.length} Project Manager jobs that:`)
      console.log(`   ✓ Are full-time`)
      console.log(`   ✓ Are from end-client companies (not staffing)`)
      console.log(`   ✓ Have salary >$100k or not specified`)
      console.log(`   ✓ Mention benefits`)
      console.log(`   ✓ Posted in last ${days} days`)
      console.log(`\n📝 These jobs are ready to be scored against the uploaded resume`)
      console.log(`   (PMP requirement will be checked during scoring)`)
      
      // Return filtered jobs - these will be scored against the resume
      // PMP requirement will be part of the scoring, not a hard filter
      return {
        jobs: filteredJobs,
        totalJobs: filteredJobs.length,
        dateRange: {
          from: daysAgo.toISOString(),
          to: now.toISOString(),
          fromFormatted: daysAgo.toLocaleDateString(),
          toFormatted: now.toLocaleDateString()
        },
        filtersApplied: [
          'Full-time',
          'No Staffing Companies',
          'Salary >$100k (or not specified)',
          'Benefits Mentioned',
          'End-Client Companies Only',
          `Posted in last ${days} days`
        ]
      }
    }
  } catch (error) {
    console.error('❌ Multi-source job search failed:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
  }

  // NO MOCK DATA - Return empty array if all searches fail
  // User wants only real scraped jobs with legitimate URLs
  console.log('⚠️ No jobs found from any job source (LinkedIn, Google Jobs).')
  console.log('')
  console.log('🔍 DEBUGGING INFO:')
  console.log('  1. Check APIFY_API_TOKEN is set in .env')
  console.log('  2. Check APIFY_LINKEDIN_ACTOR_ID is correct')
  console.log('  3. Verify Apify actors are accessible at https://console.apify.com')
  console.log('  4. Check server logs above for Apify run IDs and errors')
  console.log('  5. Common issues:')
  console.log('     - Apify actor timeout (increase timeout)')
  console.log('     - LinkedIn blocking scraper (try different actor)')
  console.log('     - Wrong actor input parameters')
  console.log('     - Network/firewall issues')
  console.log('')
  console.log('💡 TIP: Check the Apify run URLs in the logs above to see detailed error messages')
  
  return {
    jobs: [],
    totalJobs: 0,
    dateRange: {
      from: daysAgo.toISOString(),
      to: now.toISOString(),
      fromFormatted: daysAgo.toLocaleDateString(),
      toFormatted: now.toLocaleDateString()
    },
    filtersApplied: []
  }
}

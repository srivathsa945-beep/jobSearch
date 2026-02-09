import { JobPosting } from '@/types'
import { ApifyClient } from 'apify-client'

// Helper function to extract requirements from job description
function extractRequirements(description: string): string[] {
  const requirements: string[] = []
  const lowerDesc = description.toLowerCase()

  const patterns = [
    /(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/gi,
    /(bachelor|master|phd|degree|bs|ms|mba)/gi,
    /(pmp|certified|certification)/gi,
    /(agile|scrum|kanban|waterfall)/gi,
    /(javascript|python|java|c\+\+|react|node\.js|sql|aws|docker|kubernetes)/gi
  ]

  patterns.forEach(pattern => {
    const matches = description.match(pattern)
    if (matches) {
      requirements.push(...matches)
    }
  })

  return [...new Set(requirements)]
}

// Parse date format (e.g., "2 days ago", "1 week ago", or ISO date string)
function parseDate(dateText: string): string {
  if (dateText.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return dateText
  }

  const now = new Date()
  const lowerText = dateText.toLowerCase()

  if (lowerText.includes('hour')) {
    const hours = parseInt(lowerText.match(/\d+/)?.[0] || '0')
    now.setHours(now.getHours() - hours)
  } else if (lowerText.includes('day')) {
    const days = parseInt(lowerText.match(/\d+/)?.[0] || '0')
    now.setDate(now.getDate() - days)
  } else if (lowerText.includes('week')) {
    const weeks = parseInt(lowerText.match(/\d+/)?.[0] || '0')
    now.setDate(now.getDate() - (weeks * 7))
  } else if (lowerText.includes('month')) {
    const months = parseInt(lowerText.match(/\d+/)?.[0] || '0')
    now.setMonth(now.getMonth() - months)
  }

  return now.toISOString()
}

export async function searchGoogleJobs(
  keywords: string = 'project manager',
  location: string = 'United States',
  timeRange: string = '7' // Number of days
): Promise<JobPosting[]> {
  try {
    // Check for Apify API token
    const apifyToken = process.env.APIFY_API_TOKEN
    console.log('🔑 Checking Apify API token for Google scraper...')
    if (!apifyToken) {
      console.error('❌ CRITICAL: APIFY_API_TOKEN not found in environment variables!')
      return []
    }

    console.log('🔧 Initializing Apify client for Google Jobs...')
    const client = new ApifyClient({ token: apifyToken })
    console.log('✅ Apify client initialized')
    
    // Use johnvc/Google-Jobs-Scraper actor
    const actorId = process.env.APIFY_GOOGLE_ACTOR_ID || 'johnvc/Google-Jobs-Scraper'
    
    console.log('Starting Apify Google Jobs search...')
    console.log(`Searching for: ${keywords} in ${location}`)
    
    // Build search parameters for Google Jobs Scraper
    // Check the actor's input schema - typically expects query, location, maxResults
    // Reduced maxResults for faster scraping in Vercel serverless environment
    const searchParams: any = {
      query: keywords,
      location: location,
      maxResults: 100,  // Reduced for faster scraping in Vercel (was 250)
    }

    // Verify actor exists
    let actor: any = null
    let workingActorId = actorId
    
    try {
      console.log(`🔍 Verifying Apify actor: ${actorId}`)
      const actorResponse = await client.actor(actorId).get()
      if (actorResponse && actorResponse.id) {
        actor = actorResponse
        workingActorId = actorId
        const actorUsername = actorId.split('/')[0] || 'unknown'
        console.log(`✅ Actor found: ${actorUsername}/${actor.name || actorId}`)
      } else {
        throw new Error('Actor response is invalid or missing ID')
      }
    } catch (error) {
      console.error(`❌ Actor ${actorId} not found or not accessible`)
      console.error(`   Error:`, error instanceof Error ? error.message : String(error))
      console.error(`   Please verify APIFY_GOOGLE_ACTOR_ID in .env file`)
      return []
    }

    // Run the Apify actor
    console.log('📞 Calling Apify actor...')
    console.log(`   Actor ID: ${workingActorId}`)
    console.log(`   Parameters:`, JSON.stringify(searchParams, null, 2))
    
    let run: any
    try {
      console.log('   Sending request to Apify...')
      run = await client.actor(workingActorId).call(searchParams)
      
      if (!run || !run.id) {
        console.error('❌ Apify call returned invalid response:', run)
        return []
      }
      
      console.log(`✅ Apify run started successfully!`)
      console.log(`   Run ID: ${run.id}`)
      console.log(`   Status: ${run.status || 'STARTING'}`)
      console.log(`🔗 Monitor run at: https://console.apify.com/actors/runs/${run.id}`)
    } catch (error) {
      console.error(`❌ CRITICAL: Failed to start Apify run!`)
      console.error(`   Actor ID: ${actorId}`)
      console.error(`   Error type:`, error instanceof Error ? error.constructor.name : typeof error)
      console.error(`   Error message:`, error instanceof Error ? error.message : String(error))
      
      if (error instanceof Error && (
        error.message.includes('401') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('authentication') ||
        error.message.includes('token')
      )) {
        console.error('   🔐 This looks like an authentication error!')
        console.error('   Please verify your APIFY_API_TOKEN is correct')
      }
      
      return []
    }

    // Wait for the run to finish (with timeout optimized for Vercel serverless)
    // Vercel Pro plan has 60s timeout, Hobby has 10s - we'll use 50s to be safe
    let runResult: any
    try {
      console.log(`⏳ Waiting for Apify run to complete (timeout: 50 seconds for Vercel compatibility)...`)
      console.log(`   Run ID: ${run.id}`)
      console.log(`   Monitor progress: https://console.apify.com/actors/runs/${run.id}`)
      
      // Reduced timeout for Vercel serverless functions (50 seconds max)
      runResult = await Promise.race([
        client.run(run.id).waitForFinish({ waitSecs: 50 }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Apify run timeout after 50 seconds (Vercel limit)')), 50000) // 50 second timeout
        )
      ]) as { defaultDatasetId: string, status: string }

      console.log(`✅ Apify run finished with status: ${runResult.status}`)
      
          if (runResult.status === 'FAILED') {
            console.warn(`⚠️ Apify run marked as FAILED, but checking for partial results...`)
            console.warn(`   Check logs at: https://console.apify.com/actors/runs/${run.id}`)
            try {
              const runDetails = await client.run(run.id).get()
              if (runDetails) {
                console.warn(`   Run error:`, runDetails.statusMessage || 'Unknown error')
              }
              if (runResult.defaultDatasetId) {
                console.log(`   Attempting to fetch results despite FAILED status...`)
              } else {
                return []
              }
            } catch (e) {
              console.error(`   Could not fetch run details`)
              return []
            }
          }
    } catch (error) {
      console.error(`❌ Error waiting for Apify run to finish:`, error)
      console.error(`   Run ID: ${run.id}`)
      console.error(`   Check status at: https://console.apify.com/actors/runs/${run.id}`)
      return []
    }

    // Fetch the results
    let items: any[] = []
    try {
      // Wait a moment for dataset to be fully written
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log(`📥 Fetching results from Apify dataset: ${runResult.defaultDatasetId}`)
      const dataset = await client.dataset(runResult.defaultDatasetId).listItems()
      items = dataset.items || []
      console.log(`📊 Found ${items.length} raw items from Apify Google Jobs scraper`)
      
      if (items.length === 0) {
        console.warn('No jobs returned from Apify. Check actor input parameters and Google Jobs search results.')
        return []
      }
      
      // Log sample item structure to help debug
      if (items.length > 0) {
        console.log('✅ Sample Apify item structure (first item):')
        console.log('   Keys:', Object.keys(items[0]))
        console.log('   Title:', items[0].title || items[0].jobTitle || 'N/A')
        console.log('   Company:', items[0].company || items[0].companyName || 'N/A')
      }
    } catch (error) {
      console.error(`❌ Error fetching results from Apify dataset:`, error)
      return []
    }

    // Convert Apify results to JobPosting format
    const jobPostings: JobPosting[] = items
      .map((item: any, index: number): JobPosting | null => {
        // Extract description (Apify actors may use different field names)
        const description = item.description || 
                          item.jobDescription || 
                          item.summary || 
                          item.text || 
                          ''

        // Extract requirements from description
        const requirements = extractRequirements(description)

        // Parse posted date
        let postedDate = new Date().toISOString()
        if (item.datePosted) {
          postedDate = parseDate(item.datePosted)
        } else if (item.publishedAt) {
          postedDate = new Date(item.publishedAt).toISOString()
        } else if (item.postedDate) {
          postedDate = parseDate(item.postedDate)
        }

        // Extract URLs - Google Jobs typically provides direct job URLs
        let jobUrl = item.url || 
                     item.jobUrl || 
                     item.link || 
                     item.jobLink ||
                     item.externalUrl ||
                     ''
        
        let applyUrl = item.applyUrl || 
                       item.applicationUrl ||
                       item.applyLink ||
                       item.externalApplyUrl ||
                       jobUrl // Use job URL as fallback
        
        // If URL doesn't start with http, construct it
        if (jobUrl && !jobUrl.startsWith('http')) {
          jobUrl = `https://${jobUrl}`
        }
        
        if (applyUrl && !applyUrl.startsWith('http')) {
          applyUrl = `https://${applyUrl}`
        }
        
        // If we still don't have a valid job URL, skip this job
        if (!jobUrl) {
          console.warn(`Skipping job "${item.title || item.jobTitle}" - no valid job URL found. Item keys:`, Object.keys(item))
          return null
        }

        return {
          id: `google-${item.jobId || item.id || item.jobUrl || Date.now()}-${index}`,
          title: item.title || item.jobTitle || '',
          company: item.company || item.companyName || item.employer || '',
          location: item.location || item.jobLocation || item.locationName || '',
          description: description,
          requirements,
          postedDate: postedDate,
          url: jobUrl,
          applyUrl: applyUrl || jobUrl,
          source: 'Google Jobs'
        }
      })
      .filter((job): job is JobPosting => job !== null) // Filter out nulls
      .filter((job: JobPosting) => job.title && job.company) // Filter out invalid jobs

    return jobPostings

  } catch (error) {
    console.error('❌ Error scraping Google Jobs with Apify:', error)
    return []
  }
}


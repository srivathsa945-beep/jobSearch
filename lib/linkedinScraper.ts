import { JobPosting } from '@/types'
import { ApifyClient } from 'apify-client'

export async function searchLinkedInJobs(
  keywords: string = 'project manager',
  location: string = 'United States',
  experienceLevel?: string,
  jobType: string = 'F', // F = Full-time
  timeRange: string = 'r604800' // Past week (7 days)
): Promise<JobPosting[]> {
  try {
    // Check for Apify API token
    const apifyToken = process.env.APIFY_API_TOKEN
    console.log('🔑 Checking Apify API token...')
    console.log(`   Environment check: NODE_ENV=${process.env.NODE_ENV}`)
    console.log(`   All env vars starting with APIFY:`, Object.keys(process.env).filter(k => k.startsWith('APIFY')).join(', ') || 'NONE FOUND')
    
    if (!apifyToken) {
      console.error('❌ CRITICAL: APIFY_API_TOKEN not found in environment variables!')
      console.error('   This means the environment variable is not set in Vercel')
      console.error('   SOLUTION:')
      console.error('   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables')
      console.error('   2. Add APIFY_API_TOKEN with value: apify_api_74LnWixKE5sIesne0Jormuz9GW19E444A30c')
      console.error('   3. Select all environments (Production, Preview, Development)')
      console.error('   4. Click Save and REDEPLOY your application')
      throw new Error('APIFY_API_TOKEN environment variable is not set. Please set it in Vercel environment variables.')
    }
    
    // Check token format (should start with 'apify_api_')
    if (!apifyToken.startsWith('apify_api_')) {
      console.warn('⚠️ Apify token format looks incorrect (should start with "apify_api_")')
      console.warn(`   Token starts with: ${apifyToken.substring(0, 10)}...`)
      console.warn(`   Token length: ${apifyToken.length}`)
      throw new Error('APIFY_API_TOKEN format is incorrect. Token should start with "apify_api_"')
    } else {
      console.log('✅ Apify API token found and format looks correct')
      console.log(`   Token length: ${apifyToken.length} characters`)
      console.log(`   Token starts with: ${apifyToken.substring(0, 15)}...`)
    }

    console.log('🔧 Initializing Apify client...')
    const client = new ApifyClient({ token: apifyToken })
    console.log('✅ Apify client initialized')
    
    // Use Apify's LinkedIn Jobs Scraper actor
    // Actor ID: hKByXkMQaC5Qt9UMN (curious_coder/linkedin-jobs-scraper)
    // Can also use username/actor-name format: curious_coder/linkedin-jobs-scraper
    const actorId = process.env.APIFY_LINKEDIN_ACTOR_ID || 'curious_coder/linkedin-jobs-scraper'
    
    console.log('Starting Apify LinkedIn job search...')
    console.log(`Searching for: ${keywords} in ${location}`)
    
    // The curious_coder/linkedin-jobs-scraper actor requires LinkedIn search URLs, not keywords
    // Construct the LinkedIn job search URL using the proper format
    const encodedKeywords = encodeURIComponent(keywords)
    const encodedLocation = encodeURIComponent(location)
    
    // Build LinkedIn search URL with filters (based on actual LinkedIn URL structure)
    // Format: https://www.linkedin.com/jobs/search/?keywords=...&location=...&geoId=...&f_JT=F&f_TPR=r604800
    let linkedInSearchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodedKeywords}&location=${encodedLocation}`
    
    // Add geoId for United States (103644278) for better location matching
    if (location.toLowerCase().includes('united states') || location.toLowerCase().includes('usa') || location.toLowerCase().includes('us')) {
      linkedInSearchUrl += '&geoId=103644278'
    }
    
    // Add full-time filter (f_JT=F)
    linkedInSearchUrl += '&f_JT=F'
    
    // Add date filter based on timeRange
    // r86400 = 1 day, r604800 = 7 days, r1209600 = 14 days, r2592000 = 30 days
    if (timeRange) {
      linkedInSearchUrl += `&f_TPR=${timeRange}`
    }
    
    // Add experience level if specified
    // f_E values: 2=Associate, 3=Mid-Senior, 4=Director, 5=Executive
    if (experienceLevel) {
      linkedInSearchUrl += `&f_E=${experienceLevel}`
    }
    
    // Add position and pageNum for pagination
    linkedInSearchUrl += '&position=1&pageNum=0'
    
    console.log(`🔗 Constructed LinkedIn search URL: ${linkedInSearchUrl}`)
    
    // Build search parameters for curious_coder/linkedin-jobs-scraper
    // Based on Python example: urls, scrapeCompany, count, splitByLocation, splitCountry
    const searchParams: any = {
      urls: [linkedInSearchUrl],  // Required: array of LinkedIn job search URLs
      scrapeCompany: true,       // Scrape company information
      count: 50,                  // Number of jobs to scrape (reduced for Vercel)
      splitByLocation: false,     // Don't split results by location
      splitCountry: null          // No country splitting
    }

    // Verify actor exists and get its input schema
    let actor: any = null
    let workingActorId = actorId
    
    try {
      console.log(`🔍 Verifying Apify actor: ${actorId}`)
      const actorResponse = await client.actor(actorId).get()
      if (actorResponse && actorResponse.id) {
        actor = actorResponse
            workingActorId = actorId
            // Extract username from actorId (format: username/actor-name)
            const actorUsername = actorId.split('/')[0] || 'unknown'
            console.log(`✅ Actor found: ${actorUsername}/${actor.name || actorId}`)
      } else {
        throw new Error(`Actor ${actorId} returned invalid response`)
      }
    } catch (error) {
      console.error(`❌ Actor ${actorId} not found or not accessible`)
      console.error(`   Error:`, error instanceof Error ? error.message : String(error))
      
      // Try alternative actors - prioritize the known working actor
      console.log(`🔄 Trying alternative actors...`)
      const alternativeActors = [
        'curious_coder/linkedin-jobs-scraper',  // User-provided working actor
        'dtrungtin/linkedin-jobs-scraper',
        'helenai/linkedin-jobs-scraper',
        'apify/linkedin-jobs-scraper-v2'
      ]
      
      for (const altActor of alternativeActors) {
        if (altActor === actorId) continue
        try {
          console.log(`   Trying: ${altActor}`)
          const altActorResponse = await client.actor(altActor).get()
          if (altActorResponse && altActorResponse.id) {
            actor = altActorResponse
            workingActorId = altActor
            console.log(`✅ Found working alternative actor: ${altActor}`)
            break
          }
        } catch (e) {
          console.log(`   ❌ ${altActor} not available`)
          continue
        }
      }
      
      if (!actor || !actor.id) {
        const errorMsg = `No working Apify LinkedIn actor found. 

Tried: ${actorId} and alternatives: ${alternativeActors.join(', ')}

SOLUTIONS:
    1. Visit https://console.apify.com/actors to find available actors
2. Go to https://console.apify.com/actors and search for "LinkedIn jobs"
3. Find a LinkedIn scraper actor and update APIFY_LINKEDIN_ACTOR_ID in .env
4. You may need to subscribe to or purchase access to the actor`
        console.error(`❌ ${errorMsg}`)
        throw new Error(errorMsg)
      }
    }
    
    // Use the working actor ID
    if (workingActorId !== actorId) {
      console.log(`🔄 Using actor: ${workingActorId} instead of ${actorId}`)
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
      console.log(`   Initial Status: ${run.status || 'STARTING'}`)
      console.log(`🔗 Monitor run at: https://console.apify.com/actors/runs/${run.id}`)
      
      // Note: Initial status might be "FAILED" but the run could still be processing
      // We'll wait for it to finish before checking final status
    } catch (error) {
      console.error(`❌ CRITICAL: Failed to start Apify run!`)
      console.error(`   Actor ID: ${actorId}`)
      console.error(`   Error type:`, error instanceof Error ? error.constructor.name : typeof error)
      console.error(`   Error message:`, error instanceof Error ? error.message : String(error))
      if (error instanceof Error && error.stack) {
        console.error(`   Stack trace:`, error.stack)
      }
      
      // Check if it's an authentication error
      if (error instanceof Error && (
        error.message.includes('401') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('authentication') ||
        error.message.includes('token')
      )) {
        console.error('   🔐 This looks like an authentication error!')
        console.error('   Please verify your APIFY_API_TOKEN is correct')
      }
      
      // Check if it's a usage limit error
      if (error instanceof Error && (
        error.message.includes('403') || 
        error.message.includes('Monthly usage') || 
        error.message.includes('hard limit exceeded') ||
        error.message.includes('platform-feature-disabled') ||
        (error as any).type === 'platform-feature-disabled'
      )) {
        console.error('   💳 This looks like a usage limit error!')
        console.error('   Your Apify account has exceeded its monthly usage limit.')
        console.error('   Solutions:')
        console.error('   1. Upgrade your Apify plan at https://console.apify.com/account/billing')
        console.error('   2. Wait for the monthly limit to reset')
        console.error('   3. Check your usage at https://console.apify.com/account/usage')
        console.error('   4. Consider using a different actor or reducing search frequency')
      }
      
      // Check if it's an actor not found error
      if (error instanceof Error && (
        error.message.includes('404') || 
        error.message.includes('not found') ||
        error.message.includes('Actor')
      )) {
        console.error('   🎭 This looks like the actor was not found!')
        console.error('   Please verify your APIFY_LINKEDIN_ACTOR_ID is correct')
        console.error('   Common actors: apify/linkedin-jobs-scraper, apify/linkedin-jobs-scraper-v2')
      }
      
      return []
    }

    // Wait for the run to finish (with timeout optimized for Vercel serverless)
    // Vercel Pro plan has 60s timeout, Hobby has 10s - we'll use 45s to be safe
    let runResult: any
    try {
      console.log(`⏳ Waiting for Apify run to complete (timeout: 45 seconds for Vercel compatibility)...`)
      console.log(`   Run ID: ${run.id}`)
      console.log(`   Monitor progress: https://console.apify.com/actors/runs/${run.id}`)
      console.log(`   Note: If timeout occurs, check Apify console for results`)
      
      // Reduced timeout for Vercel serverless functions (45 seconds max)
      // Vercel Pro: 60s max, Hobby: 10s max - we use 45s to be safe
      // Try to get results even if run is still running (partial results)
      runResult = await Promise.race([
        client.run(run.id).waitForFinish({ waitSecs: 45 }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Apify run timeout after 45 seconds (Vercel limit)')), 45000) // 45 second timeout
        )
      ]) as { defaultDatasetId: string, status: string }

      console.log(`✅ Apify run finished with status: ${runResult.status}`)
      
      // Check final status - even if it says FAILED, try to get results (sometimes partial results are available)
      if (runResult.status === 'FAILED') {
        console.warn(`⚠️ Apify run marked as FAILED, but checking for partial results...`)
        console.warn(`   Check logs at: https://console.apify.com/actors/runs/${run.id}`)
          // Try to get error details
          try {
            const runDetails = await client.run(run.id).get()
            if (runDetails) {
              console.warn(`   Run error:`, runDetails.statusMessage || 'Unknown error')
            }
            // Even if failed, try to get results - sometimes partial results are available
            if (runResult.defaultDatasetId) {
              console.log(`   Attempting to fetch results despite FAILED status...`)
              // Continue to fetch results below - don't return early
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
      
      // If timeout, try to get partial results anyway
      if (error instanceof Error && error.message.includes('timeout')) {
        console.log(`⏰ Timeout occurred, attempting to fetch partial results...`)
        try {
          const runInfo = await client.run(run.id).get()
          if (runInfo && runInfo.defaultDatasetId) {
            console.log(`   Found dataset ID: ${runInfo.defaultDatasetId}`)
            runResult = { defaultDatasetId: runInfo.defaultDatasetId, status: runInfo.status || 'RUNNING' }
            console.log(`   Run status: ${runResult.status}`)
            // Continue to fetch results below
          } else {
            console.warn(`   No dataset available yet, run may still be starting`)
            return []
          }
        } catch (e) {
          console.error(`   Could not fetch partial results:`, e)
          return []
        }
      } else {
        return []
      }
    }

    // Fetch the results
    let items: any[] = []
    try {
      // Wait a moment for dataset to be fully written (sometimes there's a delay)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log(`📥 Fetching results from Apify dataset: ${runResult.defaultDatasetId}`)
      const dataset = await client.dataset(runResult.defaultDatasetId).listItems()
      items = dataset.items || []
      console.log(`📊 Found ${items.length} raw items from Apify LinkedIn scraper`)
      
      // No retry - only run once as requested
      
      // If no items, try to get more info
          if (items.length === 0) {
            console.warn(`⚠️ Apify returned 0 items. Checking run status...`)
            try {
              const runInfo = await client.run(run.id).get()
              if (runInfo) {
                console.log(`   Run status: ${runInfo.status}`)
                console.log(`   Run stats:`, runInfo.stats)
                if (runInfo.statusMessage) {
                  console.log(`   Status message: ${runInfo.statusMessage}`)
                }
              }
            } catch (e) {
              console.log(`   Could not fetch run details`)
            }
          }
    } catch (error) {
      console.error(`❌ Error fetching results from Apify dataset:`, error)
      console.error(`   Dataset ID: ${runResult.defaultDatasetId}`)
      console.error(`   Error:`, error instanceof Error ? error.message : String(error))
      return []
    }
    
    if (items.length === 0) {
      console.warn('No jobs returned from Apify. Check actor input parameters and LinkedIn search results.')
      return []
    }
    
    // Log sample item structure to help debug
    if (items.length > 0) {
      console.log('✅ Sample Apify item structure (first item):')
      console.log('   Keys:', Object.keys(items[0]))
      console.log('   Title:', items[0].title || items[0].jobTitle || 'N/A')
      console.log('   Company:', items[0].company || items[0].companyName || 'N/A')
      console.log('   URL:', items[0].url || items[0].jobUrl || items[0].link || items[0].externalUrl || 'N/A')
      console.log('   Location:', items[0].location || items[0].jobLocation || 'N/A')
      console.log('   Date Posted:', items[0].datePosted || items[0].postedDate || 'N/A')
      // Log first item fully for debugging
      console.log('   Full first item:', JSON.stringify(items[0], null, 2))
    } else {
      console.warn('⚠️ Apify returned 0 items. This could mean:')
      console.warn('   1. The search query returned no results on LinkedIn')
      console.warn('   2. The actor parameters are incorrect')
      console.warn('   3. LinkedIn blocked the scraper')
      console.warn('   4. The actor needs different input parameters')
      console.warn('   5. Check the Apify run at: https://console.apify.com/actors/runs/' + run.id)
      console.warn('')
      console.warn('💡 Try manually searching LinkedIn with the same query to verify jobs exist')
    }

    // Convert Apify results to JobPosting format
    const jobPostings: JobPosting[] = items
      .map((item: any, index: number) => {
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
          postedDate = parseLinkedInDate(item.datePosted)
        } else if (item.publishedAt) {
          postedDate = new Date(item.publishedAt).toISOString()
        } else if (item.postedDate) {
          postedDate = parseLinkedInDate(item.postedDate)
        }

        // Extract URLs - try multiple field names that Apify might use
        // Common Apify LinkedIn scraper fields: url, jobUrl, link, externalUrl, applyUrl, jobLink
        let jobUrl = item.url || 
                     item.jobUrl || 
                     item.link || 
                     item.jobLink ||
                     item.externalUrl ||
                     item.linkedInUrl ||
                     ''
        
        let applyUrl = item.applyUrl || 
                       item.applicationUrl ||
                       item.applyLink ||
                       item.externalApplyUrl ||
                       ''
        
        // If URL doesn't start with http, it might be a relative path or job ID
        if (jobUrl && !jobUrl.startsWith('http')) {
          // Check if it's a LinkedIn job ID format (numeric)
          if (jobUrl.match(/^\d+$/)) {
            // It's a job ID, construct the LinkedIn job URL
            jobUrl = `https://www.linkedin.com/jobs/view/${jobUrl}`
          } else {
            // It's a relative path
            jobUrl = `https://www.linkedin.com${jobUrl.startsWith('/') ? jobUrl : '/' + jobUrl}`
          }
        }
        
        if (applyUrl && !applyUrl.startsWith('http')) {
          if (applyUrl.match(/^\d+$/)) {
            applyUrl = `https://www.linkedin.com/jobs/view/${applyUrl}/apply`
          } else {
            applyUrl = `https://www.linkedin.com${applyUrl.startsWith('/') ? applyUrl : '/' + applyUrl}`
          }
        }
        
        // If we still don't have a valid job URL, try to construct one from job ID
        if (!jobUrl || jobUrl.includes('/jobs/search/')) {
          // Try to extract job ID from various fields
          const jobId = item.jobId || item.id || item.linkedInJobId || item.job_id
          if (jobId) {
            const jobIdStr = String(jobId)
            // Check if it's numeric (LinkedIn job ID format)
            if (jobIdStr.match(/^\d+$/)) {
              // Construct LinkedIn job URL from job ID
              jobUrl = `https://www.linkedin.com/jobs/view/${jobIdStr}`
              applyUrl = `${jobUrl}/apply`
              console.log(`✅ Constructed URL from job ID for: ${item.title || item.jobTitle}`)
            } else {
              // Try to extract numeric ID from string
              const numericId = jobIdStr.match(/\d+/)?.[0]
              if (numericId) {
                jobUrl = `https://www.linkedin.com/jobs/view/${numericId}`
                applyUrl = `${jobUrl}/apply`
                console.log(`✅ Constructed URL from extracted job ID for: ${item.title || item.jobTitle}`)
              }
            }
          }
          
          // If still no URL, try to use the search URL as fallback (better than nothing)
          if (!jobUrl || jobUrl.includes('/jobs/search/')) {
            const searchQuery = encodeURIComponent(item.title || item.jobTitle || keywords)
            jobUrl = `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}&location=${encodeURIComponent(location)}`
            applyUrl = jobUrl
            console.log(`⚠️ Using search URL as fallback for: ${item.title || item.jobTitle}`)
          }
        }
        
        // Ensure apply URL is a proper application link
        // If no separate applyUrl, construct one from jobUrl
        if (!applyUrl || applyUrl === jobUrl) {
          if (jobUrl.includes('/jobs/view/')) {
            // Try to add /apply to the job URL
            applyUrl = jobUrl.replace(/\/$/, '') + '/apply'
          } else {
            // Use job URL as fallback
            applyUrl = jobUrl
          }
        }

        return {
          id: `linkedin-${item.jobId || item.id || item.jobUrl || Date.now()}-${index}`,
          title: item.title || item.jobTitle || '',
          company: item.company || item.companyName || item.companyName || '',
          location: item.location || item.jobLocation || item.locationName || '',
          description: description,
          requirements,
          postedDate: postedDate,
          url: jobUrl,
          applyUrl: applyUrl,
          source: 'LinkedIn'
        }
      })
      .filter((job: JobPosting | null): job is JobPosting => 
        job !== null && 
        Boolean(job.title) && 
        Boolean(job.company)
        // Don't filter out search URLs - include them if that's all we have
        // Better to show jobs with search URLs than show nothing
      ) // Filter out invalid jobs and nulls, but keep search URLs if needed

    return jobPostings

  } catch (error) {
    console.error('Error scraping LinkedIn with Apify:', error)
    // Return empty array on error - fallback to mock data
    return []
  }
}

// Parse LinkedIn date format (e.g., "2 days ago", "1 week ago", or ISO date string)
function parseLinkedInDate(dateText: string): string {
  // If it's already an ISO date string, return it
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

// Extract requirements from job description
function extractRequirements(description: string): string[] {
  const requirements: string[] = []
  const lowerDesc = description.toLowerCase()

  // Common requirement patterns
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

  return [...new Set(requirements)] // Remove duplicates
}

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
    if (!apifyToken) {
      console.log('Apify API token not found, skipping LinkedIn search')
      return []
    }

    const client = new ApifyClient({ token: apifyToken })
    
    // Use Apify's LinkedIn Jobs Scraper actor
    // Common actors: apify/linkedin-jobs-scraper, apify/linkedin-jobs-scraper-v2
    const actorId = process.env.APIFY_LINKEDIN_ACTOR_ID || 'apify/linkedin-jobs-scraper'
    
    console.log('Starting Apify LinkedIn job search...')
    console.log(`Searching for: ${keywords} in ${location}`)
    
    // Build search parameters - try multiple Apify actor input formats
    // Common formats: searchKeywords/searchQuery, location, maxItems/limit
    const searchParams: any = {
      // Try common parameter names
      searchKeywords: keywords,
      searchQuery: keywords,
      query: keywords,
      keywords: keywords,
      location: location,
      locationName: location,
      maxItems: 100,
      limit: 100,
      maxResults: 100
    }

    // Add job type - FULL-TIME ONLY (required filter)
    searchParams.jobType = 'F'
    searchParams.type = 'F'
    searchParams.fullTime = true
    searchParams.f_JT = 'F' // LinkedIn filter for full-time
    
    // Add date filter for past week
    if (timeRange === 'r604800') {
      searchParams.datePosted = 'r604800'
      searchParams.postedDate = 'r604800'
      searchParams.timeFilter = 'r604800'
      searchParams.f_TPR = 'r604800' // LinkedIn time posted filter
      // Some actors use days
      searchParams.days = 7
    }

    // Add experience level if specified
    if (experienceLevel) {
      searchParams.experience = experienceLevel
      searchParams.experienceLevel = experienceLevel
    }
    
    // Note: We don't restrict to remote only - allow all locations
    // The filters will handle company and other criteria

    // Verify actor exists and get its input schema
    try {
      const actor = await client.actor(actorId).get()
      if (actor) {
        console.log(`Using Apify actor: ${actor.username || 'unknown'}/${actor.name || actorId}`)
      }
    } catch (error) {
      console.error(`Actor ${actorId} not found or not accessible`)
      throw new Error(`Apify actor ${actorId} not found. Please check APIFY_LINKEDIN_ACTOR_ID in .env`)
    }

    // Run the Apify actor
    console.log('Calling Apify actor with params:', JSON.stringify(searchParams, null, 2))
    const run = await client.actor(actorId).call(searchParams)

    console.log(`Apify run started: ${run.id}`)
    console.log(`Monitor run at: https://console.apify.com/actors/runs/${run.id}`)

    // Wait for the run to finish (with timeout)
    const runResult = await Promise.race([
      client.run(run.id).waitForFinish(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Apify run timeout after 2 minutes')), 120000) // 2 minute timeout
      )
    ]) as { defaultDatasetId: string, status: string }

    console.log(`Apify run finished with status: ${runResult.status}`)

    // Fetch the results
    const { items } = await client.dataset(runResult.defaultDatasetId).listItems()
    
    console.log(`Found ${items.length} jobs from Apify LinkedIn scraper`)
    
    if (items.length === 0) {
      console.warn('No jobs returned from Apify. Check actor input parameters and LinkedIn search results.')
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

        // Ensure we have a valid URL - prioritize LinkedIn URLs
        let jobUrl = item.url || item.jobUrl || item.link || item.applyUrl || ''
        let applyUrl = item.applyUrl || item.url || item.jobUrl || item.link || ''
        
        // If URL doesn't start with http, it might be a relative path
        if (jobUrl && !jobUrl.startsWith('http')) {
          jobUrl = `https://www.linkedin.com${jobUrl.startsWith('/') ? jobUrl : '/' + jobUrl}`
        }
        if (applyUrl && !applyUrl.startsWith('http')) {
          applyUrl = `https://www.linkedin.com${applyUrl.startsWith('/') ? applyUrl : '/' + applyUrl}`
        }
        
        // If no URL found, create a LinkedIn search URL as fallback
        if (!jobUrl) {
          const searchQuery = encodeURIComponent(item.title || item.jobTitle || keywords)
          jobUrl = `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}`
          applyUrl = jobUrl
        }

        return {
          id: `linkedin-${item.jobId || item.id || Date.now()}-${index}`,
          title: item.title || item.jobTitle || '',
          company: item.company || item.companyName || item.companyName || '',
          location: item.location || item.jobLocation || item.locationName || '',
          description: description,
          requirements,
          postedDate: postedDate,
          url: jobUrl,
          applyUrl: applyUrl || jobUrl, // Use job URL as apply URL if no separate apply URL
          source: 'LinkedIn'
        }
      })
      .filter((job: JobPosting) => job.title && job.company) // Filter out invalid jobs

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

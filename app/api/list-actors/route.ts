import { NextRequest, NextResponse } from 'next/server'
import { ApifyClient } from 'apify-client'

/**
 * List available actors that can be used for job scraping
 */
export async function GET(request: NextRequest) {
  try {
    const apifyToken = process.env.APIFY_API_TOKEN
    if (!apifyToken) {
      return NextResponse.json({
        success: false,
        error: 'APIFY_API_TOKEN not found'
      }, { status: 400 })
    }

    const client = new ApifyClient({ token: apifyToken })
    
    // Try to find LinkedIn, Indeed, and Glassdoor actors
    const actorSearches = [
      { name: 'LinkedIn', searchTerms: ['linkedin', 'jobs'] },
      { name: 'Indeed', searchTerms: ['indeed', 'jobs'] },
      { name: 'Glassdoor', searchTerms: ['glassdoor', 'jobs'] }
    ]

    const results: any = {
      success: true,
      actors: {}
    }

    // Try common actor IDs
    const commonActors = [
      'curious_coder/linkedin-jobs-scraper',  // User's working actor
      'apify/linkedin-jobs-scraper',
      'apify/linkedin-jobs-scraper-v2',
      'apify/indeed-scraper',
      'apify/indeed-jobs-scraper',
      'apify/glassdoor-scraper',
      'apify/glassdoor-jobs-scraper',
      'dtrungtin/linkedin-jobs-scraper',
      'helenai/linkedin-jobs-scraper'
    ]

    for (const actorId of commonActors) {
      try {
        const actor = await client.actor(actorId).get()
        if (actor) {
          const category = actorId.includes('linkedin') ? 'LinkedIn' : 
                          actorId.includes('indeed') ? 'Indeed' : 
                          actorId.includes('glassdoor') ? 'Glassdoor' : 'Other'
          
          if (!results.actors[category]) {
            results.actors[category] = []
          }
          
          results.actors[category].push({
            id: actorId,
            name: actor.name,
            username: actorId.split('/')[0], // Extract username from actorId
            description: actor.description || 'No description',
            isPublic: actor.isPublic || false
          })
        }
      } catch (error) {
        // Actor not found, skip
        continue
      }
    }

    // Also try to search the store
    try {
      const store = await client.store().list()
      if (store && store.items) {
        const jobScrapers = store.items.filter((item: any) => 
          item.name?.toLowerCase().includes('job') || 
          item.name?.toLowerCase().includes('linkedin') ||
          item.name?.toLowerCase().includes('indeed') ||
          item.name?.toLowerCase().includes('glassdoor')
        )
        
        if (jobScrapers.length > 0) {
          results.storeActors = jobScrapers.slice(0, 10).map((item: any) => ({
            id: item.username ? `${item.username}/${item.name}` : item.name,
            name: item.name,
            username: item.username,
            description: item.description
          }))
        }
      }
    } catch (error) {
      // Store search failed, that's okay
      results.storeSearchError = error instanceof Error ? error.message : String(error)
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to list actors',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}


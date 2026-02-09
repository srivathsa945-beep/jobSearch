import { NextRequest, NextResponse } from 'next/server'

/**
 * Debug endpoint to check environment and see what's happening
 */
export async function GET(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasApifyToken: !!process.env.APIFY_API_TOKEN,
      apifyTokenLength: process.env.APIFY_API_TOKEN?.length || 0,
      apifyTokenPrefix: process.env.APIFY_API_TOKEN?.substring(0, 15) || 'NOT_SET',
      hasLinkedInActorId: !!process.env.APIFY_LINKEDIN_ACTOR_ID,
      linkedInActorId: process.env.APIFY_LINKEDIN_ACTOR_ID || 'NOT_SET',
    },
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('APIFY')),
    testResults: {}
  }

  // Test Apify connection if token exists
  if (process.env.APIFY_API_TOKEN) {
    try {
      const { ApifyClient } = await import('apify-client')
      const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN })
      
      try {
        const user = await client.user().get()
        debugInfo.testResults.apifyConnection = {
          success: true,
          user: user.username || user.id
        }
      } catch (error) {
        debugInfo.testResults.apifyConnection = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }
      
      // Test actor access
      const actorId = process.env.APIFY_LINKEDIN_ACTOR_ID || 'apify/linkedin-jobs-scraper'
      try {
        const actor = await client.actor(actorId).get()
        debugInfo.testResults.actorAccess = {
          success: true,
          actorId: actorId,
          actorName: actor.name
        }
      } catch (error) {
        debugInfo.testResults.actorAccess = {
          success: false,
          actorId: actorId,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    } catch (error) {
      debugInfo.testResults.apifyClient = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: 'Failed to import or initialize ApifyClient'
      }
    }
  }

  return NextResponse.json(debugInfo, { status: 200 })
}


import { NextRequest, NextResponse } from 'next/server'
import { ApifyClient } from 'apify-client'

/**
 * Test endpoint to verify Apify connection
 */
export async function GET(request: NextRequest) {
  try {
    const apifyToken = process.env.APIFY_API_TOKEN
    
    if (!apifyToken) {
      return NextResponse.json({
        success: false,
        error: 'APIFY_API_TOKEN not found in environment variables',
        message: 'Please check your .env file'
      }, { status: 400 })
    }

    console.log('Testing Apify connection...')
    console.log(`Token present: ${apifyToken ? 'Yes' : 'No'}`)
    console.log(`Token starts with: ${apifyToken.substring(0, 15)}...`)

    const client = new ApifyClient({ token: apifyToken })
    
    // Try to get user info to verify token works
    try {
      const user = await client.user().get()
      console.log('✅ Apify token is valid!')
      console.log(`User: ${user.username || user.id}`)
      
      // Try to get actor info
      const actorId = process.env.APIFY_LINKEDIN_ACTOR_ID || 'curious_coder/linkedin-jobs-scraper'
      try {
        const actorResponse = await client.actor(actorId).get()
        if (actorResponse && actorResponse.id) {
          return NextResponse.json({
            success: true,
            message: 'Apify connection successful!',
            user: {
              username: user.username,
              id: user.id
            },
            actor: {
              id: actorId,
              name: actorResponse.name,
              username: actorId.split('/')[0], // Extract username from actorId
              found: true
            }
          })
        } else {
          throw new Error('Actor response is invalid')
        }
      } catch (actorError) {
        // Try to find alternative actors
        const foundActors: any[] = []
        const alternativeActors = [
          'curious_coder/linkedin-jobs-scraper',
          'dtrungtin/linkedin-jobs-scraper',
          'helenai/linkedin-jobs-scraper',
          'apify/linkedin-jobs-scraper-v2'
        ]
        
        for (const altActor of alternativeActors) {
          if (altActor === actorId) continue
          try {
            const altActorResponse = await client.actor(altActor).get()
            if (altActorResponse && altActorResponse.id) {
              foundActors.push({
                id: altActor,
                name: altActorResponse.name,
                username: altActor.split('/')[0] // Extract username from actorId
              })
            }
          } catch (e) {
            // Skip
          }
        }
        
        return NextResponse.json({
          success: true,
          message: 'Apify token works, but specified actor not found',
          user: {
            username: user.username,
            id: user.id
          },
          actor: {
            id: actorId,
            found: false,
            error: actorError instanceof Error ? actorError.message : String(actorError)
          },
          alternativeActors: foundActors,
          suggestion: foundActors.length > 0 
            ? `Found ${foundActors.length} alternative actor(s). Update APIFY_LINKEDIN_ACTOR_ID in .env to use one of them.`
            : 'Visit /api/list-actors to find available actors, or check https://console.apify.com/actors'
        })
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Apify token is invalid or expired',
        details: error instanceof Error ? error.message : String(error),
        message: 'Please verify your APIFY_API_TOKEN in .env file'
      }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to test Apify connection',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}


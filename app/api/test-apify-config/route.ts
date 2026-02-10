import { NextRequest, NextResponse } from 'next/server'

// Ensure this route uses Node.js runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Diagnostic endpoint to check Apify configuration
 * Visit: /api/test-apify-config
 */
export async function GET(request: NextRequest) {
  const apifyToken = process.env.APIFY_API_TOKEN
  const linkedInActorId = process.env.APIFY_LINKEDIN_ACTOR_ID || 'curious_coder/linkedin-jobs-scraper'
  const googleActorId = process.env.APIFY_GOOGLE_ACTOR_ID || 'johnvc/Google-Jobs-Scraper'
  
  const allEnvVars = Object.keys(process.env).filter(k => k.startsWith('APIFY'))
  
  const config = {
    hasToken: !!apifyToken,
    tokenLength: apifyToken?.length || 0,
    tokenPrefix: apifyToken?.substring(0, 20) || 'N/A',
    tokenFormatValid: apifyToken?.startsWith('apify_api_') || false,
    linkedInActorId,
    googleActorId,
    allApifyEnvVars: allEnvVars,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  }
  
  let status = 200
  let message = 'Configuration check complete'
  
  if (!apifyToken) {
    status = 500
    message = '❌ APIFY_API_TOKEN is NOT set in environment variables'
  } else if (!apifyToken.startsWith('apify_api_')) {
    status = 500
    message = '⚠️ APIFY_API_TOKEN format is incorrect (should start with "apify_api_")'
  } else {
    message = '✅ APIFY_API_TOKEN is set and format looks correct'
  }
  
  return NextResponse.json({
    success: status === 200,
    message,
    config,
    instructions: !apifyToken ? {
      step1: 'Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
      step2: 'Add: APIFY_API_TOKEN = apify_api_74LnWixKE5sIesne0Jormuz9GW19E444A30c',
      step3: 'Select all environments (Production, Preview, Development)',
      step4: 'Click Save',
      step5: 'REDEPLOY your application (Deployments → ⋯ → Redeploy)'
    } : null
  }, { status })
}



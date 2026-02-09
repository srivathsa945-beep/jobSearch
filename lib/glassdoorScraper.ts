import { JobPosting } from '@/types'
import { ApifyClient } from 'apify-client'

export async function searchGlassdoorJobs(
  keywords: string = 'project manager',
  location: string = 'United States',
  timeRange: string = '7' // Past 7 days
): Promise<JobPosting[]> {
  // Indeed and Glassdoor actors are not available in your Apify account
  // Returning empty array - focusing on LinkedIn only for now
  console.log('⚠️ Glassdoor scraper: Actors not available. Skipping Glassdoor search.')
  console.log('   To enable Glassdoor search, find a working Glassdoor scraper actor in Apify store')
  return []
}

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
  }

  return now.toISOString()
}

function extractRequirements(description: string): string[] {
  const requirements: string[] = []
  const patterns = [
    /(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/gi,
    /(bachelor|master|phd|degree|bs|ms|mba)/gi,
    /(pmp|certified|certification)/gi,
    /(agile|scrum|kanban)/gi
  ]

  patterns.forEach(pattern => {
    const matches = description.match(pattern)
    if (matches) {
      requirements.push(...matches)
    }
  })

  return [...new Set(requirements)]
}


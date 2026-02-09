import { JobPosting } from '@/types'

/**
 * Check if a job REQUIRES PMP certification (not just mentions it)
 * Looks for strong requirement language like "required", "must have", "required PMP", etc.
 * Made less strict to catch more jobs that require PMP
 */
export function requiresPMP(job: JobPosting): boolean {
  const text = (job.description + ' ' + job.title + ' ' + job.requirements.join(' ')).toLowerCase()
  
  // Strong requirement indicators
  const requirementPatterns = [
    /\bpmp\s+(?:is\s+)?(?:required|mandatory|necessary|essential|must|needed)/i,
    /(?:required|must have|must possess|must be)\s+(?:pmp|project management professional)/i,
    /pmp\s+certification\s+(?:is\s+)?(?:required|mandatory|necessary|essential|must)/i,
    /(?:required|mandatory|necessary|essential)\s+pmp\s+certification/i,
    /pmp\s+(?:certified|certification)\s+(?:required|mandatory|necessary|essential|must)/i,
    /(?:candidates?|applicants?|individuals?)\s+(?:must|should|are required to)\s+(?:have|possess|be)\s+(?:pmp|project management professional)/i,
    /(?:pmp|project management professional)\s+(?:certified|certification)\s+(?:preferred|required|mandatory)/i,
    // Less strict patterns
    /\bpmp\s+(?:certified|certification)/i,  // If PMP certification is mentioned, likely required
    /(?:pmp|project management professional)\s+(?:preferred|required)/i
  ]
  
  // Check for strong requirement language
  for (const pattern of requirementPatterns) {
    if (pattern.test(text)) {
      return true
    }
  }
  
  // Also check if PMP is mentioned in requirements section or near "required" keywords
  const pmpMentioned = /\bpmp\b|\bproject management professional\b/i.test(text)
  const hasRequirementKeywords = /(?:required|must|mandatory|necessary|essential|qualification|prerequisite|preferred)/i.test(text)
  
  // If PMP is mentioned AND there are requirement keywords nearby, consider it required
  if (pmpMentioned && hasRequirementKeywords) {
    // Check if PMP and requirement keywords are close together (within 100 characters - more lenient)
    const pmpMatches = [...text.matchAll(/\bpmp\b|\bproject management professional\b/gi)]
    const reqMatches = [...text.matchAll(/(?:required|must|mandatory|necessary|essential|qualification|prerequisite|preferred)/gi)]
    
    for (const pmpMatch of pmpMatches) {
      for (const reqMatch of reqMatches) {
        const distance = Math.abs(pmpMatch.index! - reqMatch.index!)
        if (distance < 100) {  // Increased from 50 to 100
          return true
        }
      }
    }
  }
  
  // If job title contains PMP, likely required
  if (/\bpmp\b/i.test(job.title)) {
    return true
  }
  
  return false
}

/**
 * Check if job title is similar to "project manager"
 */
export function isProjectManagerRole(title: string): boolean {
  const titleLower = title.toLowerCase()
  
  const projectManagerKeywords = [
    'project manager',
    'program manager',
    'project management',
    'program management',
    'project lead',
    'project coordinator',
    'project director',
    'project specialist',
    'project analyst',
    'project administrator',
    'senior project manager',
    'technical project manager',
    'it project manager',
    'agile project manager',
    'scrum master',
    'project management office',
    'pmo'
  ]
  
  return projectManagerKeywords.some(keyword => titleLower.includes(keyword))
}

/**
 * Filter jobs to only include Project Manager roles that require PMP
 */
export function filterPMPRequiredProjectManagerJobs(jobs: JobPosting[]): JobPosting[] {
  console.log(`🔍 Filtering for Project Manager roles that REQUIRE PMP certification...`)
  console.log(`   Starting with ${jobs.length} jobs`)
  
  const filtered = jobs.filter(job => {
    // Check if it's a project manager role
    const isPMRole = isProjectManagerRole(job.title)
    if (!isPMRole) {
      return false
    }
    
    // Check if it requires PMP
    const requiresPMPCert = requiresPMP(job)
    if (!requiresPMPCert) {
      console.log(`  ❌ Excluded: ${job.title} at ${job.company} - Project Manager role but PMP not required`)
      return false
    }
    
    console.log(`  ✅ Included: ${job.title} at ${job.company} - Project Manager role with PMP requirement`)
    return true
  })
  
  console.log(`✅ Found ${filtered.length} Project Manager jobs that REQUIRE PMP certification`)
  return filtered
}


import { JobPosting } from '@/types'

// List of staffing/recruiting companies to exclude
const STAFFING_COMPANIES = [
  'robert half', 'roberthalf', 'randstad', 'adecco', 'manpower',
  'kelly services', 'kellyservices', 'allegis', 'allegis group',
  'aerotek', 'teksystems', 'teksystems', 'insight global', 'insightglobal',
  'kforce', 'modis', 'harvey nash', 'harveynash',
  'hays', 'michael page', 'michaelpage', 'page group',
  'hudson', 'hudson global', 'hudsonrpo',
  'volt', 'volt workforce', 'voltworkforce',
  'staffing solutions', 'staffingsolutions', 'talent solutions',
  'recruiting', 'recruiter', 'recruitment', 'staffing agency',
  'temporary', 'temp', 'contractor', 'contract', 'consulting firm',
  'wipro', 'infosys', 'tcs', 'tata consultancy', 'cognizant',
  'accenture', 'deloitte', 'pwc', 'ey', 'kpmg', 'capgemini',
  'hcl', 'tech mahindra', 'lti', 'mindtree', 'mphasis',
  'genpact', 'dXC', 'dxc technology', 'atos', 'atos syntel',
  'collabera', 'collabera inc', 'cybercoders', 'cyber coders',
  'apex systems', 'apexsystems', 'actalent', 'actalent engineering',
  'talentburst', 'talent burst', 'yoh', 'yoh services',
  'judge group', 'judgegroup', 'the judge group',
  'planet technology', 'planetech', 'planet technology group',
  'bridgeview it', 'bridgeview', 'bridgeview it solutions',
  'apex', 'apex systems inc', 'apex systems llc',
  'mason frank', 'masonfrank', 'mason frank international',
  'franklin covey', 'franklin covey co', 'franklin covey company',
  'talent', 'talent solutions', 'talent acquisition',
  'recruiting solutions', 'recruiting services', 'staffing services',
  'it staffing', 'tech staffing', 'engineering staffing',
  'contract staffing', 'temporary staffing', 'contingent workforce'
]

/**
 * Check if a company is a staffing/recruiting company
 * If it's NOT a staffing company, it's considered an end-client (direct employer)
 */
function isStaffingCompany(companyName: string): boolean {
  const companyLower = companyName.toLowerCase().trim()
  
  // Check if company name contains any staffing company name
  for (const staffing of STAFFING_COMPANIES) {
    if (companyLower.includes(staffing)) {
      return true
    }
  }
  
  return false
}

/**
 * Extract salary from job description
 * Returns salary in thousands (e.g., 120 for $120k)
 */
function extractSalary(description: string): number | null {
  const lowerDesc = description.toLowerCase()
  
  // Patterns to match salary: $100k, $100,000, 100k-150k, 100-150k, etc.
  const salaryPatterns = [
    /\$(\d{1,3})(?:k|,000)/g,  // $100k, $120k, $1,000
    /(\d{1,3})(?:k|,000)\s*(?:per\s*)?(?:year|annum|annually|yr)/gi,  // 100k per year
    /salary[:\s]+(?:range[:\s]+)?\$?(\d{1,3})(?:k|,000)/gi,  // Salary: $100k
    /(\d{1,3})(?:k|,000)\s*-\s*\$?(\d{1,3})(?:k|,000)/g,  // 100k-150k (take the higher)
  ]
  
  let maxSalary = 0
  
  for (const pattern of salaryPatterns) {
    const matches = description.matchAll(pattern)
    for (const match of matches) {
      let salary = 0
      if (match[2]) {
        // Range: take the higher value
        salary = Math.max(parseInt(match[1]), parseInt(match[2]))
      } else {
        salary = parseInt(match[1])
      }
      
      // Convert to thousands if not already (e.g., 100000 -> 100)
      if (salary > 1000) {
        salary = salary / 1000
      }
      
      maxSalary = Math.max(maxSalary, salary)
    }
  }
  
  return maxSalary > 0 ? maxSalary : null
}

/**
 * Check if job description mentions benefits
 */
function hasBenefits(description: string): boolean {
  const lowerDesc = description.toLowerCase()
  
  const benefitKeywords = [
    'benefits', 'benefit package', 'benefits package',
    'health insurance', 'medical insurance', 'dental insurance', 'vision insurance',
    '401k', '401(k)', 'retirement plan', 'pension',
    'paid time off', 'pto', 'vacation', 'sick leave', 'holiday pay',
    'life insurance', 'disability insurance',
    'flexible spending account', 'fsa', 'hsa', 'health savings account',
    'tuition reimbursement', 'education assistance',
    'employee assistance program', 'eap',
    'wellness program', 'gym membership', 'fitness',
    'stock options', 'equity', 'bonus', 'incentive',
    'remote work', 'work from home', 'flexible schedule',
    'maternity leave', 'paternity leave', 'parental leave'
  ]
  
  return benefitKeywords.some(keyword => lowerDesc.includes(keyword))
}

/**
 * Check if job is full-time
 */
function isFullTime(description: string, title: string): boolean {
  const text = (description + ' ' + title).toLowerCase()
  
  // Exclude part-time, contract, temporary
  const excludeTerms = ['part-time', 'part time', 'contract', 'temporary', 'temp', 'freelance', 'consultant']
  if (excludeTerms.some(term => text.includes(term))) {
    return false
  }
  
  // Include full-time indicators
  const includeTerms = ['full-time', 'full time', 'fulltime', 'permanent', 'ft']
  if (includeTerms.some(term => text.includes(term))) {
    return true
  }
  
  // Default to full-time if no indicators (most professional jobs are full-time)
  return true
}

/**
 * Apply all job filters based on user criteria
 */
export function filterJobs(jobs: JobPosting[]): JobPosting[] {
  console.log(`🔍 Filtering ${jobs.length} jobs with criteria:`)
  console.log('  - Full-time only')
  console.log('  - No staffing/recruiting companies')
  console.log('  - Salary > $100k per annum (or not specified)')
  console.log('  - Must have benefits mentioned')
  console.log('  - End-client companies only (companies like Toyota, PepsiCo, First Citizens Bank, Capital One, etc. - any company that is NOT a staffing agency)')
  
  const filtered = jobs.filter(job => {
    // 1. Full-time check
    if (!isFullTime(job.description, job.title)) {
      console.log(`  ❌ Excluded: ${job.title} at ${job.company} - Not full-time`)
      return false
    }
    
    // 2. Exclude staffing companies
    if (isStaffingCompany(job.company)) {
      console.log(`  ❌ Excluded: ${job.title} at ${job.company} - Staffing company`)
      return false
    }
    
    // 3. Salary check (>$100k)
    // Only exclude if salary is explicitly mentioned and below $100k
    // If salary not mentioned, include it (many jobs don't list salary but may still pay >$100k)
    const salary = extractSalary(job.description)
    if (salary !== null && salary < 100) {
      console.log(`  ❌ Excluded: ${job.title} at ${job.company} - Salary too low ($${salary}k)`)
      return false
    }
    if (salary !== null && salary >= 100) {
      console.log(`  ✅ Salary check passed: $${salary}k`)
    }
    
    // 4. Benefits check
    if (!hasBenefits(job.description)) {
      console.log(`  ❌ Excluded: ${job.title} at ${job.company} - No benefits mentioned`)
      return false
    }
    
    // 5. End-client check (exclude staffing companies, include all others)
    // All companies that are NOT staffing companies are considered end-clients
    // This includes Toyota, PepsiCo, First Citizens Bank, Capital One, and all similar end-client companies
    // (Staffing companies are already filtered out in step 2, so we just need to verify)
    // If we reach here and it's not a staffing company, it's an end-client - include it
    
    console.log(`  ✅ Included: ${job.title} at ${job.company}`)
    return true
  })
  
  console.log(`✅ Filtered to ${filtered.length} jobs matching all criteria`)
  return filtered
}


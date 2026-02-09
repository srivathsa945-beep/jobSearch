import { JobPosting } from '@/types'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { searchLinkedInJobs } from './linkedinScraper'
import { filterJobs } from './jobFilters'

// Helper function to generate valid LinkedIn search URLs
function getLinkedInSearchUrl(jobTitle: string): string {
  const encodedTitle = encodeURIComponent(jobTitle)
  return `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}&f_TPR=r604800`
}

// Comprehensive job database with diverse roles
// Dates are calculated dynamically based on current date
// Note: These are fallback mock jobs - real jobs come from Apify LinkedIn scraper
function getAllJobs(): JobPosting[] {
  const now = Date.now()
  // Calculate dates relative to TODAY (dynamic)
  const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString()
  const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString()

  return [
    // Project Management Roles
    {
      id: 'pm1',
      title: 'Senior Project Manager',
      company: 'Toyota',
      location: 'Plano, TX / Remote',
      description: 'We are seeking an experienced Senior Project Manager with 7+ years of experience managing complex software projects. Must have PMP certification, Agile/Scrum experience, and strong leadership skills. You will lead cross-functional teams and manage project timelines, budgets, and stakeholder communication. Full-time position with competitive salary of $120k-$150k per annum. Comprehensive benefits package including health insurance, 401k, paid time off, and more.',
      requirements: ['Project Management', 'PMP', 'Agile', 'Scrum', 'Leadership', '7+ years experience', 'Stakeholder Management'],
      postedDate: daysAgo(1),
      url: getLinkedInSearchUrl('Senior Project Manager Toyota'),
      applyUrl: getLinkedInSearchUrl('Senior Project Manager Toyota'),
      source: 'LinkedIn (Mock)'
    },
    {
      id: 'pm2',
      title: 'Technical Project Manager',
      company: 'Capital One',
      location: 'McLean, VA / Remote',
      description: 'Technical Project Manager needed to oversee software development projects. Requires 5+ years managing technical teams, experience with JIRA, Confluence, and Agile methodologies. Strong technical background preferred. Full-time role with salary range $110k-$140k annually. Excellent benefits including medical, dental, vision, 401k match, stock options, and flexible work arrangements.',
      requirements: ['Project Management', 'Agile', 'JIRA', 'Confluence', 'Technical Leadership', '5+ years experience'],
      postedDate: daysAgo(2),
      url: getLinkedInSearchUrl('Technical Project Manager Capital One'),
      applyUrl: getLinkedInSearchUrl('Technical Project Manager Capital One'),
      source: 'LinkedIn (Mock)'
    },
    {
      id: 'pm3',
      title: 'Program Manager',
      company: 'First Citizens Bank',
      location: 'Raleigh, NC / Remote',
      description: 'Program Manager position managing multiple related projects. Need 6+ years experience, PMP certification, and experience with program governance. Must have excellent communication and organizational skills. Full-time permanent position. Salary: $115k-$145k per year. Comprehensive benefits package with health insurance, retirement plan, paid vacation, and professional development opportunities.',
      requirements: ['Program Management', 'PMP', 'Governance', 'Communication', '6+ years experience', 'Strategic Planning'],
      postedDate: daysAgo(3),
      url: getLinkedInSearchUrl('Program Manager First Citizens Bank'),
      applyUrl: getLinkedInSearchUrl('Program Manager First Citizens Bank'),
      source: 'LinkedIn (Mock)'
    },
    {
      id: 'pm4',
      title: 'Agile Project Manager',
      company: 'PepsiCo',
      location: 'Purchase, NY / Remote',
      description: 'Agile Project Manager to lead Scrum teams in fast-paced environment. Must have CSM or SAFe certification, 4+ years Agile experience, and strong facilitation skills. Full-time role offering $105k-$135k annually. Benefits include comprehensive health coverage, 401k with company match, stock purchase plan, wellness programs, and generous PTO.',
      requirements: ['Agile', 'Scrum', 'CSM', 'SAFe', 'Facilitation', '4+ years experience'],
      postedDate: daysAgo(1),
      url: getLinkedInSearchUrl('Agile Project Manager PepsiCo'),
      applyUrl: getLinkedInSearchUrl('Agile Project Manager PepsiCo'),
      source: 'LinkedIn (Mock)'
    },
    // Software Engineering Roles
    {
      id: 'se1',
      title: 'Senior Software Engineer',
      company: 'Microsoft',
      location: 'Redmond, WA / Remote',
      description: 'We are looking for a Senior Software Engineer with 5+ years of experience in JavaScript, React, and Node.js. You will work on building scalable web applications and APIs. Full-time position with competitive compensation of $130k-$180k per annum. Excellent benefits including health insurance, 401k, stock options, employee assistance program, and flexible work arrangements.',
      requirements: ['JavaScript', 'React', 'Node.js', '5+ years experience', 'AWS'],
      postedDate: daysAgo(2),
      url: getLinkedInSearchUrl('Senior Software Engineer Microsoft'),
      applyUrl: getLinkedInSearchUrl('Senior Software Engineer Microsoft'),
      source: 'LinkedIn (Mock)'
    },
    {
      id: 'se2',
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      description: 'Join our team as a Full Stack Developer. We need someone with Python, Django, and React experience. Knowledge of Docker and Kubernetes is a plus.',
      requirements: ['Python', 'Django', 'React', 'Docker', 'Kubernetes'],
      postedDate: daysAgo(4),
      url: getLinkedInSearchUrl('Full Stack Developer'),
      applyUrl: getLinkedInSearchUrl('Full Stack Developer'),
      source: 'LinkedIn (Mock)'
    },
    {
      id: 'se3',
      title: 'Frontend Engineer',
      company: 'DesignCo',
      location: 'Remote',
      description: 'Looking for a Frontend Engineer skilled in React, TypeScript, and modern CSS frameworks. Experience with state management and API integration required.',
      requirements: ['React', 'TypeScript', 'CSS', 'REST API'],
      postedDate: daysAgo(3),
      url: getLinkedInSearchUrl('Frontend Engineer'),
      applyUrl: getLinkedInSearchUrl('Frontend Engineer'),
      source: 'LinkedIn (Mock)'
    },
    {
      id: 'se4',
      title: 'Backend Developer',
      company: 'DataSystems',
      location: 'Austin, TX',
      description: 'Backend Developer needed with strong experience in Java, Spring Boot, and microservices architecture. Database design and optimization skills required.',
      requirements: ['Java', 'Spring Boot', 'Microservices', 'SQL', 'Database Design'],
      postedDate: daysAgo(5),
      url: getLinkedInSearchUrl('Backend Developer'),
      applyUrl: getLinkedInSearchUrl('Backend Developer'),
      source: 'LinkedIn (Mock)'
    },
    {
      id: 'se5',
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Seattle, WA / Remote',
      description: 'DevOps Engineer position requiring expertise in AWS, Docker, Kubernetes, and CI/CD pipelines. Terraform and infrastructure as code experience preferred.',
      requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
      postedDate: daysAgo(6),
      url: getLinkedInSearchUrl('DevOps Engineer'),
      applyUrl: getLinkedInSearchUrl('DevOps Engineer'),
      source: 'LinkedIn (Mock)'
    },
    // Product Management
    {
      id: 'prod1',
      title: 'Product Manager',
      company: 'ProductCo',
      location: 'San Francisco, CA',
      description: 'Product Manager role for B2B SaaS platform. Need 5+ years product management experience, strong analytical skills, and experience with roadmap planning and stakeholder management.',
      requirements: ['Product Management', 'Roadmap', 'Stakeholder Management', 'Analytics', '5+ years experience'],
      postedDate: daysAgo(2),
      url: getLinkedInSearchUrl('Product Manager'),
      applyUrl: getLinkedInSearchUrl('Product Manager'),
      source: 'LinkedIn (Mock)'
    },
    {
      id: 'prod2',
      title: 'Senior Product Manager',
      company: 'TechStartup',
      location: 'Remote',
      description: 'Senior Product Manager to lead product strategy and execution. Requires 7+ years experience, MBA preferred, and experience with agile product development.',
      requirements: ['Product Management', 'Strategy', 'Agile', '7+ years experience', 'MBA preferred'],
      postedDate: daysAgo(4),
      url: getLinkedInSearchUrl('Senior Product Manager'),
      applyUrl: getLinkedInSearchUrl('Senior Product Manager'),
      source: 'LinkedIn (Mock)'
    },
    // Data Science
    {
      id: 'ds1',
      title: 'Data Scientist',
      company: 'DataAnalytics Inc',
      location: 'Boston, MA / Remote',
      description: 'Data Scientist position requiring Python, machine learning, and statistical analysis skills. Must have 3+ years experience with ML models and data visualization.',
      requirements: ['Python', 'Machine Learning', 'Statistics', 'Data Visualization', '3+ years experience'],
      postedDate: daysAgo(3),
      url: getLinkedInSearchUrl('Data Scientist'),
      applyUrl: getLinkedInSearchUrl('Data Scientist'),
      source: 'LinkedIn (Mock)'
    },
    {
      id: 'ds2',
      title: 'Senior Data Analyst',
      company: 'AnalyticsPro',
      location: 'Remote',
      description: 'Senior Data Analyst to analyze business metrics and create insights. Need SQL, Python, and experience with BI tools like Tableau or Power BI.',
      requirements: ['SQL', 'Python', 'Tableau', 'Power BI', 'Business Analytics', '4+ years experience'],
      postedDate: daysAgo(5),
      url: getLinkedInSearchUrl('Senior Data Analyst'),
      applyUrl: getLinkedInSearchUrl('Senior Data Analyst'),
      source: 'LinkedIn (Mock)'
    },
    // Design
    {
      id: 'design1',
      title: 'UX Designer',
      company: 'DesignStudio',
      location: 'Los Angeles, CA',
      description: 'UX Designer to create user-centered designs for web and mobile applications. Must have portfolio, 3+ years UX design experience, and proficiency in Figma.',
      requirements: ['UX Design', 'Figma', 'User Research', 'Prototyping', '3+ years experience'],
      postedDate: daysAgo(2),
      url: getLinkedInSearchUrl('UX Designer'),
      applyUrl: getLinkedInSearchUrl('UX Designer'),
      source: 'LinkedIn (Mock)'
    },
    // Business
    {
      id: 'biz1',
      title: 'Business Analyst',
      company: 'ConsultingGroup',
      location: 'Washington, DC',
      description: 'Business Analyst to analyze business processes and requirements. Need 4+ years experience, strong analytical skills, and experience with requirements gathering.',
      requirements: ['Business Analysis', 'Requirements Gathering', 'Process Analysis', '4+ years experience'],
      postedDate: daysAgo(6),
      url: getLinkedInSearchUrl('Business Analyst'),
      applyUrl: getLinkedInSearchUrl('Business Analyst'),
      source: 'LinkedIn (Mock)'
    },
    // Sales
    {
      id: 'sales1',
      title: 'Sales Manager',
      company: 'SalesForce Inc',
      location: 'Dallas, TX',
      description: 'Sales Manager to lead sales team and drive revenue growth. Requires 5+ years sales experience, proven track record, and leadership skills.',
      requirements: ['Sales', 'Leadership', 'Revenue Growth', '5+ years experience', 'CRM'],
      postedDate: daysAgo(4),
      url: getLinkedInSearchUrl('Sales Manager'),
      applyUrl: getLinkedInSearchUrl('Sales Manager'),
      source: 'LinkedIn (Mock)'
    },
    // Marketing
    {
      id: 'mkt1',
      title: 'Digital Marketing Manager',
      company: 'MarketingAgency',
      location: 'Remote',
      description: 'Digital Marketing Manager to develop and execute marketing campaigns. Need 4+ years digital marketing experience, SEO/SEM knowledge, and analytics skills.',
      requirements: ['Digital Marketing', 'SEO', 'SEM', 'Analytics', '4+ years experience'],
      postedDate: daysAgo(5),
      url: getLinkedInSearchUrl('Digital Marketing Manager'),
      applyUrl: getLinkedInSearchUrl('Digital Marketing Manager'),
      source: 'LinkedIn (Mock)'
    },
    // QA/Testing
    {
      id: 'qa1',
      title: 'QA Engineer',
      company: 'QualityTech',
      location: 'Remote',
      description: 'QA Engineer to test software applications and ensure quality. Requires 3+ years QA experience, automation testing skills, and knowledge of testing frameworks.',
      requirements: ['QA', 'Testing', 'Automation', 'Selenium', '3+ years experience'],
      postedDate: daysAgo(7),
      url: getLinkedInSearchUrl('QA Engineer'),
      applyUrl: getLinkedInSearchUrl('QA Engineer'),
      source: 'LinkedIn (Mock)'
    },
    // Security
    {
      id: 'sec1',
      title: 'Security Engineer',
      company: 'SecureTech',
      location: 'Remote',
      description: 'Security Engineer to protect systems and data. Need 4+ years security experience, knowledge of security frameworks, and penetration testing skills.',
      requirements: ['Security', 'Penetration Testing', 'Security Frameworks', '4+ years experience'],
      postedDate: daysAgo(6),
      url: getLinkedInSearchUrl('Security Engineer'),
      applyUrl: getLinkedInSearchUrl('Security Engineer'),
      source: 'LinkedIn (Mock)'
    },
    // More Project Management
    {
      id: 'pm5',
      title: 'IT Project Manager',
      company: 'IT Solutions',
      location: 'Atlanta, GA',
      description: 'IT Project Manager to manage technology implementation projects. Requires PMP, ITIL knowledge, and 5+ years managing IT projects.',
      requirements: ['Project Management', 'PMP', 'ITIL', 'IT Projects', '5+ years experience'],
      postedDate: daysAgo(1),
      url: getLinkedInSearchUrl('IT Project Manager'),
      applyUrl: getLinkedInSearchUrl('IT Project Manager'),
      source: 'LinkedIn (Mock)'
    },
    {
      id: 'pm6',
      title: 'Construction Project Manager',
      company: 'BuildCorp',
      location: 'Houston, TX',
      description: 'Construction Project Manager to oversee construction projects. Need construction management experience, safety certifications, and 6+ years experience.',
      requirements: ['Project Management', 'Construction', 'Safety Certifications', '6+ years experience'],
      postedDate: daysAgo(7),
      url: getLinkedInSearchUrl('Construction Project Manager'),
      applyUrl: getLinkedInSearchUrl('Construction Project Manager'),
      source: 'LinkedIn (Mock)'
    }
  ]
}

// Enhanced job search with role-based filtering - NOW SEARCHES REAL LINKEDIN JOBS
// This function runs dynamically each time - calculates last 7 days from current date
export async function searchJobs(resumeJobTitle?: string | null, resumeKeywords?: string[]): Promise<JobPosting[]> {
  // Build search query from resume
  let searchQuery = 'project manager' // Default
  if (resumeJobTitle) {
    searchQuery = resumeJobTitle
  } else if (resumeKeywords && resumeKeywords.length > 0) {
    // Use first keyword as search term
    searchQuery = resumeKeywords[0]
  }
  
  // Check if resume has PMP certification - if so, also search for PMP jobs
  const hasPMP = resumeKeywords?.some(kw => 
    kw.toLowerCase().includes('pmp') || 
    kw.toLowerCase().includes('project management professional')
  ) || false
  
  // If user has PMP, we'll search for both regular jobs AND PMP-specific jobs
  // We'll do two searches and combine results

  // Calculate date range dynamically - last 7 days from TODAY
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  console.log(`Searching for jobs posted after: ${sevenDaysAgo.toISOString()} (last 7 days)`)

  // Try to search LinkedIn for real jobs using Apify
  let allLinkedInJobs: JobPosting[] = []
  
  try {
    // Primary search with the main query
    console.log(`Searching LinkedIn via Apify for: "${searchQuery}"`)
    const primaryJobs = await searchLinkedInJobs(searchQuery, 'United States', undefined, 'F', 'r604800')
    allLinkedInJobs.push(...primaryJobs)
    
    // If user has PMP certification, also search specifically for PMP jobs
    if (hasPMP) {
      console.log(`🔍 User has PMP certification - also searching for PMP-specific jobs`)
      const pmpSearchQuery = `${searchQuery} PMP` // e.g., "project manager PMP"
      const pmpJobs = await searchLinkedInJobs(pmpSearchQuery, 'United States', undefined, 'F', 'r604800')
      allLinkedInJobs.push(...pmpJobs)
      console.log(`✅ Found ${pmpJobs.length} additional PMP jobs`)
    }
    
    // Remove duplicates based on job ID
    const uniqueJobs = Array.from(
      new Map(allLinkedInJobs.map(job => [job.id, job])).values()
    )
    
    if (uniqueJobs.length > 0) {
      console.log(`✅ Found ${uniqueJobs.length} unique real jobs from LinkedIn via Apify`)
      
      // Filter jobs to ensure they're within the last 7 days (dynamic date check)
      const dateFilteredJobs = uniqueJobs.filter(job => {
        const jobDate = new Date(job.postedDate)
        return jobDate >= sevenDaysAgo
      })
      
      console.log(`📅 Filtered to ${dateFilteredJobs.length} jobs posted in last 7 days (from ${sevenDaysAgo.toLocaleDateString()} to ${now.toLocaleDateString()})`)
      
      // Apply additional filters: full-time, no staffing, salary >$100k, benefits, end-clients only
      const filteredJobs = filterJobs(dateFilteredJobs)
      
      // Return filtered jobs - let the matching algorithm score them based on keywords
      return filteredJobs
    }
  } catch (error) {
    console.error('❌ LinkedIn search via Apify failed:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    console.log('Falling back to mock data...')
  }

  // Fallback to mock data if LinkedIn search fails
  console.log('⚠️ Using fallback mock data (Apify search unavailable)')
  const allJobs = getAllJobs()
  
  // Calculate last 7 days dynamically from current date (reuse the same date range)
  const nowTimestamp = Date.now()
  const sevenDaysAgoTimestamp = nowTimestamp - 7 * 24 * 60 * 60 * 1000
  const recentJobs = allJobs.filter(job => {
    const jobDate = new Date(job.postedDate).getTime()
    return jobDate >= sevenDaysAgoTimestamp
  })
  
  console.log(`📅 Using ${recentJobs.length} mock jobs from last 7 days (from ${new Date(sevenDaysAgoTimestamp).toLocaleDateString()} to ${new Date(nowTimestamp).toLocaleDateString()})`)
  
  // Apply filters to mock data as well
  const filteredMockJobs = filterJobs(recentJobs)
  
  return filteredMockJobs.slice(0, 25)
}

// Real job search function (commented out - requires API keys)
export async function searchJobsReal(query: string, location: string): Promise<JobPosting[]> {
  // Example: Indeed API integration
  // const indeedApiKey = process.env.INDEED_API_KEY
  // const response = await axios.get('https://api.indeed.com/ads/apisearch', {
  //   params: {
  //     publisher: indeedApiKey,
  //     q: query,
  //     l: location,
  //     sort: 'date',
  //     radius: 25,
  //     limit: 25,
  //     format: 'json'
  //   }
  // })
  // return response.data.results.map(...)
  
  // For now, return empty array
  return []
}


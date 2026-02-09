import { JobPosting } from '@/types'
import { searchLinkedInJobs } from './linkedinScraper'
import { searchGoogleJobs } from './googleScraper'
import { filterJobs } from './jobFilters'

// Enhanced job search - SEARCHES FOR PROJECT MANAGER JOBS
// This function:
// 1. First fetches ALL Project Manager jobs
// 2. Then filters them based on criteria (full-time, no staffing, salary, benefits, end-clients)
// 3. Returns jobs ready to be scored against the resume
export async function searchJobs(
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
export async function searchJobs(
  resumeJobTitle?: string | null, 
  resumeKeywords?: string[],
  dateRangeDays: string = '7' // Number of days to search (1, 7, 14, 30)
): Promise<{ 
  jobs: JobPosting[], 
  totalJobs: number, 
  dateRange: { from: string, to: string, fromFormatted: string, toFormatted: string }, 
  filtersApplied: string[] 
}> {
  // Strategy: First get ALL Project Manager jobs, then filter for PMP requirement
  // This ensures we don't miss jobs due to search query limitations
  // Reduced queries to speed up search - focus on most relevant
  const projectManagerQueries = [
    'project manager',  // Primary search - get all PM jobs first
    'program manager'   // Also search program manager
    // Removed PMP-specific queries to reduce search time - PMP requirement will be checked during scoring
  ]
  
  // Also include the resume job title if it's project manager related
  if (resumeJobTitle && (
    resumeJobTitle.toLowerCase().includes('project') || 
    resumeJobTitle.toLowerCase().includes('program')
  )) {
    projectManagerQueries.unshift(resumeJobTitle) // Add to front
  }

  // Calculate date range dynamically based on selected days
  const days = parseInt(dateRangeDays) || 7
  const now = new Date()
  const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  console.log(`🔍 STEP 1: Searching for Project Manager jobs`)
  console.log(`📅 Date range: ${daysAgo.toISOString()} to ${now.toISOString()} (last ${days} days)`)
  
  // Debug: Check environment variables
  console.log(`🔍 DEBUG: Environment check:`)
  console.log(`   APIFY_API_TOKEN exists: ${!!process.env.APIFY_API_TOKEN}`)
  console.log(`   APIFY_API_TOKEN length: ${process.env.APIFY_API_TOKEN?.length || 0}`)
  console.log(`   APIFY_LINKEDIN_ACTOR_ID: ${process.env.APIFY_LINKEDIN_ACTOR_ID || 'NOT_SET'}`)

  // Search MULTIPLE job sources with MULTIPLE queries to find PMP-required Project Manager jobs
  let allJobs: JobPosting[] = []
  
  console.log(`📊 Searching MULTIPLE job sources with ${projectManagerQueries.length} queries`)
  console.log('Sources: LinkedIn, Google Jobs')
  console.log(`Queries: ${projectManagerQueries.join(', ')}`)
  
  // Search all sources with all queries in parallel
  const searchPromises: Promise<JobPosting[]>[] = []
  
  // For each job source, search with all PMP queries
  for (const query of projectManagerQueries) {
    // LinkedIn searches
    searchPromises.push(
      (async () => {
        try {
          console.log(`\n🔍 Starting LinkedIn search for: "${query}"`)
          // Convert days to LinkedIn time range format
          // r86400 = 1 day, r604800 = 7 days, r2592000 = 30 days
          let timeRange = 'r604800' // default 7 days
          if (days === 1) timeRange = 'r86400'
          else if (days === 7) timeRange = 'r604800'
          else if (days === 14) timeRange = 'r1209600'
          else if (days === 30) timeRange = 'r2592000'
          
          const jobs = await searchLinkedInJobs(query, 'United States', undefined, 'F', timeRange)
          console.log(`✅ LinkedIn "${query}": Found ${jobs.length} jobs`)
          return jobs
        } catch (error) {
          console.error(`❌ LinkedIn search failed for "${query}":`, error)
          console.error(`   Error details:`, error instanceof Error ? error.message : String(error))
          if (error instanceof Error && error.stack) {
            console.error(`   Stack:`, error.stack.split('\n').slice(0, 5).join('\n'))
          }
          return []
        }
      })()
    )
    
    // Google Jobs searches
    searchPromises.push(
      (async () => {
        try {
          console.log(`\n🔍 Starting Google Jobs search for: "${query}"`)
          const jobs = await searchGoogleJobs(query, 'United States', dateRangeDays)
          console.log(`✅ Google Jobs "${query}": Found ${jobs.length} jobs`)
          return jobs
        } catch (error) {
          console.error(`❌ Google Jobs search failed for "${query}":`, error)
          console.error(`   Error details:`, error instanceof Error ? error.message : String(error))
          return []
        }
      })()
    )
  }
  
  try {
    // Wait for all searches to complete
    console.log(`⏳ Waiting for ${searchPromises.length} search queries to complete...`)
    const results = await Promise.all(searchPromises)
    
    // Combine all results
    results.forEach((jobs) => {
      allJobs.push(...jobs)
    })
    
    console.log(`📊 STEP 2: Total jobs fetched from all sources: ${allJobs.length}`)
    
    if (allJobs.length === 0) {
      console.error('❌ CRITICAL: No jobs returned from ANY source!')
      console.error('   This means Apify is not returning any data.')
      console.error('   Possible causes:')
      console.error('   1. Apify monthly usage limit exceeded (check error messages above)')
      console.error('   2. Apify actors are not working')
      console.error('   3. LinkedIn/Google Jobs are blocking scrapers')
      console.error('   4. Actor input parameters are wrong')
      console.error('   5. Network/firewall issues')
      console.error('   Check the Apify run URLs in the logs above for details')
      console.error('   💡 If you see "Monthly usage hard limit exceeded", upgrade your Apify plan')
      return {
        jobs: [],
        totalJobs: 0,
        dateRange: {
          from: daysAgo.toISOString(),
          to: now.toISOString(),
          fromFormatted: daysAgo.toLocaleDateString(),
          toFormatted: now.toLocaleDateString()
        },
        filtersApplied: [
          'Full-time',
          'No Staffing Companies',
          'Salary >$100k (or not specified)',
          'Benefits Mentioned',
          'End-Client Companies Only',
          `Posted in last ${days} days`
        ]
      }
    }
    
    // Remove duplicates based on job title + company (more reliable than ID)
    const uniqueJobs = Array.from(
      new Map(
        allJobs.map(job => [`${job.title.toLowerCase()}-${job.company.toLowerCase()}`, job])
      ).values()
    )
    
    console.log(`📊 After deduplication: ${uniqueJobs.length} unique jobs`)
    
    // Log sample jobs for debugging
    if (uniqueJobs.length > 0) {
      console.log(`📋 Sample jobs found:`)
      uniqueJobs.slice(0, 5).forEach((job, idx) => {
        console.log(`   ${idx + 1}. ${job.title} at ${job.company} (${job.source})`)
      })
    }
    
    if (uniqueJobs.length > 0) {
      // STEP 3: Filter to Project Manager roles (don't require PMP yet - that will be part of scoring)
      console.log(`\n🔍 STEP 3: Filtering for Project Manager roles...`)
      console.log(`   Starting with ${uniqueJobs.length} unique jobs`)
      
      // Filter to Project Manager roles - be inclusive
      const pmJobs = uniqueJobs.filter(job => {
        const titleLower = job.title.toLowerCase()
        const descLower = (job.description || '').toLowerCase()
        return titleLower.includes('project manager') || 
               titleLower.includes('program manager') ||
               titleLower.includes('project management') ||
               titleLower.includes('program management') ||
               titleLower.includes('pmo') ||
               titleLower.includes('project lead') ||
               titleLower.includes('project coordinator') ||
               titleLower.includes('project director') ||
               titleLower.includes('project specialist') ||
               titleLower.includes('project analyst') ||
               // Also check description for project management keywords
               (descLower.includes('project management') && (descLower.includes('manager') || descLower.includes('lead')))
      })
      console.log(`   ✅ Found ${pmJobs.length} Project Manager roles`)
      
      if (pmJobs.length === 0) {
        console.log(`⚠️ No Project Manager jobs found in titles.`)
        console.log(`   This might mean:`)
        console.log(`   1. Apify returned jobs but titles don't match`)
        console.log(`   2. Jobs are in different format`)
        console.log(`   Sample job titles found:`, uniqueJobs.slice(0, 5).map(j => j.title))
        console.log(`   Returning all unique jobs (will filter during scoring)...`)
        // Return all jobs - let the scoring filter them
        // But first apply basic filters
        const dateFiltered = uniqueJobs.filter(job => {
          const jobDate = new Date(job.postedDate)
          return jobDate >= daysAgo
        })
        const basicFiltered = filterJobs(dateFiltered)
        return {
          jobs: basicFiltered,
          totalJobs: basicFiltered.length,
          dateRange: {
            from: daysAgo.toISOString(),
            to: now.toISOString(),
            fromFormatted: daysAgo.toLocaleDateString(),
            toFormatted: now.toLocaleDateString()
          },
          filtersApplied: [
            'Full-time',
            'No Staffing Companies',
            'Salary >$100k (or not specified)',
            'Benefits Mentioned',
            'End-Client Companies Only',
            `Posted in last ${days} days`
          ]
        }
      }
      
      // STEP 4: Filter jobs to ensure they're within the selected date range
      const dateFilteredJobs = pmJobs.filter(job => {
        const jobDate = new Date(job.postedDate)
        return jobDate >= daysAgo
      })
      
      console.log(`📅 STEP 4: Filtered to ${dateFilteredJobs.length} jobs posted in last ${days} days (from ${uniqueJobs.length} total)`)
      
      // STEP 5: Apply additional filters: full-time, no staffing, salary >$100k, benefits, end-clients only
      console.log(`\n🔍 STEP 5: Applying additional filters (full-time, no staffing, salary, benefits, end-clients)...`)
      const filteredJobs = filterJobs(dateFilteredJobs)
      
      console.log(`\n✅ FINAL RESULT: ${filteredJobs.length} Project Manager jobs that:`)
      console.log(`   ✓ Are full-time`)
      console.log(`   ✓ Are from end-client companies (not staffing)`)
      console.log(`   ✓ Have salary >$100k or not specified`)
      console.log(`   ✓ Mention benefits`)
      console.log(`   ✓ Posted in last ${days} days`)
      console.log(`\n📝 These jobs are ready to be scored against the uploaded resume`)
      console.log(`   (PMP requirement will be checked during scoring)`)
      
      // Return filtered jobs - these will be scored against the resume
      // PMP requirement will be part of the scoring, not a hard filter
      return {
        jobs: filteredJobs,
        totalJobs: filteredJobs.length,
        dateRange: {
          from: daysAgo.toISOString(),
          to: now.toISOString(),
          fromFormatted: daysAgo.toLocaleDateString(),
          toFormatted: now.toLocaleDateString()
        },
        filtersApplied: [
          'Full-time',
          'No Staffing Companies',
          'Salary >$100k (or not specified)',
          'Benefits Mentioned',
          'End-Client Companies Only',
          `Posted in last ${days} days`
        ]
      }
    }
  } catch (error) {
    console.error('❌ Multi-source job search failed:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
  }

  // NO MOCK DATA - Return empty array if all searches fail
  // User wants only real scraped jobs with legitimate URLs
  console.log('⚠️ No jobs found from any job source (LinkedIn, Google Jobs).')
  console.log('')
  console.log('🔍 DEBUGGING INFO:')
  console.log('  1. Check APIFY_API_TOKEN is set in .env')
  console.log('  2. Check APIFY_LINKEDIN_ACTOR_ID is correct')
  console.log('  3. Verify Apify actors are accessible at https://console.apify.com')
  console.log('  4. Check server logs above for Apify run IDs and errors')
  console.log('  5. Common issues:')
  console.log('     - Apify actor timeout (increase timeout)')
  console.log('     - LinkedIn blocking scraper (try different actor)')
  console.log('     - Wrong actor input parameters')
  console.log('     - Network/firewall issues')
  console.log('')
  console.log('💡 TIP: Check the Apify run URLs in the logs above to see detailed error messages')
  
  return {
    jobs: [],
    totalJobs: 0,
    dateRange: {
      from: daysAgo.toISOString(),
      to: now.toISOString(),
      fromFormatted: daysAgo.toLocaleDateString(),
      toFormatted: now.toLocaleDateString()
    },
    filtersApplied: []
  }
}



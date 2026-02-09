import { JobPosting } from '@/types'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { searchLinkedInJobs } from './linkedinScraper'

// Comprehensive job database with diverse roles
function getAllJobs(): JobPosting[] {
  const now = Date.now()
  const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString()
  const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString()

  return [
    // Project Management Roles
    {
      id: 'pm1',
      title: 'Senior Project Manager',
      company: 'Global Solutions Inc',
      location: 'New York, NY / Remote',
      description: 'We are seeking an experienced Senior Project Manager with 7+ years of experience managing complex software projects. Must have PMP certification, Agile/Scrum experience, and strong leadership skills. You will lead cross-functional teams and manage project timelines, budgets, and stakeholder communication.',
      requirements: ['Project Management', 'PMP', 'Agile', 'Scrum', 'Leadership', '7+ years experience', 'Stakeholder Management'],
      postedDate: daysAgo(1),
      url: 'https://linkedin.com/jobs/view/pm1',
      applyUrl: 'https://linkedin.com/jobs/view/pm1/apply',
      source: 'LinkedIn'
    },
    {
      id: 'pm2',
      title: 'Technical Project Manager',
      company: 'TechVentures',
      location: 'San Francisco, CA',
      description: 'Technical Project Manager needed to oversee software development projects. Requires 5+ years managing technical teams, experience with JIRA, Confluence, and Agile methodologies. Strong technical background preferred.',
      requirements: ['Project Management', 'Agile', 'JIRA', 'Confluence', 'Technical Leadership', '5+ years experience'],
      postedDate: daysAgo(2),
      url: 'https://indeed.com/viewjob?jk=pm2',
      applyUrl: 'https://indeed.com/viewjob?jk=pm2/apply',
      source: 'Indeed'
    },
    {
      id: 'pm3',
      title: 'Program Manager',
      company: 'Enterprise Corp',
      location: 'Chicago, IL / Remote',
      description: 'Program Manager position managing multiple related projects. Need 6+ years experience, PMP certification, and experience with program governance. Must have excellent communication and organizational skills.',
      requirements: ['Program Management', 'PMP', 'Governance', 'Communication', '6+ years experience', 'Strategic Planning'],
      postedDate: daysAgo(3),
      url: 'https://glassdoor.com/job-listing/pm3',
      applyUrl: 'https://glassdoor.com/job-listing/pm3/apply',
      source: 'Glassdoor'
    },
    {
      id: 'pm4',
      title: 'Agile Project Manager',
      company: 'InnovateTech',
      location: 'Remote',
      description: 'Agile Project Manager to lead Scrum teams in fast-paced environment. Must have CSM or SAFe certification, 4+ years Agile experience, and strong facilitation skills.',
      requirements: ['Agile', 'Scrum', 'CSM', 'SAFe', 'Facilitation', '4+ years experience'],
      postedDate: daysAgo(1),
      url: 'https://innovatetech.com/careers/pm4',
      applyUrl: 'https://innovatetech.com/careers/pm4/apply',
      source: 'Company Website'
    },
    // Software Engineering Roles
    {
      id: 'se1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA / Remote',
      description: 'We are looking for a Senior Software Engineer with 5+ years of experience in JavaScript, React, and Node.js. You will work on building scalable web applications and APIs.',
      requirements: ['JavaScript', 'React', 'Node.js', '5+ years experience', 'AWS'],
      postedDate: daysAgo(2),
      url: 'https://linkedin.com/jobs/view/se1',
      applyUrl: 'https://linkedin.com/jobs/view/se1/apply',
      source: 'LinkedIn'
    },
    {
      id: 'se2',
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      description: 'Join our team as a Full Stack Developer. We need someone with Python, Django, and React experience. Knowledge of Docker and Kubernetes is a plus.',
      requirements: ['Python', 'Django', 'React', 'Docker', 'Kubernetes'],
      postedDate: daysAgo(4),
      url: 'https://indeed.com/viewjob?jk=se2',
      applyUrl: 'https://indeed.com/viewjob?jk=se2/apply',
      source: 'Indeed'
    },
    {
      id: 'se3',
      title: 'Frontend Engineer',
      company: 'DesignCo',
      location: 'Remote',
      description: 'Looking for a Frontend Engineer skilled in React, TypeScript, and modern CSS frameworks. Experience with state management and API integration required.',
      requirements: ['React', 'TypeScript', 'CSS', 'REST API'],
      postedDate: daysAgo(3),
      url: 'https://designco.com/careers/se3',
      applyUrl: 'https://designco.com/careers/se3/apply',
      source: 'Company Website'
    },
    {
      id: 'se4',
      title: 'Backend Developer',
      company: 'DataSystems',
      location: 'Austin, TX',
      description: 'Backend Developer needed with strong experience in Java, Spring Boot, and microservices architecture. Database design and optimization skills required.',
      requirements: ['Java', 'Spring Boot', 'Microservices', 'SQL', 'Database Design'],
      postedDate: daysAgo(5),
      url: 'https://glassdoor.com/job-listing/se4',
      applyUrl: 'https://glassdoor.com/job-listing/se4/apply',
      source: 'Glassdoor'
    },
    {
      id: 'se5',
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Seattle, WA / Remote',
      description: 'DevOps Engineer position requiring expertise in AWS, Docker, Kubernetes, and CI/CD pipelines. Terraform and infrastructure as code experience preferred.',
      requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
      postedDate: daysAgo(6),
      url: 'https://linkedin.com/jobs/view/se5',
      applyUrl: 'https://linkedin.com/jobs/view/se5/apply',
      source: 'LinkedIn'
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
      url: 'https://indeed.com/viewjob?jk=prod1',
      applyUrl: 'https://indeed.com/viewjob?jk=prod1/apply',
      source: 'Indeed'
    },
    {
      id: 'prod2',
      title: 'Senior Product Manager',
      company: 'TechStartup',
      location: 'Remote',
      description: 'Senior Product Manager to lead product strategy and execution. Requires 7+ years experience, MBA preferred, and experience with agile product development.',
      requirements: ['Product Management', 'Strategy', 'Agile', '7+ years experience', 'MBA preferred'],
      postedDate: daysAgo(4),
      url: 'https://linkedin.com/jobs/view/prod2',
      applyUrl: 'https://linkedin.com/jobs/view/prod2/apply',
      source: 'LinkedIn'
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
      url: 'https://glassdoor.com/job-listing/ds1',
      applyUrl: 'https://glassdoor.com/job-listing/ds1/apply',
      source: 'Glassdoor'
    },
    {
      id: 'ds2',
      title: 'Senior Data Analyst',
      company: 'AnalyticsPro',
      location: 'Remote',
      description: 'Senior Data Analyst to analyze business metrics and create insights. Need SQL, Python, and experience with BI tools like Tableau or Power BI.',
      requirements: ['SQL', 'Python', 'Tableau', 'Power BI', 'Business Analytics', '4+ years experience'],
      postedDate: daysAgo(5),
      url: 'https://indeed.com/viewjob?jk=ds2',
      applyUrl: 'https://indeed.com/viewjob?jk=ds2/apply',
      source: 'Indeed'
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
      url: 'https://designstudio.com/careers/design1',
      applyUrl: 'https://designstudio.com/careers/design1/apply',
      source: 'Company Website'
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
      url: 'https://linkedin.com/jobs/view/biz1',
      applyUrl: 'https://linkedin.com/jobs/view/biz1/apply',
      source: 'LinkedIn'
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
      url: 'https://indeed.com/viewjob?jk=sales1',
      applyUrl: 'https://indeed.com/viewjob?jk=sales1/apply',
      source: 'Indeed'
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
      url: 'https://glassdoor.com/job-listing/mkt1',
      applyUrl: 'https://glassdoor.com/job-listing/mkt1/apply',
      source: 'Glassdoor'
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
      url: 'https://linkedin.com/jobs/view/qa1',
      applyUrl: 'https://linkedin.com/jobs/view/qa1/apply',
      source: 'LinkedIn'
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
      url: 'https://indeed.com/viewjob?jk=sec1',
      applyUrl: 'https://indeed.com/viewjob?jk=sec1/apply',
      source: 'Indeed'
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
      url: 'https://glassdoor.com/job-listing/pm5',
      applyUrl: 'https://glassdoor.com/job-listing/pm5/apply',
      source: 'Glassdoor'
    },
    {
      id: 'pm6',
      title: 'Construction Project Manager',
      company: 'BuildCorp',
      location: 'Houston, TX',
      description: 'Construction Project Manager to oversee construction projects. Need construction management experience, safety certifications, and 6+ years experience.',
      requirements: ['Project Management', 'Construction', 'Safety Certifications', '6+ years experience'],
      postedDate: daysAgo(7),
      url: 'https://buildcorp.com/careers/pm6',
      applyUrl: 'https://buildcorp.com/careers/pm6/apply',
      source: 'Company Website'
    }
  ]
}

// Enhanced job search with role-based filtering - NOW SEARCHES REAL LINKEDIN JOBS
export async function searchJobs(resumeJobTitle?: string | null, resumeKeywords?: string[]): Promise<JobPosting[]> {
  // Build search query from resume
  let searchQuery = 'project manager' // Default
  if (resumeJobTitle) {
    searchQuery = resumeJobTitle
  } else if (resumeKeywords && resumeKeywords.length > 0) {
    // Use first keyword as search term
    searchQuery = resumeKeywords[0]
  }

  // Try to search LinkedIn for real jobs using Apify
  try {
    console.log(`Searching LinkedIn via Apify for: "${searchQuery}"`)
    const linkedInJobs = await searchLinkedInJobs(searchQuery, 'United States', undefined, 'F', 'r604800')
    
    if (linkedInJobs.length > 0) {
      console.log(`✅ Found ${linkedInJobs.length} real jobs from LinkedIn via Apify`)
      
      // Return ALL jobs - let the matching algorithm score them based on keywords
      // This ensures the user sees all available jobs and gets accurate keyword-based scores
      return linkedInJobs
    }
  } catch (error) {
    console.error('❌ LinkedIn search via Apify failed:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    console.log('Falling back to mock data...')
  }

  // Fallback to mock data if LinkedIn search fails
  console.log('⚠️ Using fallback mock data (Apify search unavailable)')
  const allJobs = getAllJobs()
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentJobs = allJobs.filter(job => new Date(job.postedDate).getTime() >= oneWeekAgo)
  
  return recentJobs.slice(0, 25)
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


import { JobPosting } from '@/types'
import axios from 'axios'
import * as cheerio from 'cheerio'

// Mock job search - In production, you'd integrate with real job APIs
export async function searchJobs(query: string = 'software engineer', location: string = 'remote'): Promise<JobPosting[]> {
  // For demo purposes, we'll return mock jobs
  // In production, integrate with Indeed, LinkedIn, Glassdoor APIs, or scrape
  const mockJobs: JobPosting[] = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA / Remote',
      description: 'We are looking for a Senior Software Engineer with 5+ years of experience in JavaScript, React, and Node.js. You will work on building scalable web applications and APIs.',
      requirements: ['JavaScript', 'React', 'Node.js', '5+ years experience', 'AWS'],
      postedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      url: 'https://example.com/job/1',
      applyUrl: 'https://example.com/job/1/apply'
    },
    {
      id: '2',
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      description: 'Join our team as a Full Stack Developer. We need someone with Python, Django, and React experience. Knowledge of Docker and Kubernetes is a plus.',
      requirements: ['Python', 'Django', 'React', 'Docker', 'Kubernetes'],
      postedDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      url: 'https://example.com/job/2',
      applyUrl: 'https://example.com/job/2/apply'
    },
    {
      id: '3',
      title: 'Frontend Engineer',
      company: 'DesignCo',
      location: 'Remote',
      description: 'Looking for a Frontend Engineer skilled in React, TypeScript, and modern CSS frameworks. Experience with state management and API integration required.',
      requirements: ['React', 'TypeScript', 'CSS', 'REST API'],
      postedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      url: 'https://example.com/job/3',
      applyUrl: 'https://example.com/job/3/apply'
    },
    {
      id: '4',
      title: 'Backend Developer',
      company: 'DataSystems',
      location: 'Austin, TX',
      description: 'Backend Developer needed with strong experience in Java, Spring Boot, and microservices architecture. Database design and optimization skills required.',
      requirements: ['Java', 'Spring Boot', 'Microservices', 'SQL', 'Database Design'],
      postedDate: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
      url: 'https://example.com/job/4',
      applyUrl: 'https://example.com/job/4/apply'
    },
    {
      id: '5',
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Seattle, WA / Remote',
      description: 'DevOps Engineer position requiring expertise in AWS, Docker, Kubernetes, and CI/CD pipelines. Terraform and infrastructure as code experience preferred.',
      requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
      postedDate: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
      url: 'https://example.com/job/5',
      applyUrl: 'https://example.com/job/5/apply'
    }
  ]

  // Filter jobs posted within last 24 hours
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000
  return mockJobs.filter(job => new Date(job.postedDate).getTime() >= twentyFourHoursAgo)
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


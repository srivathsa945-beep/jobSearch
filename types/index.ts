export interface ResumeData {
  text: string
  skills: string[]
  experience: string[]
  education: string[]
  jobTitle?: string | null
  jobKeywords?: string[]
  name?: string
  email?: string
  phone?: string
}

export interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  description: string
  requirements: string[]
  postedDate: string
  url: string
  applyUrl?: string
  source: string // e.g., "LinkedIn", "Indeed", "Glassdoor", "Company Website", etc.
}

export interface JobMatch {
  job: JobPosting
  score: number
  recommendation: 'apply' | 'skip'
  reasons: string[]
  matchedSkills: string[]
  missingSkills: string[]
}


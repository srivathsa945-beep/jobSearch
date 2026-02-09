export interface ResumeData {
  text: string
  skills: string[]
  experience: string[]
  education: string[]
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
}

export interface JobMatch {
  job: JobPosting
  score: number
  recommendation: 'apply' | 'skip'
  reasons: string[]
  matchedSkills: string[]
  missingSkills: string[]
}


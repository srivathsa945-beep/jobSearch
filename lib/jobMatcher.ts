import { ResumeData, JobPosting, JobMatch } from '@/types'

export function calculateMatchScore(resume: ResumeData, job: JobPosting): JobMatch {
  const resumeText = resume.text.toLowerCase()
  const jobText = (job.description + ' ' + job.requirements.join(' ')).toLowerCase()
  
  // Extract keywords from job posting
  const jobKeywords = extractKeywords(jobText)
  const resumeKeywords = extractKeywords(resumeText)
  
  // Calculate skill matches
  const matchedSkills: string[] = []
  const missingSkills: string[] = []
  
  resume.skills.forEach(skill => {
    if (jobKeywords.some(kw => kw.includes(skill.toLowerCase()) || skill.toLowerCase().includes(kw))) {
      matchedSkills.push(skill)
    }
  })
  
  jobKeywords.forEach(keyword => {
    if (!resumeKeywords.some(rk => rk.includes(keyword) || keyword.includes(rk))) {
      if (keyword.length > 3) { // Filter out very short keywords
        missingSkills.push(keyword)
      }
    }
  })
  
  // Calculate score based on multiple factors
  let score = 0
  
  // Skill match (40% weight)
  const skillMatchRatio = matchedSkills.length / Math.max(jobKeywords.length, 1)
  score += skillMatchRatio * 40
  
  // Experience match (20% weight)
  const experienceMatch = checkExperienceMatch(resume, job)
  score += experienceMatch * 20
  
  // Education match (10% weight)
  const educationMatch = checkEducationMatch(resume, job)
  score += educationMatch * 10
  
  // Keyword overlap (30% weight)
  const keywordOverlap = calculateKeywordOverlap(resumeKeywords, jobKeywords)
  score += keywordOverlap * 30
  
  score = Math.min(100, Math.max(0, Math.round(score)))
  
  // Generate recommendation
  const recommendation: 'apply' | 'skip' = score >= 70 ? 'apply' : 'skip'
  
  // Generate reasons
  const reasons: string[] = []
  if (score >= 80) {
    reasons.push('Excellent skill match with job requirements')
  } else if (score >= 70) {
    reasons.push('Good skill alignment with most requirements')
  } else {
    reasons.push('Limited skill match with job requirements')
  }
  
  if (matchedSkills.length > 0) {
    reasons.push(`Matched ${matchedSkills.length} key skills`)
  }
  
  if (missingSkills.length > 0 && missingSkills.length <= 5) {
    reasons.push(`Missing ${missingSkills.length} important skills`)
  } else if (missingSkills.length > 5) {
    reasons.push(`Missing many required skills`)
  }
  
  if (experienceMatch > 0.8) {
    reasons.push('Experience level matches job requirements')
  }
  
  return {
    job,
    score,
    recommendation,
    reasons,
    matchedSkills: matchedSkills.slice(0, 10), // Limit to top 10
    missingSkills: missingSkills.slice(0, 10) // Limit to top 10
  }
}

function extractKeywords(text: string): string[] {
  // Common tech keywords
  const techKeywords = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
    'react', 'vue', 'angular', 'node.js', 'express', 'django', 'flask',
    'sql', 'mongodb', 'postgresql', 'mysql', 'redis',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd',
    'git', 'github', 'gitlab', 'agile', 'scrum', 'machine learning',
    'data science', 'tensorflow', 'pytorch', 'rest api', 'graphql',
    'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'linux', 'unix', 'windows', 'macos',
    'project management', 'leadership', 'communication', 'teamwork',
    'microservices', 'api', 'backend', 'frontend', 'full stack',
    'devops', 'cloud', 'serverless', 'lambda', 'terraform'
  ]
  
  const found: string[] = []
  const lowerText = text.toLowerCase()
  
  techKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      found.push(keyword)
    }
  })
  
  // Extract years of experience
  const expMatch = text.match(/(\d+)\+?\s*(years?|yrs?)/gi)
  if (expMatch) {
    found.push(...expMatch)
  }
  
  return [...new Set(found)] // Remove duplicates
}

function checkExperienceMatch(resume: ResumeData, job: JobPosting): number {
  const jobText = job.description.toLowerCase()
  const expMatch = jobText.match(/(\d+)\+?\s*(years?|yrs?)/i)
  
  if (!expMatch) return 0.5 // Neutral if no experience requirement specified
  
  const requiredYears = parseInt(expMatch[1])
  const resumeExp = resume.experience.join(' ').toLowerCase()
  const resumeExpMatch = resumeExp.match(/(\d+)\+?\s*(years?|yrs?)/i)
  
  if (!resumeExpMatch) return 0.3 // Lower score if no experience mentioned in resume
  
  const resumeYears = parseInt(resumeExpMatch[1])
  
  if (resumeYears >= requiredYears) return 1.0
  if (resumeYears >= requiredYears * 0.8) return 0.8
  if (resumeYears >= requiredYears * 0.6) return 0.6
  return 0.3
}

function checkEducationMatch(resume: ResumeData, job: JobPosting): number {
  const jobText = job.description.toLowerCase()
  const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'bs', 'ms', 'mba']
  
  const jobHasEducation = educationKeywords.some(kw => jobText.includes(kw))
  if (!jobHasEducation) return 1.0 // No education requirement
  
  const resumeHasEducation = resume.education.length > 0
  return resumeHasEducation ? 1.0 : 0.5
}

function calculateKeywordOverlap(resumeKeywords: string[], jobKeywords: string[]): number {
  if (jobKeywords.length === 0) return 1.0
  
  const matched = jobKeywords.filter(jk => 
    resumeKeywords.some(rk => rk.includes(jk) || jk.includes(rk))
  ).length
  
  return matched / jobKeywords.length
}


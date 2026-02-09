import { ResumeData, JobPosting, JobMatch } from '@/types'
import { PROJECT_MANAGEMENT_KEYWORDS, isProjectManagementKeyword, isSecurityKeyword } from './securityKeywords'
import { isProjectManagerRole } from './pmpFilter'

export function calculateMatchScore(resume: ResumeData, job: JobPosting): JobMatch {
  const resumeText = resume.text.toLowerCase()
  const jobText = (job.description + ' ' + job.requirements.join(' ') + ' ' + job.title).toLowerCase()
  
  // Extract ALL keywords from job posting (comprehensive extraction)
  let jobKeywords = extractAllKeywords(jobText, job)
  let resumeKeywords = extractAllKeywords(resumeText, null)
  
  // Prioritize project management keywords - add them to the top of the keyword lists
  const jobPMKeywords = jobKeywords.filter(kw => isProjectManagementKeyword(kw))
  const resumePMKeywords = resumeKeywords.filter(kw => isProjectManagementKeyword(kw))
  
  // Reorder: project management keywords first, then others
  jobKeywords = [...jobPMKeywords, ...jobKeywords.filter(kw => !isProjectManagementKeyword(kw))]
  resumeKeywords = [...resumePMKeywords, ...resumeKeywords.filter(kw => !isProjectManagementKeyword(kw))]
  
  // Calculate keyword matches - THIS IS THE PRIMARY SCORING METHOD
  // Project management keywords get higher weight
  const { matchedKeywords, missingKeywords, matchDetails } = calculateKeywordMatches(resumeKeywords, jobKeywords, jobPMKeywords)
  
  // Calculate match score based on keywords - more lenient approach
  // If job has many keywords, we don't need to match all of them
  const keywordMatchRatio = jobKeywords.length > 0 
    ? matchedKeywords.length / jobKeywords.length 
    : 0
  
  // More lenient scoring: if we match at least some keywords, give partial credit
  // Also consider absolute number of matches, not just ratio
  // Give bonus points for having ANY matches at all
  const absoluteMatchBonus = Math.min(30, matchedKeywords.length * 3) // Up to 30 points for having matches
  const ratioScore = keywordMatchRatio * 50 // Reduced from 80 to 50 to be more lenient
  
  // If we have at least 3 keyword matches, give additional bonus
  const matchCountBonus = matchedKeywords.length >= 3 ? 10 : 0
  
  // Role/Title match (15% weight) - increased importance
  const roleMatchScore = checkRoleMatch(resume, job)
  
  // Experience match (10% weight) - increased importance
  const experienceMatch = checkExperienceMatch(resume, job)
  
  // Education match (5% weight)
  const educationMatch = checkEducationMatch(resume, job)
  
  // Base score for Project Manager jobs (if it's a PM role, give base points)
  const isPMRole = job.title.toLowerCase().includes('project manager') || 
                   job.title.toLowerCase().includes('program manager') ||
                   job.description.toLowerCase().includes('project manager') ||
                   job.description.toLowerCase().includes('program manager')
  const baseScore = isPMRole ? 15 : 0
  
  // Calculate final score - more lenient and balanced
  let score = ratioScore + absoluteMatchBonus + matchCountBonus + (roleMatchScore * 15) + (experienceMatch * 10) + (educationMatch * 5) + baseScore
  score = Math.min(100, Math.max(0, Math.round(score)))
  
  // More lenient recommendation threshold - lower from 70 to 40
  // This will show more jobs as "apply" recommendations
  // If it's a PM role and we have some keyword matches, recommend applying
  const recommendation: 'apply' | 'skip' = (score >= 40) || (isPMRole && matchedKeywords.length >= 2) ? 'apply' : 'skip'
  
  // Generate detailed reasons based on keyword matches
  const reasons: string[] = []
  
  if (keywordMatchRatio >= 0.8) {
    reasons.push(`Excellent keyword match: ${matchedKeywords.length} out of ${jobKeywords.length} required keywords found`)
  } else if (keywordMatchRatio >= 0.6) {
    reasons.push(`Good keyword match: ${matchedKeywords.length} out of ${jobKeywords.length} required keywords found`)
  } else if (keywordMatchRatio >= 0.4) {
    reasons.push(`Moderate keyword match: ${matchedKeywords.length} out of ${jobKeywords.length} required keywords found`)
  } else {
    reasons.push(`Limited keyword match: Only ${matchedKeywords.length} out of ${jobKeywords.length} required keywords found`)
  }
  
  if (matchedKeywords.length > 0) {
    reasons.push(`Matched keywords: ${matchedKeywords.slice(0, 5).join(', ')}${matchedKeywords.length > 5 ? '...' : ''}`)
  }
  
  if (missingKeywords.length > 0 && missingKeywords.length <= 10) {
    reasons.push(`Missing important keywords: ${missingKeywords.slice(0, 5).join(', ')}${missingKeywords.length > 5 ? '...' : ''}`)
  } else if (missingKeywords.length > 10) {
    reasons.push(`Missing many required keywords (${missingKeywords.length} total)`)
  }
  
  if (roleMatchScore >= 0.8) {
    reasons.push('Job role closely matches your background')
  } else if (roleMatchScore < 0.3) {
    reasons.push('Job role may not match your background')
  }
  
  if (experienceMatch > 0.8) {
    reasons.push('Experience level matches job requirements')
  }
  
  return {
    job,
    score,
    recommendation,
    reasons,
    matchedSkills: matchedKeywords.slice(0, 15), // Show matched keywords
    missingSkills: missingKeywords.slice(0, 15) // Show missing keywords
  }
}

// Calculate keyword matches between resume and job
function calculateKeywordMatches(
  resumeKeywords: string[], 
  jobKeywords: string[],
  pmKeywords: string[] = []
): { matchedKeywords: string[], missingKeywords: string[], matchDetails: any } {
  const matchedKeywords: string[] = []
  const missingKeywords: string[] = []
  
  // Check each job keyword against resume keywords
  jobKeywords.forEach(jobKeyword => {
    const isPM = pmKeywords.includes(jobKeyword) || isProjectManagementKeyword(jobKeyword)
    
    const found = resumeKeywords.some(resumeKeyword => {
      // Exact match
      if (resumeKeyword === jobKeyword) return true
      // Partial match (one contains the other)
      if (resumeKeyword.includes(jobKeyword) || jobKeyword.includes(resumeKeyword)) return true
      // Word boundary match (e.g., "javascript" matches "JavaScript")
      const resumeWords = resumeKeyword.split(/[\s\-_]+/)
      const jobWords = jobKeyword.split(/[\s\-_]+/)
      return resumeWords.some(rw => jobWords.some(jw => rw === jw || rw.includes(jw) || jw.includes(rw)))
    })
    
    if (found) {
      // Prioritize project management keywords in matched list
      if (isPM) {
        matchedKeywords.unshift(jobKeyword) // Add to front
      } else {
        matchedKeywords.push(jobKeyword)
      }
    } else {
      // Prioritize project management keywords in missing list too
      if (isPM) {
        missingKeywords.unshift(jobKeyword) // Add to front
      } else {
        missingKeywords.push(jobKeyword)
      }
    }
  })
  
  return { matchedKeywords, missingKeywords, matchDetails: {} }
}

function checkRoleMatch(resume: ResumeData, job: JobPosting): number {
  const jobTitleLower = job.title.toLowerCase()
  const jobDescLower = job.description.toLowerCase()
  
  // If we have job title from resume
  if (resume.jobTitle) {
    const resumeTitleLower = resume.jobTitle.toLowerCase()
    
    // Exact or very close match
    if (jobTitleLower.includes(resumeTitleLower) || resumeTitleLower.includes(jobTitleLower.split(' ')[0])) {
      return 1.0
    }
    
    // Check for role category matches
    const roleCategories: { [key: string]: string[] } = {
      'project manager': ['project manager', 'program manager', 'pmp', 'agile project', 'scrum master'],
      'product manager': ['product manager', 'product owner', 'product lead'],
      'software engineer': ['software engineer', 'developer', 'programmer', 'software developer'],
      'data scientist': ['data scientist', 'data analyst', 'machine learning engineer'],
      'designer': ['designer', 'ux designer', 'ui designer', 'user experience'],
      'business analyst': ['business analyst', 'analyst', 'business intelligence'],
      'sales': ['sales', 'account executive', 'business development'],
      'marketing': ['marketing', 'digital marketing', 'marketing manager'],
      'devops': ['devops', 'site reliability', 'sre', 'infrastructure engineer']
    }
    
    for (const [key, keywords] of Object.entries(roleCategories)) {
      if (resumeTitleLower.includes(key)) {
        const matchCount = keywords.filter(kw => 
          jobTitleLower.includes(kw) || jobDescLower.includes(kw)
        ).length
        if (matchCount > 0) {
          return Math.min(1.0, 0.6 + (matchCount * 0.2)) // 0.6-1.0 based on matches
        }
      }
    }
  }
  
  // Check resume keywords
  if (resume.jobKeywords && resume.jobKeywords.length > 0) {
    const jobText = jobTitleLower + ' ' + jobDescLower
    const matchCount = resume.jobKeywords.filter(keyword => 
      jobText.includes(keyword.toLowerCase())
    ).length
    
    if (matchCount > 0) {
      return Math.min(1.0, 0.5 + (matchCount * 0.2)) // 0.5-1.0 based on keyword matches
    }
  }
  
  // Fallback: check if resume text contains job title keywords
  const resumeTextLower = resume.text.toLowerCase()
  const jobTitleWords = jobTitleLower.split(' ').filter(w => w.length > 3)
  const matchCount = jobTitleWords.filter(word => resumeTextLower.includes(word)).length
  
  if (matchCount >= jobTitleWords.length * 0.5) {
    return 0.4 // Partial match
  }
  
  return 0.0 // No match
}


// Comprehensive keyword extraction from text
function extractAllKeywords(text: string, job: JobPosting | null): string[] {
  const found: string[] = []
  const lowerText = text.toLowerCase()
  
  // Add project management keywords first (they're prioritized)
  PROJECT_MANAGEMENT_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      found.push(keyword)
    }
  })
  
  // Comprehensive tech and skill keywords
  const allKeywords = [
    // Programming Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin',
    'r programming', 'matlab', 'perl', 'scala', 'clojure', 'haskell',
    
    // Frameworks & Libraries
    'react', 'vue', 'angular', 'next.js', 'nuxt', 'svelte', 'ember',
    'node.js', 'express', 'nest.js', 'fastapi', 'django', 'flask', 'spring', 'spring boot',
    'laravel', 'rails', 'asp.net', '.net', 'dotnet',
    
    // Databases
    'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'cassandra', 'dynamodb',
    'oracle', 'sql server', 'sqlite', 'elasticsearch', 'neo4j',
    
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'ci/cd', 'jenkins',
    'terraform', 'ansible', 'chef', 'puppet', 'gitlab ci', 'github actions',
    'serverless', 'lambda', 'ec2', 's3', 'cloudformation',
    
    // Tools & Platforms
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'trello',
    'figma', 'sketch', 'adobe xd', 'invision',
    
    // Methodologies
    'agile', 'scrum', 'kanban', 'waterfall', 'devops', 'lean', 'six sigma',
    
    // AI/ML
    'machine learning', 'ml', 'deep learning', 'neural networks', 'tensorflow', 'pytorch',
    'keras', 'scikit-learn', 'numpy', 'pandas', 'data science', 'nlp', 'natural language processing',
    
    // Web Technologies
    'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'bootstrap',
    'rest api', 'graphql', 'soap', 'microservices', 'api', 'restful',
    
    // Project Management
    'project management', 'pmp', 'prince2', 'agile project management', 'scrum master',
    'product management', 'product owner', 'program management',
    
    // Soft Skills
    'leadership', 'communication', 'teamwork', 'collaboration', 'problem solving',
    'analytical', 'strategic thinking', 'stakeholder management',
    
    // Other Technologies
    'linux', 'unix', 'windows', 'macos', 'ios', 'android',
    'backend', 'frontend', 'full stack', 'fullstack',
    'mobile development', 'ios development', 'android development',
    'web development', 'software development', 'application development',
    
    // Certifications & Education
    'bachelor', 'master', 'phd', 'degree', 'bs', 'ms', 'mba', 'certified', 'certification',
    
    // Experience
    'years of experience', 'years experience', 'yrs experience'
  ]
  
  // Extract all matching keywords
  allKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      found.push(keyword)
    }
  })
  
  // Extract specific phrases and requirements
  const phrases = [
    /(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/gi,
    /(bachelor|master|phd|doctorate)\s+(degree|in|of)/gi,
    /(certified|certification)\s+in/gi,
    /(proficient|expert|experienced)\s+in/gi,
    /(strong|excellent|deep)\s+(knowledge|understanding|experience)/gi
  ]
  
  phrases.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      found.push(...matches.map(m => m.toLowerCase().trim()))
    }
  })
  
  // Extract job-specific keywords if job object provided
  if (job) {
    // Add job title words as keywords
    const titleWords = job.title.toLowerCase().split(/[\s\-_]+/).filter(w => w.length > 2)
    found.push(...titleWords)
    
    // Add company-specific terms if any
    if (job.company) {
      const companyWords = job.company.toLowerCase().split(/[\s\-_]+/).filter(w => w.length > 2)
      found.push(...companyWords)
    }
  }
  
  // Remove duplicates and very short keywords
  return Array.from(new Set(found)).filter(kw => kw.length >= 2)
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



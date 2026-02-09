import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export async function parseResume(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const fileType = file.type

  if (fileType === 'application/pdf') {
    // Ensure Buffer is available (Node.js runtime)
    if (typeof Buffer === 'undefined') {
      throw new Error('Buffer is not available. This function requires Node.js runtime.')
    }
    const data = await pdfParse(Buffer.from(buffer))
    return data.text
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return result.value
  } else {
    throw new Error('Unsupported file type')
  }
}

export function extractSkills(resumeText: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD',
    'Git', 'GitHub', 'GitLab', 'Agile', 'Scrum', 'Machine Learning',
    'Data Science', 'TensorFlow', 'PyTorch', 'REST API', 'GraphQL',
    'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
    'Linux', 'Unix', 'Windows', 'macOS',
    'Project Management', 'Leadership', 'Communication', 'Teamwork'
  ]

  const lowerText = resumeText.toLowerCase()
  const foundSkills: string[] = []

  commonSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill)
    }
  })

  return foundSkills
}

export function extractExperience(resumeText: string): string[] {
  const experiencePattern = /(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/gi
  const matches = resumeText.match(experiencePattern)
  return matches || []
}

export function extractEducation(resumeText: string): string[] {
  const educationKeywords = ['Bachelor', 'Master', 'PhD', 'Degree', 'University', 'College', 'BS', 'MS', 'MBA']
  const found: string[] = []
  
  educationKeywords.forEach(keyword => {
    if (resumeText.includes(keyword)) {
      found.push(keyword)
    }
  })
  
  return found
}

export function extractJobTitle(resumeText: string): string | null {
  // Common job title patterns
  const titlePatterns = [
    /(?:current|present|role|position|title)[\s:]+([A-Z][a-zA-Z\s&]+(?:Manager|Engineer|Developer|Director|Lead|Specialist|Analyst|Consultant|Coordinator|Administrator|Executive|Architect|Designer|Scrum|Product|Project|Program|Business|Data|Software|Systems|DevOps|QA|Test|Security|Network|Cloud|Full.?Stack|Front.?end|Back.?end|Mobile|iOS|Android|Machine.?Learning|Data.?Science|Sales|Marketing|HR|Finance|Operations))/i,
    /(?:worked as|served as|held the position of|position of)[\s:]+([A-Z][a-zA-Z\s&]+(?:Manager|Engineer|Developer|Director|Lead|Specialist|Analyst|Consultant|Coordinator|Administrator|Executive|Architect|Designer|Scrum|Product|Project|Program|Business|Data|Software|Systems|DevOps|QA|Test|Security|Network|Cloud|Full.?Stack|Front.?end|Back.?end|Mobile|iOS|Android|Machine.?Learning|Data.?Science|Sales|Marketing|HR|Finance|Operations))/i,
    /^([A-Z][a-zA-Z\s&]+(?:Manager|Engineer|Developer|Director|Lead|Specialist|Analyst|Consultant|Coordinator|Administrator|Executive|Architect|Designer|Scrum|Product|Project|Program|Business|Data|Software|Systems|DevOps|QA|Test|Security|Network|Cloud|Full.?Stack|Front.?end|Back.?end|Mobile|iOS|Android|Machine.?Learning|Data.?Science|Sales|Marketing|HR|Finance|Operations))/m,
  ]

  for (const pattern of titlePatterns) {
    const match = resumeText.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  // Fallback: Look for common job titles in the first few lines
  const lines = resumeText.split('\n').slice(0, 10)
  const commonTitles = [
    'Project Manager', 'Product Manager', 'Program Manager',
    'Software Engineer', 'Senior Software Engineer', 'Full Stack Developer',
    'Frontend Developer', 'Backend Developer', 'DevOps Engineer',
    'Data Scientist', 'Data Analyst', 'Business Analyst',
    'Product Designer', 'UX Designer', 'UI Designer',
    'Scrum Master', 'Agile Coach', 'Technical Lead',
    'Engineering Manager', 'CTO', 'VP Engineering',
    'Sales Manager', 'Marketing Manager', 'HR Manager',
    'Operations Manager', 'Finance Manager'
  ]

  for (const line of lines) {
    for (const title of commonTitles) {
      if (line.toLowerCase().includes(title.toLowerCase())) {
        return title
      }
    }
  }

  return null
}

export function extractJobKeywords(resumeText: string): string[] {
  // Extract keywords that indicate job role/domain
  const roleKeywords: string[] = []
  const lowerText = resumeText.toLowerCase()

  // Check for PMP certification first (important for job search)
  const pmpPatterns = [
    /\bpmp\b/i,
    /project management professional/i,
    /pmp certified/i,
    /pmp certification/i,
    /certified project management professional/i
  ]
  
  const hasPMP = pmpPatterns.some(pattern => pattern.test(resumeText))
  if (hasPMP) {
    roleKeywords.push('pmp', 'pmp certified', 'project management professional')
  }

  const rolePatterns = {
    'project management': ['project management', 'project manager', 'pmp', 'agile', 'scrum', 'kanban', 'waterfall'],
    'product management': ['product management', 'product manager', 'product owner', 'roadmap', 'backlog'],
    'software engineering': ['software engineer', 'developer', 'programming', 'coding', 'software development'],
    'data science': ['data science', 'data scientist', 'machine learning', 'ml', 'ai', 'data analysis'],
    'devops': ['devops', 'ci/cd', 'deployment', 'infrastructure', 'kubernetes', 'docker'],
    'design': ['ux design', 'ui design', 'user experience', 'user interface', 'designer'],
    'business': ['business analyst', 'business development', 'strategy', 'consulting'],
    'sales': ['sales', 'account executive', 'business development', 'revenue'],
    'marketing': ['marketing', 'digital marketing', 'content marketing', 'seo', 'sem']
  }

  for (const [domain, keywords] of Object.entries(rolePatterns)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      roleKeywords.push(domain)
    }
  }

  return roleKeywords
}


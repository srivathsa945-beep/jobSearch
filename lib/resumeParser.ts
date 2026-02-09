import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export async function parseResume(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const fileType = file.type

  if (fileType === 'application/pdf') {
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


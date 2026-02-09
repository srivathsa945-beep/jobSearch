import { NextRequest, NextResponse } from 'next/server'
import { parseResume, extractSkills, extractExperience, extractEducation } from '@/lib/resumeParser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('resume') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Parse resume
    const resumeText = await parseResume(file)
    
    // Extract structured data
    const skills = extractSkills(resumeText)
    const experience = extractExperience(resumeText)
    const education = extractEducation(resumeText)

    return NextResponse.json({
      success: true,
      resumeText,
      skills,
      experience,
      education
    })
  } catch (error) {
    console.error('Error parsing resume:', error)
    return NextResponse.json(
      { error: 'Failed to parse resume' },
      { status: 500 }
    )
  }
}


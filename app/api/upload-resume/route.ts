import { NextRequest, NextResponse } from 'next/server'
import { parseResume, extractSkills, extractExperience, extractEducation, extractJobTitle, extractJobKeywords } from '@/lib/resumeParser'

// Ensure this route uses Node.js runtime (not Edge runtime)
export const runtime = 'nodejs'

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
    const jobTitle = extractJobTitle(resumeText)
    const jobKeywords = extractJobKeywords(resumeText)

    return NextResponse.json({
      success: true,
      resumeText,
      skills,
      experience,
      education,
      jobTitle,
      jobKeywords
    })
  } catch (error) {
    console.error('Error parsing resume:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { 
        error: 'Failed to parse resume',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}


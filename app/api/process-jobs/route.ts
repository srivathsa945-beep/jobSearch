import { NextRequest, NextResponse } from 'next/server'
import { searchJobs } from '@/lib/jobSearch'
import { calculateMatchScore } from '@/lib/jobMatcher'
import { extractSkills, extractExperience, extractEducation } from '@/lib/resumeParser'
import { ResumeData } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json()

    if (!resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      )
    }

    // Extract resume data
    const resumeData: ResumeData = {
      text: resumeText,
      skills: extractSkills(resumeText),
      experience: extractExperience(resumeText),
      education: extractEducation(resumeText)
    }

    // Search for jobs posted within last 24 hours
    const jobs = await searchJobs()

    // Calculate matches for each job
    const matches = jobs.map(job => calculateMatchScore(resumeData, job))
    
    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score)

    return NextResponse.json({
      success: true,
      matches,
      totalJobs: jobs.length
    })
  } catch (error) {
    console.error('Error processing jobs:', error)
    return NextResponse.json(
      { error: 'Failed to process jobs' },
      { status: 500 }
    )
  }
}


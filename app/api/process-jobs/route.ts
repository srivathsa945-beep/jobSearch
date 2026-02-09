import { NextRequest, NextResponse } from 'next/server'
import { searchJobs } from '@/lib/jobSearch'
import { calculateMatchScore } from '@/lib/jobMatcher'
import { extractSkills, extractExperience, extractEducation, extractJobTitle, extractJobKeywords } from '@/lib/resumeParser'
import { ResumeData } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobTitle, jobKeywords } = await request.json()

    if (!resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      )
    }

    // Extract resume data (use provided jobTitle/jobKeywords or extract from text)
    const extractedJobTitle = jobTitle || extractJobTitle(resumeText)
    const extractedJobKeywords = jobKeywords || extractJobKeywords(resumeText)
    
    const resumeData: ResumeData = {
      text: resumeText,
      skills: extractSkills(resumeText),
      experience: extractExperience(resumeText),
      education: extractEducation(resumeText),
      jobTitle: extractedJobTitle,
      jobKeywords: extractedJobKeywords
    }

    // Search for jobs posted within last 24 hours, filtered by role
    const jobs = await searchJobs(extractedJobTitle, extractedJobKeywords)

    // Calculate matches for each job
    const matches = jobs.map(job => calculateMatchScore(resumeData, job))
    
    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score)

    return NextResponse.json({
      success: true,
      matches,
      totalJobs: jobs.length,
      extractedRole: extractedJobTitle || 'Not detected',
      searchCriteria: {
        jobTitle: extractedJobTitle,
        keywords: extractedJobKeywords
      }
    })
  } catch (error) {
    console.error('Error processing jobs:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { 
        error: 'Failed to process jobs',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}


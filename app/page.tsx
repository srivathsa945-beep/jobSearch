'use client'

import { useState } from 'react'
import ResumeUpload from '@/components/ResumeUpload'
import ResultsDashboard from '@/components/ResultsDashboard'
import { JobMatch } from '@/types'

export default function Home() {
  const [matches, setMatches] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [searchInfo, setSearchInfo] = useState<{ role?: string; totalJobs?: number } | null>(null)

  const handleResumeProcessed = async (resumeText: string, jobTitle?: string | null, jobKeywords?: string[]) => {
    setLoading(true)
    setResumeUploaded(true)
    
    try {
      const response = await fetch('/api/process-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobTitle, jobKeywords }),
      })
      
      const data = await response.json()
      setMatches(data.matches || [])
      setSearchInfo({
        role: data.extractedRole,
        totalJobs: data.totalJobs
      })
    } catch (error) {
      console.error('Error processing jobs:', error)
      alert('Error processing jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          AI-Powered Job Search Assistant
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Upload your resume and let AI find the perfect job matches for you
        </p>
        
        {!resumeUploaded ? (
          <ResumeUpload onResumeProcessed={handleResumeProcessed} />
        ) : (
          <ResultsDashboard 
            matches={matches} 
            loading={loading}
            searchInfo={searchInfo}
            onReset={() => {
              setResumeUploaded(false)
              setMatches([])
              setSearchInfo(null)
            }}
          />
        )}
      </div>
    </main>
  )
}


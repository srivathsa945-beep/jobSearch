'use client'

import { useState, useEffect } from 'react'
import ResumeUpload from '@/components/ResumeUpload'
import ResultsDashboard from '@/components/ResultsDashboard'
import { JobMatch, JobPosting } from '@/types'

type Step = 'search' | 'upload' | 'results'

export default function Home() {
  const [step, setStep] = useState<Step>('search')
  const [matches, setMatches] = useState<JobMatch[]>([])
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<string>('7') // Default: 7 days
  const [jobsFromStorage, setJobsFromStorage] = useState(false)
  const [storedJobsInfo, setStoredJobsInfo] = useState<{
    count: number
    searchDate: string
    available: boolean
  } | null>(null)
  const [searchInfo, setSearchInfo] = useState<{ 
    role?: string
    totalJobs?: number
    dateRange?: { from: string; to: string; fromFormatted: string; toFormatted: string }
  } | null>(null)

  // Check for stored jobs on mount and when date range changes
  useEffect(() => {
    const checkStoredJobs = async () => {
      try {
        const response = await fetch(`/api/jobs-storage?dateRange=${dateRange}`)
        const data = await response.json()
        
        if (data.success && data.jobs && data.jobs.length > 0 && data.fromStorage) {
          setStoredJobsInfo({
            count: data.jobs.length,
            searchDate: data.searchDate || new Date().toISOString(),
            available: true
          })
        } else {
          setStoredJobsInfo({
            count: 0,
            searchDate: '',
            available: false
          })
        }
      } catch (error) {
        console.error('Error checking stored jobs:', error)
        setStoredJobsInfo({
          count: 0,
          searchDate: '',
          available: false
        })
      }
    }
    
    checkStoredJobs()
  }, [dateRange])

  // Load stored jobs function
  const loadStoredJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/jobs-storage?dateRange=${dateRange}`)
      const data = await response.json()
      
      if (data.success && data.jobs && data.jobs.length > 0 && data.fromStorage) {
        setJobs(data.jobs)
        setJobsFromStorage(true)
        
        // Set search info if available
        const days = parseInt(dateRange) || 7
        const now = new Date()
        const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        setSearchInfo({
          totalJobs: data.totalJobs,
          dateRange: {
            from: daysAgo.toISOString(),
            to: now.toISOString(),
            fromFormatted: daysAgo.toLocaleDateString(),
            toFormatted: now.toLocaleDateString()
          }
        })
        
        // Move to upload step
        setStep('upload')
      } else {
        alert('No stored jobs found for this date range. Please search for new jobs.')
      }
    } catch (error) {
      console.error('Error loading stored jobs:', error)
      alert('Failed to load stored jobs. Please try searching for new jobs.')
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Search for jobs first
  const handleSearchJobs = async () => {
    setLoading(true)
    setJobsFromStorage(false) // Reset storage flag when doing new search
    
    try {
      const response = await fetch(`/api/search-jobs?dateRange=${dateRange}`)
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        const errorMsg = data.error || data.details || 'Failed to search jobs'
        const debugInfo = data.debugInfo || {}
        
        // Build detailed error message
        let fullErrorMsg = `Error: ${errorMsg}\n\n`
        
        if (data.debugInfo) {
          fullErrorMsg += `Debug Information:\n`
          fullErrorMsg += `- API Token Present: ${debugInfo.hasToken ? 'Yes' : 'No'}\n`
          fullErrorMsg += `- Token Length: ${debugInfo.tokenLength} characters\n`
          fullErrorMsg += `- Token Prefix: ${debugInfo.tokenPrefix}\n`
          fullErrorMsg += `- Environment: ${debugInfo.nodeEnv || 'N/A'}\n\n`
        }
        
        // Check if it's an environment variable issue
        if (errorMsg.includes('APIFY_API_TOKEN') || errorMsg.includes('environment variable') || errorMsg.includes('not set')) {
          fullErrorMsg += `SOLUTION:\n`
          fullErrorMsg += `1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables\n`
          fullErrorMsg += `2. Add: APIFY_API_TOKEN = apify_api_74LnWixKE5sIesne0Jormuz9GW19E444A30c\n`
          fullErrorMsg += `3. Select all environments (Production, Preview, Development)\n`
          fullErrorMsg += `4. Click Save\n`
          fullErrorMsg += `5. REDEPLOY your application (Deployments → ⋯ → Redeploy)\n\n`
          fullErrorMsg += `See VERCEL_ENV_SETUP.md for detailed instructions.`
        } else if (errorMsg.includes('usage') || errorMsg.includes('limit')) {
          fullErrorMsg += `Your Apify account may have reached its usage limit.\n`
          fullErrorMsg += `Check: https://console.apify.com/account/usage`
        } else {
          fullErrorMsg += `Check Vercel deployment logs for more details.`
        }
        
        alert(fullErrorMsg)
        throw new Error(errorMsg)
      }
      
      const fetchedJobs = data.jobs || []
      setJobs(fetchedJobs)
      
      // Calculate date range based on current selection (not just from API response)
      const days = parseInt(dateRange) || 7
      const now = new Date()
      const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      const dateRangeInfo = {
        from: daysAgo.toISOString(),
        to: now.toISOString(),
        fromFormatted: daysAgo.toLocaleDateString(),
        toFormatted: now.toLocaleDateString()
      }
      
      setSearchInfo({
        totalJobs: data.totalJobs,
        dateRange: dateRangeInfo
      })
      
      // Save jobs to storage after successful search
      if (fetchedJobs.length > 0) {
        try {
          await fetch('/api/jobs-storage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dateRange,
              jobs: fetchedJobs,
              totalJobs: data.totalJobs,
              dateRangeInfo
            })
          })
          console.log(`💾 Saved ${fetchedJobs.length} jobs to storage`)
          // Update stored jobs info
          setStoredJobsInfo({
            count: fetchedJobs.length,
            searchDate: new Date().toISOString(),
            available: true
          })
        } catch (storageError) {
          console.error('Error saving jobs to storage:', storageError)
          // Don't block the user flow if storage fails
        }
      }
      
      // If no jobs found, show a helpful message
      if (data.totalJobs === 0) {
        alert('No jobs found. This could mean:\n\n1. Apify API token not set in Vercel\n2. Apify usage limit exceeded\n3. No jobs match the search criteria\n\nCheck Vercel deployment logs for details.')
      }
      
      // Move to upload step
      setStep('upload')
    } catch (error) {
      console.error('Error searching jobs:', error)
      // Don't show alert again if we already showed one above
      if (!(error instanceof Error && error.message.includes('Configuration Error'))) {
        // Error already handled above
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Upload resume and score jobs
  const handleResumeProcessed = async (resumeText: string, jobTitle?: string | null, jobKeywords?: string[]) => {
    if (jobs.length === 0) {
      alert('Please search for jobs first!')
      return
    }

    setLoading(true)
    setStep('results')
    
    try {
      const response = await fetch('/api/score-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText, 
          jobTitle, 
          jobKeywords,
          jobs: jobs // Pass the pre-fetched jobs
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to score jobs')
      }
      
          setMatches(data.matches || [])
          // Preserve date range from search step, or calculate if not available
          const currentDateRange = searchInfo?.dateRange || (() => {
            const days = parseInt(dateRange) || 7
            const now = new Date()
            const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
            return {
              from: daysAgo.toISOString(),
              to: now.toISOString(),
              fromFormatted: daysAgo.toLocaleDateString(),
              toFormatted: now.toLocaleDateString()
            }
          })()
          setSearchInfo({
            role: data.extractedRole,
            totalJobs: data.totalJobs,
            dateRange: currentDateRange
          })
    } catch (error) {
      console.error('Error scoring jobs:', error)
      alert(error instanceof Error ? error.message : 'Error scoring jobs. Please try again.')
      setStep('upload') // Go back to upload step on error
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('search')
    setMatches([])
    setJobs([])
    setSearchInfo(null)
    setJobsFromStorage(false)
    // Re-check for stored jobs after reset
    const checkStoredJobs = async () => {
      try {
        const response = await fetch(`/api/jobs-storage?dateRange=${dateRange}`)
        const data = await response.json()
        if (data.success && data.jobs && data.jobs.length > 0 && data.fromStorage) {
          setStoredJobsInfo({
            count: data.jobs.length,
            searchDate: data.searchDate || new Date().toISOString(),
            available: true
          })
        } else {
          setStoredJobsInfo({
            count: 0,
            searchDate: '',
            available: false
          })
        }
      } catch (error) {
        console.error('Error checking stored jobs:', error)
      }
    }
    checkStoredJobs()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
            Don't worry, we will get this
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your perfect Project Manager role is out there. Let's find it together with intelligent matching and automated application tracking.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-12 flex justify-center">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className={`flex flex-col sm:flex-row items-center ${step === 'search' ? 'text-blue-400' : step === 'upload' || step === 'results' ? 'text-emerald-400' : 'text-gray-500'} transition-all duration-300`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-all ${step === 'search' ? 'border-blue-500 bg-blue-500 text-white scale-110 shadow-blue-500/50' : step === 'upload' || step === 'results' ? 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-500/50' : 'border-gray-600 bg-gray-700 text-gray-400'}`}>
                {step === 'upload' || step === 'results' ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : '1'}
              </div>
              <span className="mt-2 sm:mt-0 sm:ml-3 font-semibold text-sm sm:text-base">Search Jobs</span>
            </div>
            <div className={`w-8 sm:w-16 h-0.5 sm:h-1 ${step === 'upload' || step === 'results' ? 'bg-emerald-500' : 'bg-gray-600'} transition-all duration-300`}></div>
            <div className={`flex flex-col sm:flex-row items-center ${step === 'upload' ? 'text-blue-400' : step === 'results' ? 'text-emerald-400' : 'text-gray-500'} transition-all duration-300`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-all ${step === 'upload' ? 'border-blue-500 bg-blue-500 text-white scale-110 shadow-blue-500/50' : step === 'results' ? 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-500/50' : 'border-gray-600 bg-gray-700 text-gray-400'}`}>
                {step === 'results' ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : '2'}
              </div>
              <span className="mt-2 sm:mt-0 sm:ml-3 font-semibold text-sm sm:text-base">Upload Resume</span>
            </div>
            <div className={`w-8 sm:w-16 h-0.5 sm:h-1 ${step === 'results' ? 'bg-emerald-500' : 'bg-gray-600'} transition-all duration-300`}></div>
            <div className={`flex flex-col sm:flex-row items-center ${step === 'results' ? 'text-blue-400' : 'text-gray-500'} transition-all duration-300`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-all ${step === 'results' ? 'border-blue-500 bg-blue-500 text-white scale-110 shadow-blue-500/50' : 'border-gray-600 bg-gray-700 text-gray-400'}`}>
                3
              </div>
              <span className="mt-2 sm:mt-0 sm:ml-3 font-semibold text-sm sm:text-base">View Results</span>
            </div>
          </div>
        </div>
        
        {step === 'search' && (
          <div className="max-w-2xl mx-auto">
            {/* Stored Jobs Section */}
            {storedJobsInfo && storedJobsInfo.available && storedJobsInfo.count > 0 && (
              <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-l-4 border-blue-500 rounded-lg p-6 mb-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-semibold text-blue-300">
                        {storedJobsInfo.count} Stored Jobs Available
                      </p>
                      <p className="text-sm text-blue-200 mt-1">
                        Last searched: {new Date(storedJobsInfo.searchDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={loadStoredJobs}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    {loading ? 'Loading...' : 'Load Stored Jobs'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2 text-white">
                  Search for Project Manager Jobs
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 mx-auto rounded-full"></div>
              </div>
            
              {/* Date Range Selector */}
              <div className="mb-6">
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-300 mb-3">
                Select Date Range
              </label>
              <div className="relative">
                <select
                  id="dateRange"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-800 disabled:border-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-500 hover:bg-gray-750"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="1" className="bg-gray-700 text-white">Last 24 hours</option>
                  <option value="7" className="bg-gray-700 text-white">Last 7 days</option>
                  <option value="14" className="bg-gray-700 text-white">Last 14 days</option>
                  <option value="30" className="bg-gray-700 text-white">Last 30 days</option>
                </select>
              </div>
            </div>

              <p className="text-center text-gray-400 mb-6 text-sm">
                {dateRange === '1' && "We'll search LinkedIn and Google Jobs for all Project Manager jobs posted in the last 24 hours."}
                {dateRange === '7' && "We'll search LinkedIn and Google Jobs for all Project Manager jobs posted in the last 7 days."}
                {dateRange === '14' && "We'll search LinkedIn and Google Jobs for all Project Manager jobs posted in the last 14 days."}
                {dateRange === '30' && "We'll search LinkedIn and Google Jobs for all Project Manager jobs posted in the last 30 days."}
              </p>
              <button
                onClick={handleSearchJobs}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-4 px-6 rounded-lg hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500 disabled:from-gray-700 disabled:via-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching for jobs...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search for New Jobs
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'upload' && (
          <div>
            <div className="bg-gradient-to-r from-emerald-900/50 to-green-900/50 border-l-4 border-emerald-500 rounded-lg p-6 mb-8 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-lg font-semibold text-emerald-300">
                    {jobsFromStorage ? 'Loaded' : 'Found'} {jobs.length} Project Manager jobs!
                  </p>
                  <p className="text-sm text-emerald-200 mt-1">
                    {jobsFromStorage 
                      ? 'These jobs were loaded from your previous search. Upload your resume to see personalized match scores.'
                      : 'Upload your resume to see personalized match scores'}
                  </p>
                  {jobsFromStorage && (
                    <p className="text-xs text-emerald-300/70 mt-1 italic">
                      💡 Tip: Click "Back to Search" to fetch fresh jobs
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 text-white">
                Upload Your Resume
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 mx-auto rounded-full"></div>
            </div>
            <ResumeUpload onResumeProcessed={handleResumeProcessed} />
            <div className="text-center mt-4">
              <button
                onClick={() => setStep('search')}
                className="text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                ← Back to Search
              </button>
            </div>
          </div>
        )}

        {step === 'results' && (
          <ResultsDashboard 
            matches={matches} 
            loading={loading}
            searchInfo={searchInfo}
            onReset={handleReset}
          />
        )}
      </div>
    </main>
  )
}

import dynamic from 'next/dynamic'

// Dynamically import the client component with SSR disabled
// This prevents Next.js from trying to pre-render it during build
const HomeClient = dynamic(() => import('./page-client'), {
  ssr: false, // Disable server-side rendering completely
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
        <p className="text-gray-300">Loading...</p>
      </div>
    </div>
  ),
})

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0 // Never cache
export const fetchCache = 'force-no-store' // Don't cache any fetches

export default function Home() {
  return <HomeClient />
}

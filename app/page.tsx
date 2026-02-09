import { headers } from 'next/headers'
import HomeClient from './page-client'

// Force dynamic rendering by using a dynamic server function
// This prevents Next.js from statically generating the page
export const dynamic = 'force-dynamic'

export default async function Home() {
  // Use headers() to ensure this is a dynamic route
  headers()
  
  return <HomeClient />
}

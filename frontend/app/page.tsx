import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { LandingPage } from '@/components/landing/LandingPage'

export default async function Home() {
  // Signed-in users go straight to their roadmaps; visitors see the landing page.
  const session = await auth()
  if (session?.user) redirect('/dashboard')
  return <LandingPage />
}

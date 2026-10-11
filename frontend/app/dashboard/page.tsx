import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/dashboard')
  return <DashboardClient />
}

'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Dashboard } from '@/components/dashboard/dashboard'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) redirect('/auth/signin')
  }, [session, status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <Dashboard user={session.user} />
}
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface Analytics {
  total_users: number
  active_users: number
  total_routines: number
  completion_rate: number
  avg_streak: number
  top_categories: Array<{ category: string; count: number }>
  daily_signups: Array<{ date: string; count: number }>
  user_retention: {
    day_1: number
    day_7: number
    day_30: number
  }
}

interface UserData {
  _id: string
  email: string
  username: string
  fitness_level: string
  total_xp: number
  streak_data: {
    current: number
    longest: number
  }
  is_admin: boolean
  created_at: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'routines'>('overview')
  const [searchEmail, setSearchEmail] = useState('')

  // Check if user is admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/signin')
      return
    }
    // @ts-ignore - custom session fields
    if (!session.user.isAdmin && !session.user.email?.includes('admin')) {
      redirect('/dashboard')
      return
    }
  }, [session, status])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        apiClient.getAnalytics(),
        apiClient.getUsers(1, 20)
      ])

      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data)
      }
      if (usersRes.success) {
        setUsers(usersRes.data?.users || [])
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await apiClient.deleteUser(userId)
      if (response.success) {
        toast.success('User deleted successfully')
        setUsers(users.filter(u => u._id !== userId))
      } else {
        toast.error('Failed to delete user')
      }
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const filteredUsers = users.filter(user =>
    searchEmail === '' || user.email.toLowerCase().includes(searchEmail.toLowerCase())
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl text-green-800">Loading admin panel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-800">ChiZen Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, Admin</span>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button 
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </Button>
          <Button 
            variant={activeTab === 'routines' ? 'default' : 'outline'}
            onClick={() => setActiveTab('routines')}
          >
            Routines
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-800">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.total_users}</div>
                <p className="text-gray-600 text-sm">Registered accounts</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-800">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.active_users}</div>
                <p className="text-gray-600 text-sm">Active this week</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-800">Total Routines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.total_routines}</div>
                <p className="text-gray-600 text-sm">Generated routines</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-800">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Math.round(analytics.completion_rate * 100)}%</div>
                <p className="text-gray-600 text-sm">Average completion</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-green-800">User Management</h2>
              <div className="flex gap-4">
                <Input
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-64"
                />
                <Button onClick={loadData}>Refresh</Button>
              </div>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4 font-semibold text-green-800">Email</th>
                        <th className="text-left p-4 font-semibold text-green-800">Username</th>
                        <th className="text-left p-4 font-semibold text-green-800">Level</th>
                        <th className="text-left p-4 font-semibold text-green-800">Streak</th>
                        <th className="text-left p-4 font-semibold text-green-800">XP</th>
                        <th className="text-left p-4 font-semibold text-green-800">Admin</th>
                        <th className="text-left p-4 font-semibold text-green-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="border-b hover:bg-green-50/50">
                          <td className="p-4">{user.email}</td>
                          <td className="p-4">{user.username}</td>
                          <td className="p-4 capitalize">{user.fitness_level}</td>
                          <td className="p-4">{user.streak_data?.current || 0}</td>
                          <td className="p-4">{user.total_xp}</td>
                          <td className="p-4">
                            {user.is_admin ? (
                              <span className="text-green-600 font-semibold">Yes</span>
                            ) : (
                              <span className="text-gray-500">No</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={user.is_admin}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No users found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Routines Tab */}
        {activeTab === 'routines' && (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-800">Routine Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {analytics?.top_categories.map((category) => (
                    <div key={category.category} className="text-center p-4 bg-green-50 rounded">
                      <div className="text-xl font-bold">{category.count}</div>
                      <div className="text-sm text-gray-600">{category.category}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-800">User Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <div className="text-xl font-bold">
                      {Math.round((analytics?.user_retention.day_1 || 0) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Day 1 Retention</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <div className="text-xl font-bold">
                      {Math.round((analytics?.user_retention.day_7 || 0) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Day 7 Retention</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <div className="text-xl font-bold">
                      {Math.round((analytics?.user_retention.day_30 || 0) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Day 30 Retention</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
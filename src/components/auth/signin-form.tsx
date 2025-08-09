'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/dashboard',
        redirect: false
      })
      
      if (result?.error) {
        console.error('Sign in error:', result.error)
        toast.error('Sign in failed, but trying demo mode...')
      }
      
      if (result?.ok) {
        toast.success('Welcome to ChiZen! Redirecting...')
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Sign in failed:', error)
      toast.error('Authentication error')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemo = (userType: 'user' | 'admin') => {
    if (userType === 'admin') {
      setEmail('admin@chizen.app')
      setPassword('admin123')
    } else {
      setEmail('demo@chizen.app')
      setPassword('password123')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800">
            Welcome to ChiZen 🧘‍♀️
          </CardTitle>
          <CardDescription>
            Your AI-powered wellness journey starts here
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo Mode Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-green-800 font-semibold mb-2">✨ Demo Mode Active</div>
            <p className="text-sm text-green-700">
              Use any email and password to try ChiZen Fitness!<br/>
              <span className="font-mono bg-green-100 px-2 py-1 rounded text-xs">demo@chizen.app</span>
            </p>
          </div>

          {/* Demo Credentials Form */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            <Input
              type="email"
              placeholder="demo@chizen.app (or any email)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-center"
            />
            <Input
              type="password"
              placeholder="password123 (or any password)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-center"
            />
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Start Your Wellness Journey'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Quick Access</span>
            </div>
          </div>
          
          {/* Quick Demo Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => fillDemo('user')}
              variant="outline"
              size="sm"
              type="button"
            >
              👤 Demo User
            </Button>
            <Button
              onClick={() => fillDemo('admin')}
              variant="outline"
              size="sm"
              type="button"
            >
              👨‍💻 Admin Access
            </Button>
          </div>

          {/* Disabled Google Sign In */}
          <Button
            onClick={() => toast.info('Google OAuth not configured in demo mode. Use demo credentials above!')}
            variant="outline"
            className="w-full opacity-50"
            size="lg"
            disabled
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google Sign In (Demo Mode)
          </Button>
          
          <div className="text-center text-xs text-gray-500">
            🔒 Demo mode: All authentication is simulated for testing<br/>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
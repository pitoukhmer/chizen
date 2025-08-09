'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-green-800 mb-6">
            ChiZen Fitness
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Transform your wellness routine with AI-powered Tai Chi, breathwork, and mindfulness
          </p>
          <p className="text-lg text-gray-600 mb-12">
            Personalized 15-minute daily routines that adapt to your fitness level and schedule
          </p>
          
          <Button
            onClick={() => window.location.href = '/auth/signin'}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded-full"
          >
            Start Your Journey
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-12">
          Three Pillars of Wellness
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🧘</span>
              </div>
              <CardTitle className="text-green-700">ChiZen Move</CardTitle>
              <CardDescription>
                Flowing Tai Chi sequences that build strength and flexibility
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🫁</span>
              </div>
              <CardTitle className="text-blue-700">ChiZen Mind</CardTitle>
              <CardDescription>
                Guided breathwork exercises for mental clarity and calm
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💪</span>
              </div>
              <CardTitle className="text-purple-700">ChiZen Core</CardTitle>
              <CardDescription>
                Bodyweight movements for core strength and mobility
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-green-800 mb-8">
            Why Choose ChiZen?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span>AI-powered personalization</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span>No equipment needed</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span>15-minute daily routines</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span>Voice guidance with Master Lee</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span>Progress tracking & streaks</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span>Mobile & web access</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span>Beginner to advanced levels</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span>Community challenges</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center bg-green-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl mb-4">
              Ready to Transform Your Wellness?
            </CardTitle>
            <CardDescription className="text-green-100 text-lg mb-6">
              Join thousands of users who have discovered the power of mindful movement
            </CardDescription>
            <Button
              onClick={() => window.location.href = '/auth/signin'}
              size="lg"
              variant="secondary"
              className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 text-lg"
            >
              Get Started - It&apos;s Free
            </Button>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
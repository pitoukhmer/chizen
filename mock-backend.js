/**
 * Mock backend server for ChiZen Fitness development and testing
 * This provides basic API responses until the full FastAPI backend is configured
 */

const express = require('express')
const cors = require('cors')
const app = express()
const PORT = 8000

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// Mock data
let users = [
  {
    _id: 'admin-user-001',
    email: 'admin@chizen.app',
    username: 'ChiZen Admin',
    fitness_level: 'advanced',
    preferences: {
      duration: 20,
      focus_areas: ['strength', 'flexibility', 'mindfulness'],
      language: 'en'
    },
    streak_data: {
      current: 7,
      longest: 15,
      last_completed: new Date().toISOString()
    },
    total_xp: 1250,
    is_admin: true,
    is_active: true,
    created_at: new Date().toISOString()
  }
]

let routines = []

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  
  // Create demo user for any login
  const user = {
    _id: 'user-' + Date.now(),
    email: email,
    username: email.split('@')[0],
    fitness_level: 'beginner',
    preferences: {
      duration: 15,
      focus_areas: ['flexibility', 'mindfulness'],
      language: 'en'
    },
    streak_data: {
      current: Math.floor(Math.random() * 7),
      longest: Math.floor(Math.random() * 21),
      last_completed: new Date().toISOString()
    },
    total_xp: Math.floor(Math.random() * 500),
    is_admin: email.includes('admin'),
    is_active: true,
    created_at: new Date().toISOString()
  }
  
  users.push(user)
  
  res.json({
    access_token: 'demo-jwt-token-' + Date.now(),
    token_type: 'bearer',
    user: user
  })
})

app.post('/api/auth/register', (req, res) => {
  const { email, username, password, fitness_level } = req.body
  
  const user = {
    _id: 'user-' + Date.now(),
    email: email,
    username: username || email.split('@')[0],
    fitness_level: fitness_level || 'beginner',
    preferences: {
      duration: 15,
      focus_areas: ['flexibility', 'mindfulness'],
      language: 'en'
    },
    streak_data: {
      current: 0,
      longest: 0,
      last_completed: null
    },
    total_xp: 0,
    is_admin: false,
    is_active: true,
    created_at: new Date().toISOString()
  }
  
  users.push(user)
  res.status(201).json(user)
})

app.get('/api/auth/me', (req, res) => {
  // Return a demo user
  const demoUser = users[0] || {
    _id: 'demo-user',
    email: 'demo@chizen.app',
    username: 'Demo User',
    fitness_level: 'beginner',
    preferences: {
      duration: 15,
      focus_areas: ['flexibility', 'mindfulness'],
      language: 'en'
    },
    streak_data: {
      current: 3,
      longest: 7,
      last_completed: new Date().toISOString()
    },
    total_xp: 225,
    is_admin: false,
    is_active: true,
    created_at: new Date().toISOString()
  }
  
  res.json(demoUser)
})

app.post('/api/auth/oauth/google', (req, res) => {
  const { email, name, google_id } = req.body
  
  const user = {
    _id: 'google-user-' + Date.now(),
    email: email,
    username: name,
    fitness_level: 'beginner',
    preferences: {
      duration: 15,
      focus_areas: ['flexibility', 'mindfulness'],
      language: 'en'
    },
    streak_data: {
      current: 0,
      longest: 0,
      last_completed: null
    },
    total_xp: 0,
    is_admin: false,
    is_active: true,
    created_at: new Date().toISOString(),
    oauth_provider: 'google',
    oauth_id: google_id
  }
  
  users.push(user)
  
  res.json({
    access_token: 'google-jwt-token-' + Date.now(),
    token_type: 'bearer',
    user: user
  })
})

// Routine routes
app.get('/api/routine/today', (req, res) => {
  // Return a demo routine or null if none exists
  const todayRoutine = {
    _id: 'routine-' + new Date().toDateString(),
    routine_id: 'today-' + Date.now(),
    title: 'Morning Mindful Movement',
    total_duration: 15,
    focus_area: 'Balance & Flexibility',
    difficulty_level: 2,
    blocks: [
      {
        type: 'mind',
        name: 'Centering Breath',
        duration_seconds: 180,
        instructions: [
          'Sit comfortably with spine straight',
          'Take 5 deep breaths to center yourself',
          'Focus on the sensation of breathing'
        ],
        difficulty: 1,
        audio_cue: 'Welcome to your practice. Let\'s begin by finding your center.',
        benefits: ['Reduces stress', 'Improves focus']
      },
      {
        type: 'move',
        name: 'Flowing River',
        duration_seconds: 480,
        instructions: [
          'Stand with feet hip-width apart',
          'Raise arms slowly like flowing water',
          'Move with smooth, continuous motion',
          'Coordinate breath with movement'
        ],
        difficulty: 2,
        audio_cue: 'Move like water, smooth and continuous.',
        benefits: ['Improves flexibility', 'Enhances coordination']
      },
      {
        type: 'core',
        name: 'Gentle Strength',
        duration_seconds: 240,
        instructions: [
          'Modified plank against wall',
          'Hold for 30 seconds, rest 30 seconds',
          'Repeat 4 times with mindful breathing'
        ],
        difficulty: 2,
        audio_cue: 'Build strength from your center.',
        benefits: ['Strengthens core', 'Improves posture']
      }
    ],
    completion_xp: 80,
    daily_wisdom: 'The journey of a thousand miles begins with a single step.',
    created_at: new Date().toISOString()
  }
  
  res.json(todayRoutine)
})

app.post('/api/routine/generate', (req, res) => {
  const newRoutine = {
    _id: 'routine-' + Date.now(),
    routine_id: 'generated-' + Date.now(),
    title: ['Morning Energy Flow', 'Evening Calm', 'Mindful Movement', 'Balance & Grace'][Math.floor(Math.random() * 4)],
    total_duration: [10, 15, 20][Math.floor(Math.random() * 3)],
    focus_area: ['Balance & Flexibility', 'Strength & Mobility', 'Relaxation & Calm'][Math.floor(Math.random() * 3)],
    difficulty_level: Math.floor(Math.random() * 3) + 1,
    blocks: [
      {
        type: 'mind',
        name: 'Breath Awareness',
        duration_seconds: 180,
        instructions: [
          'Find a comfortable seated position',
          'Close your eyes gently',
          'Focus on natural breath rhythm'
        ],
        difficulty: 1,
        audio_cue: 'Let\'s begin with mindful breathing.',
        benefits: ['Calms mind', 'Improves focus']
      },
      {
        type: 'move',
        name: 'Gentle Flow',
        duration_seconds: 420,
        instructions: [
          'Stand tall with feet grounded',
          'Move with intention and grace',
          'Flow between postures smoothly'
        ],
        difficulty: 2,
        audio_cue: 'Move with the rhythm of your breath.',
        benefits: ['Improves flexibility', 'Enhances balance']
      },
      {
        type: 'core',
        name: 'Foundation Building',
        duration_seconds: 300,
        instructions: [
          'Engage your core gently',
          'Hold positions with control',
          'Breathe steadily throughout'
        ],
        difficulty: 2,
        audio_cue: 'Strengthen from your center.',
        benefits: ['Builds core strength', 'Improves stability']
      }
    ],
    completion_xp: Math.floor(Math.random() * 50) + 50,
    daily_wisdom: [
      'Progress, not perfection.',
      'Every breath is a new beginning.',
      'Strength grows in the moments when you think you can\'t go on.',
      'The body achieves what the mind believes.'
    ][Math.floor(Math.random() * 4)],
    created_at: new Date().toISOString()
  }
  
  routines.push(newRoutine)
  res.json(newRoutine)
})

app.post('/api/routine/complete', (req, res) => {
  const { routine_id, duration_completed, exercises_completed, feedback } = req.body
  
  const xpEarned = Math.floor(Math.random() * 50) + 50
  
  res.json({
    xp_earned: xpEarned,
    streak_updated: true,
    new_streak: Math.floor(Math.random() * 10) + 1
  })
})

app.get('/api/progress', (req, res) => {
  res.json({
    current_streak: Math.floor(Math.random() * 7) + 1,
    longest_streak: Math.floor(Math.random() * 15) + 5,
    total_xp: Math.floor(Math.random() * 1000) + 200,
    total_sessions: Math.floor(Math.random() * 30) + 10,
    last_7_days: Array.from({length: 7}, () => Math.random() > 0.3),
    monthly_stats: {
      sessions_this_month: Math.floor(Math.random() * 25) + 5,
      xp_this_month: Math.floor(Math.random() * 500) + 100
    }
  })
})

// Newsletter routes
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email } = req.body
  console.log('Newsletter subscription:', email)
  
  res.json({
    message: 'Successfully subscribed to ChiZen newsletter!'
  })
})

// Admin routes
app.get('/api/admin/users', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 50
  
  res.json({
    users: users,
    total: users.length,
    page: page,
    pages: Math.ceil(users.length / limit)
  })
})

app.get('/api/admin/analytics', (req, res) => {
  res.json({
    total_users: users.length,
    active_users: Math.floor(users.length * 0.8),
    total_routines: routines.length,
    completion_rate: 0.75,
    avg_streak: 4.2,
    top_categories: [
      { category: 'Balance & Flexibility', count: 45 },
      { category: 'Strength & Mobility', count: 32 },
      { category: 'Relaxation & Calm', count: 28 }
    ],
    daily_signups: Array.from({length: 7}, (_, i) => ({
      date: new Date(Date.now() - (6-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 10) + 1
    })),
    user_retention: {
      day_1: 0.85,
      day_7: 0.62,
      day_30: 0.45
    }
  })
})

// Voice routes
app.post('/api/voice/generate', (req, res) => {
  const { text, voice_id } = req.body
  
  // Mock response - in production this would call ElevenLabs
  res.json({
    audio_url: `https://mock-audio-url.com/voice/${encodeURIComponent(text)}.mp3`
  })
})

app.listen(PORT, () => {
  console.log(`🚀 ChiZen Mock Backend running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`📚 Frontend should connect to: http://localhost:3000`)
  console.log(`✅ Ready for testing!`)
})
# ChiZen Fitness - Product Requirements Document

**Version:** 2.0  
**Date:** August 7, 2025  
**Product Owner:** Solo Developer  
**Development Method:** AI-Assisted (GitHub Copilot)  
**Platform:** Web + Mobile (Progressive Web App)  
**Stage:** MVP to Production

---

## 1. Executive Summary

ChiZen Fitness is a holistic, AI-powered wellness application that transforms daily wellness routines through the integration of Tai Chi, breathwork, bodyweight movement, and mindfulness practices. The platform delivers personalized 15-minute daily routines through an elegant, modern interface with AI voice coaching, helping users build sustainable wellness habits without any equipment requirements.

## 2. Product Vision & Goals

### Vision Statement
To democratize holistic wellness by making ancient practices accessible through modern AI technology, creating a global community of mindful movement practitioners.

### Primary Goals
- Launch production-ready PWA with mobile-first responsive design
- Achieve 85% user retention within first 60 days
- Deliver personalized AI-generated routines under 15 minutes
- Build scalable architecture supporting 10,000+ concurrent users
- Create seamless cross-platform experience (web/mobile)

### Success Metrics
- Daily Active Users (DAU): 5,000+ within 3 months
- Average session duration: 12+ minutes
- Streak retention rate: 40% maintain 7-day streaks
- User satisfaction score: 4.5+ stars

## 3. User Personas

### Primary Users
1. **Busy Professional (Sarah, 32)**
   - Limited time for wellness
   - Seeks stress relief and energy boost
   - Prefers guided, structured routines
   - Mobile-first user

2. **Wellness Explorer (Michael, 28)**
   - Interested in holistic practices
   - Wants to combine movement with mindfulness
   - Values personalization and progress tracking
   - Social features important

3. **Senior Practitioner (Linda, 65)**
   - Needs low-impact exercise options
   - Values clear voice guidance
   - Prefers simple interface
   - Desktop and tablet user

### Secondary Users
- Meditation practitioners seeking movement integration
- Yoga enthusiasts exploring Tai Chi
- Fitness beginners wanting gentle introduction

## 4. Core Features & Requirements

### 4.1 User Management & Authentication

**Feature ID:** F001  
**Priority:** P0 (Critical)

- OAuth2 authentication (Google, Apple, Email)
- Profile creation with fitness assessment
- Multi-language support (English, Khmer, Thai)
- Password reset and account recovery
- GDPR-compliant data handling
- Session management with JWT tokens

### 4.2 AI-Powered Routine Generation

**Feature ID:** F002  
**Priority:** P0 (Critical)

- GPT-4o integration for daily routine creation
- Personalization based on:
  - User fitness level
  - Available time (5-15 minutes)
  - Previous completion history
  - Energy levels (user input)
- Three core modules:
  - **ChiZen Move**: Tai Chi sequences
  - **ChiZen Mind**: Breathwork exercises
  - **ChiZen Core**: Mobility and strength
- Dynamic difficulty adjustment
- Alternative exercises for limitations

### 4.3 Audio-Visual Guidance System

**Feature ID:** F003  
**Priority:** P0 (Critical)

- ElevenLabs voice synthesis (Master Lee persona)
- Real-time audio cues for movements
- Visual pose references (animated/video)
- Countdown timers and progress indicators
- Background music options
- Offline mode for downloaded content

### 4.4 Progress Tracking & Analytics

**Feature ID:** F004  
**Priority:** P1 (High)

- Daily streak counter
- XP/points system
- Visual progress charts:
  - 7-day activity heatmap
  - 30-day trend analysis
  - Category completion rates
- Personal records and milestones
- Export data functionality

### 4.5 Social & Challenges

**Feature ID:** F005  
**Priority:** P1 (High)

- 7/14/30-day challenges
- Friend invitations and connections
- Global and friend leaderboards
- Achievement badges
- Share progress to social media
- Community feed (future enhancement)

### 4.6 Content Management System

**Feature ID:** F006  
**Priority:** P0 (Critical)

- **Admin Dashboard:**
  - User management (CRUD operations)
  - Create/edit blog posts and announcements
  - Routine template management
  - Content library organization
  - Analytics dashboard
  - System health monitoring

- **Content Archives:**
  - Searchable routine history
  - Saved favorite routines
  - Educational content library
  - Video/audio archive access
  - Categorized by difficulty/type

### 4.7 Newsletter & Communications

**Feature ID:** F007  
**Priority:** P2 (Medium)

- Newsletter subscription widget
- SendGrid integration for email campaigns
- Subscription preferences management
- Welcome email series
- Weekly wellness tips
- Unsubscribe compliance

### 4.8 Notification System

**Feature ID:** F008  
**Priority:** P1 (High)

- Push notifications (Firebase Cloud Messaging)
- Customizable reminder times
- Motivational messages
- Streak reminders
- Challenge updates
- In-app notification center

## 5. Technical Architecture

### 5.1 Technology Stack

**Backend:**
- Framework: FastAPI (Python 3.11+)
- Database: MongoDB (primary), Redis (caching)
- Authentication: OAuth2, JWT
- API Documentation: OpenAPI/Swagger

**Frontend:**
- Web: React.js 18+ with TypeScript
- Mobile: React Native / PWA
- State Management: Redux Toolkit
- UI Framework: Tailwind CSS + Shadcn/ui
- Animation: Framer Motion

**AI & Media Services:**
- OpenAI GPT-4o (routine generation)
- ElevenLabs (voice synthesis)
- Replicate API (pose analysis - future)
- Firebase Storage (media files)
- Google Drive API (backup storage)

**Infrastructure:**
- Hosting: Vercel (frontend) / GCP Cloud Run (backend)
- CDN: Cloudflare
- Monitoring: Sentry, Google Analytics
- CI/CD: GitHub Actions

### 5.2 Detailed Implementation Guide

#### 5.2.1 Authentication Implementation
```python
# FastAPI OAuth2 Setup (backend/auth.py)
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

# Quick setup with environment variables
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# MongoDB User Model
user_schema = {
    "_id": "ObjectId",
    "email": "string",
    "username": "string",
    "hashed_password": "string",
    "fitness_level": "beginner|intermediate|advanced",
    "preferences": {
        "duration": "5-15",
        "focus_areas": ["strength", "flexibility", "mindfulness"],
        "language": "en|km|th"
    },
    "streak_data": {
        "current": 0,
        "longest": 0,
        "last_completed": "datetime"
    },
    "created_at": "datetime",
    "is_admin": "boolean"
}
```

#### 5.2.2 AI Routine Generation
```python
# AI Integration (backend/ai_service.py)
import openai
from typing import Dict, List
import json

class RoutineGenerator:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        self.eleven_labs_key = os.getenv("ELEVEN_LABS_KEY")
        
    async def generate_daily_routine(self, user_profile: Dict) -> Dict:
        prompt = f"""
        Generate a personalized {user_profile['duration']} minute wellness routine.
        User level: {user_profile['fitness_level']}
        Focus: {user_profile['focus_areas']}
        
        Return JSON format:
        {{
            "routine_id": "uuid",
            "blocks": [
                {{
                    "type": "move|mind|core",
                    "name": "exercise name",
                    "duration_seconds": 60,
                    "instructions": ["step1", "step2"],
                    "difficulty": 1-5,
                    "audio_cue": "Master Lee says..."
                }}
            ],
            "total_duration": minutes,
            "focus_area": "primary focus"
        }}
        """
        
        response = await openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "system", "content": prompt}],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
```

#### 5.2.3 Frontend Components Structure
```typescript
// Frontend Component Architecture (src/components/)
// Using v0.dev and Shadcn/ui for rapid development

// 1. Layout Components
src/
  components/
    layout/
      Header.tsx         // Navigation with user menu
      MobileNav.tsx      // Bottom tab navigation
      AdminSidebar.tsx   // Admin panel sidebar
    
    // 2. Core Feature Components
    routine/
      RoutineCard.tsx    // Daily routine display
      ExerciseTimer.tsx  // Countdown with audio
      ProgressRing.tsx   // Visual progress indicator
    
    // 3. Reusable UI Components (Shadcn/ui)
    ui/
      button.tsx
      card.tsx
      dialog.tsx
      form.tsx
      toast.tsx
    
    // 4. Feature Modules
    features/
      Dashboard.tsx      // Main user dashboard
      AdminPanel.tsx     // Admin management
      Archives.tsx       // Content archives
      Newsletter.tsx     // Subscription form

// State Management (src/store/)
store/
  slices/
    authSlice.ts       // User authentication
    routineSlice.ts    // Daily routines
    progressSlice.ts   // User progress
  store.ts             // Redux store configuration
```

#### 5.2.4 Database Queries Optimization
```javascript
// MongoDB Aggregation Pipelines (backend/db_queries.py)

// Get user daily routine with history
daily_routine_pipeline = [
    {"$match": {"user_id": user_id}},
    {"$sort": {"created_at": -1}},
    {"$limit": 1},
    {"$lookup": {
        "from": "user_progress",
        "localField": "user_id",
        "foreignField": "user_id",
        "as": "progress"
    }},
    {"$project": {
        "routine": 1,
        "streak": "$progress.streak_data",
        "last_7_days": {
            "$slice": ["$progress.history", -7]
        }
    }}
]

// Leaderboard with pagination
leaderboard_pipeline = [
    {"$match": {"active": True}},
    {"$sort": {"streak_data.current": -1, "total_xp": -1}},
    {"$skip": skip},
    {"$limit": limit},
    {"$project": {
        "username": 1,
        "avatar": 1,
        "streak": "$streak_data.current",
        "total_xp": 1,
        "rank": {"$add": [skip, {"$indexOfArray": ["$ROOT._id", "$_id"]}]}
    }}
]
```

#### 5.2.5 API Endpoints Implementation
```python
# FastAPI Routes (backend/routes/)

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
import motor.motor_asyncio

router = APIRouter()
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client.chizen_fitness

@router.post("/api/routine/generate")
async def generate_routine(
    current_user: User = Depends(get_current_user)
):
    # Use Redis cache first
    cached = await redis_client.get(f"routine:{current_user.id}:{today}")
    if cached:
        return json.loads(cached)
    
    # Generate new routine
    generator = RoutineGenerator()
    routine = await generator.generate_daily_routine(current_user.profile)
    
    # Save to DB and cache
    await db.routines.insert_one(routine)
    await redis_client.setex(
        f"routine:{current_user.id}:{today}",
        3600,  # 1 hour cache
        json.dumps(routine)
    )
    
    return routine

@router.get("/api/content/archives")
async def get_archives(
    page: int = 1,
    limit: int = 20,
    category: Optional[str] = None
):
    query = {"published": True}
    if category:
        query["category"] = category
    
    cursor = db.content.find(query)
    cursor.sort("created_at", -1)
    cursor.skip((page - 1) * limit)
    cursor.limit(limit)
    
    content = await cursor.to_list(length=limit)
    total = await db.content.count_documents(query)
    
    return {
        "content": content,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }
```

#### 5.2.6 Voice Synthesis Integration
```python
# ElevenLabs Integration (backend/voice_service.py)
import aiohttp
import asyncio
from typing import List

class VoiceService:
    def __init__(self):
        self.api_key = os.getenv("ELEVEN_LABS_KEY")
        self.voice_id = "master_lee_voice_id"  # Pre-configured voice
        self.base_url = "https://api.elevenlabs.io/v1"
        
    async def generate_audio_cues(self, instructions: List[str]) -> List[str]:
        """Generate audio files for exercise instructions"""
        audio_urls = []
        
        async with aiohttp.ClientSession() as session:
            for instruction in instructions:
                # Generate audio
                async with session.post(
                    f"{self.base_url}/text-to-speech/{self.voice_id}",
                    headers={"xi-api-key": self.api_key},
                    json={
                        "text": instruction,
                        "model_id": "eleven_monolingual_v1",
                        "voice_settings": {
                            "stability": 0.75,
                            "similarity_boost": 0.75
                        }
                    }
                ) as response:
                    audio_data = await response.read()
                    
                    # Upload to Firebase Storage
                    url = await self.upload_to_storage(audio_data)
                    audio_urls.append(url)
        
        return audio_urls
```

#### 5.2.7 Admin Dashboard Quick Setup
```typescript
// Admin Panel using React-Admin (src/admin/AdminApp.tsx)
import { Admin, Resource, ListGuesser, EditGuesser } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';

// Quick admin setup with auto-generated CRUD
const AdminApp = () => (
    <Admin dataProvider={dataProvider} authProvider={authProvider}>
        <Resource 
            name="users" 
            list={UserList} 
            edit={UserEdit} 
            create={UserCreate}
        />
        <Resource 
            name="posts" 
            list={PostList} 
            edit={PostEdit} 
            create={PostCreate}
        />
        <Resource 
            name="routines" 
            list={RoutineList} 
            show={RoutineShow}
        />
        <Resource 
            name="analytics" 
            list={AnalyticsDashboard}
        />
    </Admin>
);

// Custom User List with filters
const UserList = () => (
    <List filters={<UserFilter />}>
        <Datagrid>
            <TextField source="username" />
            <EmailField source="email" />
            <TextField source="fitness_level" />
            <NumberField source="streak_data.current" label="Streak" />
            <DateField source="created_at" />
            <EditButton />
        </Datagrid>
    </List>
);
```

#### 5.2.8 Newsletter Implementation
```typescript
// Newsletter Component (src/components/Newsletter.tsx)
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';

export const NewsletterForm = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            if (response.ok) {
                toast.success('Successfully subscribed!');
                setEmail('');
                
                // Track conversion
                gtag('event', 'newsletter_signup', {
                    method: 'footer_form'
                });
            }
        } catch (error) {
            toast.error('Subscription failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Stay Mindful</h3>
            <p className="text-gray-600 mb-6">
                Weekly wellness tips and exclusive routines delivered to your inbox
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-4">
                <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                    {loading ? 'Subscribing...' : 'Subscribe'}
                </Button>
            </form>
        </div>
    );
};
```

### 5.3 API Endpoints

```
Core Endpoints:
POST   /api/auth/register
POST   /api/auth/login
GET    /api/routine/generate
GET    /api/routine/today
POST   /api/routine/complete
GET    /api/progress/{user_id}
GET    /api/leaderboard
POST   /api/social/invite
GET    /api/content/archives
POST   /api/newsletter/subscribe

Admin Endpoints:
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
POST   /api/admin/posts
GET    /api/admin/analytics
POST   /api/admin/content/upload
```

### 5.4 Environment Variables Configuration
```bash
# .env.local (Frontend)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# .env (Backend)
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/chizen
REDIS_URL=redis://localhost:6379
SECRET_KEY=your_jwt_secret_key
OPENAI_API_KEY=sk-...
ELEVEN_LABS_KEY=your_eleven_labs_key
SENDGRID_API_KEY=SG...
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_secret
```

### 5.5 Database Schema

**Users Collection:**
- user_id (UUID)
- email, username, profile_image
- fitness_level, goals, preferences
- streak_data, total_xp
- created_at, last_active

**Routines Collection:**
- routine_id (UUID)
- user_id (reference)
- routine_blocks (JSON)
- duration, difficulty
- completed_at, feedback

**Content Collection:**
- content_id (UUID)
- type (post/video/audio)
- title, description, media_url
- category, tags
- created_by, created_at

## 6. Non-Functional Requirements

### 6.1 Performance
- Page load time: <2 seconds
- API response time: <500ms (p95)
- Daily routine generation: <3 seconds
- Support 10,000 concurrent users
- 60fps animations on modern devices

### 6.2 Security
- HTTPS everywhere
- Data encryption at rest and in transit
- OWASP Top 10 compliance
- Rate limiting on all endpoints
- Regular security audits
- GDPR/CCPA compliance

### 6.3 Accessibility
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode
- Font size adjustments
- Alternative text for all media

### 6.4 Reliability
- 99.9% uptime SLA
- Automated backups every 6 hours
- Disaster recovery plan
- Graceful degradation
- Offline mode for core features

## 7. Design Requirements

### 7.1 Visual Design
- Modern, minimalist aesthetic
- Calming color palette (earth tones)
- Consistent spacing and typography
- Dark mode support
- Smooth transitions and micro-animations
- Mobile-first responsive design

### 7.2 User Experience
- Onboarding in <3 minutes
- Single-tap routine start
- Clear progress indicators
- Intuitive navigation
- Contextual help tooltips
- Error prevention over error handling

## 8. Development Approach

### 8.1 AI-Accelerated Development Strategy
- Primary tools: GitHub Copilot, Cursor, v0.dev, Claude
- Template-based architecture with AI-generated boilerplate
- Rapid prototyping with pre-built components
- Use existing libraries/SDKs to minimize custom code
- Focus on configuration over implementation

### 8.2 14-Day Sprint Plan

**Days 1-2: Project Setup & Authentication**
- Use NextAuth.js for instant OAuth setup
- Vercel deployment template
- MongoDB Atlas quick setup
- Tailwind + Shadcn/ui component library
- Environment variables configuration

**Days 3-4: Database & API Structure**
- FastAPI boilerplate generation
- MongoDB schemas with Mongoose/PyMongo
- CRUD endpoints using AI code generation
- Swagger auto-documentation
- Basic error handling middleware

**Days 5-6: AI Integration & Core Logic**
- OpenAI API integration (use Vercel AI SDK)
- Prompt templates for routine generation
- ElevenLabs quick integration
- Basic caching with Redis/Upstash

**Days 7-8: Frontend Core Features**
- Dashboard layout using v0.dev templates
- Routine display components
- Timer and progress tracking
- Mobile-responsive design
- Basic state management

**Days 9-10: Admin Panel & CMS**
- Admin dashboard using react-admin or AdminJS
- User management CRUD
- Content post creation
- Newsletter form with SendGrid/Resend
- Archives page with pagination

**Days 11-12: Essential Features**
- Streak tracking implementation
- Basic notification system
- Simple leaderboard
- Data visualization with Recharts
- PWA configuration

**Days 13-14: Testing & Deployment**
- Critical bug fixes only
- Vercel production deployment
- Environment configuration
- Basic monitoring setup
- Soft launch preparation

## 9. 2-Week MVP Scope & Acceptance Criteria

### Week 1 Deliverables (Must Complete)
**Day 1-2:**
- [ ] Project setup with Vercel/Next.js template
- [ ] MongoDB Atlas + Redis setup
- [ ] Google OAuth integration working
- [ ] Basic user schema implemented

**Day 3-4:**
- [ ] FastAPI backend with auto-docs
- [ ] User CRUD operations
- [ ] JWT authentication flow
- [ ] Basic error handling

**Day 5-6:**
- [ ] OpenAI integration for routine generation
- [ ] Basic prompt templates
- [ ] Routine storage in MongoDB
- [ ] Simple caching layer

**Day 7:**
- [ ] Frontend dashboard layout
- [ ] Routine display component
- [ ] Mobile responsive design
- [ ] Basic navigation

### Week 2 Deliverables (Core Features)
**Day 8-9:**
- [ ] Admin panel with user management
- [ ] Post creation for admin
- [ ] Content archives page
- [ ] Search functionality

**Day 10-11:**
- [ ] Newsletter subscription form
- [ ] SendGrid integration
- [ ] Streak tracking logic
- [ ] Progress visualization

**Day 12:**
- [ ] ElevenLabs voice integration (basic)
- [ ] Timer component
- [ ] PWA configuration

**Day 13-14:**
- [ ] Production deployment
- [ ] Environment configuration
- [ ] Critical bug fixes only
- [ ] Basic monitoring setup

### Deferred to Post-Launch
- Complex animations
- Social features
- Detailed analytics
- Pose correction
- Wearable integration
- Community features

## 10. Success Metrics & KPIs

### Launch Metrics (First 30 Days)
- 1,000+ registered users
- 60% DAU/MAU ratio
- 15% conversion to 7-day streak
- <3% crash rate
- 4.0+ app store rating

### Growth Metrics (90 Days)
- 5,000+ registered users
- 25% month-over-month growth
- 40% user retention rate
- 500+ newsletter subscribers
- 100+ daily social shares

## 11. Risk Management

### Technical Risks
- **AI API Costs**: Implement caching and rate limiting
- **Voice Synthesis Latency**: Pre-generate common phrases
- **Scalability**: Use auto-scaling and CDN
- **Data Loss**: Regular backups and redundancy

### User Adoption Risks
- **Complexity**: Progressive disclosure of features
- **Engagement Drop**: Gamification and social features
- **Competition**: Unique AI personalization differentiator

## 12. Future Enhancements (Post-MVP)

### Version 1.1 (Q1 2026)
- AI meditation generator
- Pose correction with computer vision
- Apple Watch / Fitbit integration
- Group challenges

### Version 1.2 (Q2 2026)
- Live instructor sessions
- Nutrition tracking integration
- Advanced analytics for users
- Corporate wellness programs

### Version 1.3 (Q3 2026)
- VR/AR exercise guidance
- AI health coach chat
- Marketplace for custom routines
- Multi-language voice options

## 13. Resources & Documentation

### Development Resources
- API Documentation: `/docs/api`
- Component Library: Storybook
- Design System: Figma
- Project Management: GitHub Projects
- Communication: Discord/Slack

### External Documentation
- OpenAI API: https://platform.openai.com/docs
- ElevenLabs: https://docs.elevenlabs.io
- Firebase: https://firebase.google.com/docs
- MongoDB: https://docs.mongodb.com

## 15. AI Code Generation Templates & Prompts

### 15.1 Cursor/Copilot Prompts for Rapid Development

#### Project Initialization
```
"Create a Next.js 14 app with TypeScript, Tailwind CSS, Shadcn/ui, 
MongoDB connection, NextAuth with Google OAuth, and Vercel deployment config"
```

#### Backend Generation
```
"Generate a FastAPI backend with MongoDB motor, JWT auth, 
OpenAI integration, rate limiting, CORS, and Swagger docs"
```

#### Component Templates
```
"Create a React component for a 15-minute workout timer with:
- Countdown display
- Play/pause controls  
- Audio cues at intervals
- Progress ring animation
- Mobile responsive design using Tailwind"
```

### 15.2 Quick Start Commands
```bash
# Day 1: Project Setup (30 minutes with AI)
npx create-next-app@latest chizen-fitness --typescript --tailwind --app
npx shadcn-ui@latest init
npm install @vercel/analytics @vercel/og next-auth mongodb

# Backend Setup (30 minutes)
pip install fastapi uvicorn motor python-jose passlib python-multipart
pip install openai elevenlabs-api redis sendgrid

# One-click deployments
vercel --prod  # Frontend
gcloud run deploy  # Backend
```

### 15.3 Pre-built Integrations to Use
- **Auth**: NextAuth.js (5 min setup)
- **Database**: MongoDB Atlas (free tier)
- **Email**: Resend/SendGrid (instant API)
- **Storage**: Vercel Blob/Firebase
- **Analytics**: Vercel Analytics
- **Monitoring**: Sentry (auto-setup)

## 16. Critical Path for 2-Week Delivery

### What to Build (80% effort)
1. User auth with Google OAuth
2. AI routine generation (basic)
3. Simple dashboard UI
4. Admin CRUD panel
5. Newsletter form
6. Archives page
7. Mobile responsive design

### What to Use Pre-built (20% effort)
1. UI components (Shadcn/ui)
2. Authentication (NextAuth)
3. Admin panel (React-Admin)
4. Charts (Recharts)
5. Database ORM (Prisma/Mongoose)
6. Email service (SendGrid)

### What to Skip for MVP
- Custom animations
- Complex voice synthesis
- Social features
- Detailed analytics
- Payment integration
- Native mobile app
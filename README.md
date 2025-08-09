# ChiZen Fitness 🧘‍♀️

AI-powered wellness Progressive Web App combining Tai Chi, breathwork, and mindfulness practices. Built with Next.js, FastAPI, and modern AI services.

## ✨ Features

- 🤖 **AI-Powered Routines**: Personalized 15-minute daily wellness sessions using GPT-4o
- 🎯 **Three Core Modules**: ChiZen Move (Tai Chi), ChiZen Mind (Breathwork), ChiZen Core (Strength)
- 🔊 **Voice Guidance**: AI voice coaching with Master Lee persona (ElevenLabs)
- 📊 **Progress Tracking**: Streak counters, XP system, and visual analytics
- 👥 **Social Features**: Challenges, leaderboards, and community engagement
- 📱 **PWA Ready**: Mobile-first design with offline capabilities
- 🔐 **Secure Auth**: Google OAuth integration with NextAuth.js

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript and App Router
- **UI**: Tailwind CSS + Shadcn/ui components
- **Auth**: NextAuth.js with Google OAuth
- **State**: Redux Toolkit
- **Animation**: Framer Motion

### Backend
- **API**: FastAPI (Python)
- **Database**: MongoDB + Redis (caching)
- **Auth**: JWT tokens with OAuth2
- **AI**: OpenAI GPT-4o + ElevenLabs voice synthesis

### Infrastructure
- **Frontend**: Vercel
- **Backend**: Google Cloud Run
- **Database**: MongoDB Atlas
- **Monitoring**: Sentry + Google Analytics

## 🛠 Development Setup

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- MongoDB Atlas account
- Google OAuth credentials

### 1. Clone and Install

```bash
git clone <repository-url>
cd chizen
npm install
npm run install:backend
```

### 2. Environment Configuration

Copy environment files and configure:

```bash
cp .env.example .env.local
cp backend/.env.example backend/.env
```

Configure your `.env.local`:
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/chizen-fitness
```

Configure your `backend/.env`:
```bash
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/chizen-fitness
OPENAI_API_KEY=sk-your-openai-key
ELEVEN_LABS_KEY=your-elevenlabs-key
SECRET_KEY=your-jwt-secret
```

### 3. Run Development Servers

```bash
# Run both frontend and backend
npm run dev:full

# Or run separately
npm run dev          # Frontend only (port 3000)
npm run dev:backend  # Backend only (port 8000)
```

## 📁 Project Structure

```
chizen/
├── src/                    # Frontend (Next.js)
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── landing/      # Landing page
│   │   └── ui/           # Shadcn/ui components
│   └── lib/              # Utilities and configurations
├── backend/               # Backend (FastAPI)
│   ├── app/
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # Pydantic models
│   │   ├── services/     # Business logic
│   │   └── core/         # Database, auth, deps
│   └── requirements.txt
├── public/               # Static assets
└── docs/                # Documentation
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/oauth/google` - Google OAuth

### Routines
- `GET /api/routine/today` - Get daily routine
- `POST /api/routine/generate` - Generate new routine
- `POST /api/routine/complete` - Mark routine complete

### Admin
- `GET /api/admin/users` - User management
- `GET /api/admin/analytics` - Platform analytics

## 🚢 Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Google Cloud Run)
```bash
gcloud run deploy chizen-api \
  --source=./backend \
  --platform=managed \
  --region=us-central1
```

## 📋 Development Roadmap

### Week 1 (Days 1-7)
- ✅ Project setup and authentication
- ✅ Database schemas and API structure  
- ✅ Basic frontend components
- ⏳ AI integration for routine generation

### Week 2 (Days 8-14)
- ⏳ Admin panel and content management
- ⏳ Progress tracking and analytics
- ⏳ PWA configuration
- ⏳ Production deployment

### Post-MVP
- Voice synthesis integration
- Social features and challenges
- Advanced analytics dashboard
- Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4o API
- ElevenLabs for voice synthesis
- Vercel for hosting and deployment
- Shadcn for beautiful UI components

---

Built with ❤️ for mindful wellness practitioners worldwide.

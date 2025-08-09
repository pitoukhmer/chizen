# ChiZen Fitness - Deployment Guide 🚀

## Quick Start (5 minutes)

### 1. Environment Setup

Create your environment files:

```bash
# Frontend (.env.local)
cp .env.example .env.local

# Backend (backend/.env)  
cp backend/.env.example backend/.env
```

### 2. Install Dependencies

```bash
# Frontend
npm install --legacy-peer-deps

# Backend
cd backend && pip install -r requirements.txt
```

### 3. Development Mode

```bash
# Start both frontend and backend
npm run dev:full

# Or separately:
npm run dev          # Frontend (port 3000)
npm run dev:backend  # Backend (port 8000)
```

Visit `http://localhost:3000` to see your app!

## Production Deployment

### Frontend (Vercel) - Recommended

1. **Connect GitHub Repository**
   ```bash
   # Push your code to GitHub
   git init
   git add .
   git commit -m "🎉 Initial ChiZen Fitness PWA"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard:
     ```
     NEXTAUTH_URL=https://your-domain.vercel.app
     NEXTAUTH_SECRET=your-production-secret
     GOOGLE_CLIENT_ID=your-google-oauth-id
     GOOGLE_CLIENT_SECRET=your-google-oauth-secret
     ```

### Backend (Google Cloud Run) - Recommended

1. **Prepare for deployment**
   ```bash
   cd backend
   
   # Create Dockerfile
   cat > Dockerfile << EOF
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   EOF
   ```

2. **Deploy to Cloud Run**
   ```bash
   # Build and deploy
   gcloud run deploy chizen-api \
     --source=. \
     --platform=managed \
     --region=us-central1 \
     --allow-unauthenticated
   ```

### Database Setup

#### MongoDB Atlas (Free Tier)

1. Visit [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Add to your environment variables:
   ```
   MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/chizen-fitness
   ```

#### Redis (Optional - for caching)

Use Upstash Redis (free tier):
1. Visit [upstash.com](https://upstash.com)
2. Create Redis database
3. Add connection URL:
   ```
   REDIS_URL=redis://...
   ```

## Required API Keys

### OpenAI (Required for AI routines)
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Add to environment:
   ```
   OPENAI_API_KEY=sk-...
   ```

### ElevenLabs (Optional - for voice)
1. Visit [elevenlabs.io](https://elevenlabs.io)
2. Create account and get API key
3. Add to environment:
   ```
   ELEVEN_LABS_KEY=your-key
   ```

### SendGrid (Optional - for emails)
1. Visit [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Add to environment:
   ```
   SENDGRID_API_KEY=SG...
   FROM_EMAIL=noreply@yourdomain.com
   ```

## OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.vercel.app` (production)
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.vercel.app/api/auth/callback/google`

## Environment Variables Reference

### Frontend (.env.local)
```bash
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret

# API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Analytics (Optional)
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

### Backend (.env)
```bash
# Database
MONGODB_URL=mongodb://localhost:27017/chizen-fitness
REDIS_URL=redis://localhost:6379

# Authentication
SECRET_KEY=your-jwt-secret-key

# AI Services
OPENAI_API_KEY=sk-...
ELEVEN_LABS_KEY=your-elevenlabs-key

# Email
SENDGRID_API_KEY=SG...
FROM_EMAIL=noreply@chizen.app

# OAuth
GOOGLE_CLIENT_ID=your-oauth-client-id
GOOGLE_CLIENT_SECRET=your-oauth-secret

# Environment
ENVIRONMENT=production
```

## Testing Your Deployment

### Health Checks
```bash
# Frontend health
curl https://your-frontend-domain.vercel.app/

# Backend health  
curl https://your-backend-domain.run.app/health
```

### Feature Testing
1. **Authentication**: Sign in with Google or demo credentials
2. **Routine Generation**: Click "Generate Today's Routine"
3. **Dashboard**: Check stats and navigation
4. **Newsletter**: Test subscription form
5. **Mobile**: Test responsive design

## Monitoring & Analytics

### Vercel Analytics
- Automatically enabled for Vercel deployments
- View performance metrics in Vercel dashboard

### Google Analytics (Optional)
```bash
# Add to your .env.local
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

### Error Tracking with Sentry (Optional)
```bash
npm install @sentry/nextjs
```

## Troubleshooting

### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

### Authentication Issues
- Ensure NEXTAUTH_URL matches your domain exactly
- Check Google OAuth redirect URIs are correct
- Verify NEXTAUTH_SECRET is set in production

### Database Connection
- Whitelist your deployment IP in MongoDB Atlas
- Test connection string locally first

### API Issues
- Check CORS settings in FastAPI
- Ensure environment variables are set
- Monitor backend logs for errors

## Performance Optimization

### Frontend
- Images are optimized with Next.js Image component
- PWA caching enabled
- Bundle size optimized with tree shaking

### Backend
- Redis caching for routine generation
- Database query optimization
- Async operations for AI calls

## Security Checklist

- ✅ HTTPS enabled in production
- ✅ Environment variables secured
- ✅ JWT tokens with expiration
- ✅ Input validation on all endpoints
- ✅ CORS properly configured
- ✅ Rate limiting implemented
- ✅ No secrets in code

## Support

For deployment issues:
1. Check the troubleshooting section above
2. Review environment variables carefully
3. Test each component individually
4. Check logs for specific error messages

Happy deploying! 🧘‍♀️✨
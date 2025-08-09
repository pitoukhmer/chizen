# ChiZen Fitness - Complete Deployment Guide 🚀

This guide will walk you through deploying ChiZen Fitness to production using Vercel (frontend) and Google Cloud Run (backend).

## Prerequisites

1. **GitHub Account** - Code repository
2. **Vercel Account** - Frontend hosting
3. **Google Cloud Account** - Backend hosting  
4. **MongoDB Atlas Account** - Database
5. **API Keys** - OpenAI, ElevenLabs, SendGrid, Google OAuth

## Step 1: Push Code to GitHub

```bash
# If you haven't already:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chizen-fitness.git
git push -u origin main
```

## Step 2: Set Up External Services

### 2.1 MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Create database user and get connection string
4. Format: `mongodb+srv://username:password@cluster.mongodb.net/chizen-fitness`

### 2.2 Google OAuth (Authentication)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized domains (your Vercel domain)

### 2.3 OpenAI API (AI Routines)
1. Go to [OpenAI](https://platform.openai.com)
2. Create API key starting with `sk-`
3. Add billing method for usage

### 2.4 ElevenLabs (Voice Synthesis)
1. Go to [ElevenLabs](https://elevenlabs.io)
2. Create account and get API key
3. Optional: Clone "Master Lee" voice

### 2.5 SendGrid (Email)
1. Go to [SendGrid](https://sendgrid.com)
2. Create account and verify sender
3. Generate API key starting with `SG.`

## Step 3: Deploy Backend (Google Cloud Run)

### 3.1 Install Google Cloud CLI
```bash
# macOS
brew install google-cloud-sdk

# Initialize
gcloud init
gcloud auth configure-docker
```

### 3.2 Deploy Backend
```bash
cd backend

# Build and deploy
gcloud run deploy chizen-api \
  --source=. \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --set-env-vars="ENVIRONMENT=production"
```

### 3.3 Set Environment Variables
```bash
# Set all required environment variables
gcloud run services update chizen-api \
  --update-env-vars="MONGODB_URL=your-mongodb-connection-string,SECRET_KEY=your-jwt-secret,OPENAI_API_KEY=your-openai-key,ELEVEN_LABS_KEY=your-elevenlabs-key,SENDGRID_API_KEY=your-sendgrid-key,GOOGLE_CLIENT_ID=your-google-oauth-id,GOOGLE_CLIENT_SECRET=your-google-oauth-secret" \
  --region=us-central1
```

**Note the backend URL** (e.g., `https://chizen-api-xxxxx-uc.a.run.app`)

## Step 4: Deploy Frontend (Vercel)

### 4.1 Connect GitHub Repository
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Framework: **Next.js**
4. Root Directory: **/** (leave empty)

### 4.2 Set Environment Variables in Vercel
In Vercel dashboard > Settings > Environment Variables:

```bash
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
NEXT_PUBLIC_API_URL=https://your-backend-url.run.app
NEXT_PUBLIC_MOCK_BACKEND=false
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/chizen-fitness
```

### 4.3 Deploy
1. Click **Deploy**
2. Vercel will automatically build and deploy
3. Your app will be available at `https://your-app-name.vercel.app`

## Step 5: Post-Deployment Configuration

### 5.1 Update Google OAuth
1. Go back to Google Cloud Console
2. Add your Vercel domain to authorized origins:
   - `https://your-app-name.vercel.app`
3. Add callback URL:
   - `https://your-app-name.vercel.app/api/auth/callback/google`

### 5.2 Update CORS in Backend
Your backend should automatically handle CORS with the environment variable, but verify it includes your frontend domain.

### 5.3 Test the Deployment
1. Visit your Vercel URL
2. Test authentication (Google OAuth)
3. Generate a routine (tests OpenAI integration)
4. Test voice playback (tests ElevenLabs)
5. Subscribe to newsletter (tests SendGrid)

## Step 6: Custom Domain (Optional)

### 6.1 Vercel Custom Domain
1. In Vercel dashboard > Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

### 6.2 Update Environment Variables
Update `NEXTAUTH_URL` and Google OAuth settings to use your custom domain.

## Step 7: Monitoring and Maintenance

### 7.1 Set up Monitoring
- **Vercel Analytics**: Automatic with Vercel Pro
- **Google Cloud Monitoring**: For backend performance
- **MongoDB Monitoring**: In Atlas dashboard

### 7.2 Set up Alerts
- API error rates
- Database connection issues
- High API usage (costs)

## Troubleshooting

### Common Issues

1. **NextAuth Error**: Check `NEXTAUTH_URL` and `NEXTAUTH_SECRET`
2. **API Connection Failed**: Verify `NEXT_PUBLIC_API_URL`
3. **Database Connection**: Check MongoDB Atlas IP whitelist
4. **Google OAuth Failed**: Verify authorized domains and redirect URIs
5. **Build Failed**: Check all environment variables are set

### Check Logs
```bash
# Vercel function logs
vercel logs

# Google Cloud Run logs  
gcloud logs read --service=chizen-api --limit=50
```

## Environment Variables Checklist

### Frontend (.env.local for development)
- ✅ NEXTAUTH_URL
- ✅ NEXTAUTH_SECRET  
- ✅ GOOGLE_CLIENT_ID
- ✅ GOOGLE_CLIENT_SECRET
- ✅ NEXT_PUBLIC_API_URL
- ✅ NEXT_PUBLIC_MOCK_BACKEND

### Backend (backend/.env for development)  
- ✅ MONGODB_URL
- ✅ SECRET_KEY
- ✅ OPENAI_API_KEY
- ✅ ELEVEN_LABS_KEY
- ✅ SENDGRID_API_KEY
- ✅ GOOGLE_CLIENT_ID
- ✅ GOOGLE_CLIENT_SECRET
- ✅ ENVIRONMENT
- ✅ CORS_ORIGINS

## Cost Estimates

### Free Tier Limits
- **Vercel**: 100GB bandwidth, 1000 function invocations
- **Google Cloud Run**: 2 million requests, 360,000 GB-seconds
- **MongoDB Atlas**: 512MB storage
- **OpenAI**: $5 free credit (new accounts)

### Expected Monthly Costs (1000 users)
- **Vercel Pro**: $20/month (optional)
- **Google Cloud Run**: $5-15/month  
- **MongoDB Atlas**: $9/month (M2)
- **OpenAI API**: $10-30/month
- **ElevenLabs**: $5-22/month
- **SendGrid**: Free up to 100 emails/day

**Total**: ~$50-100/month for moderate usage

---

🎉 **Congratulations!** ChiZen Fitness is now live in production!

Your users can now access AI-powered wellness routines at your deployed URL.
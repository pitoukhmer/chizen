# ChiZen Fitness - Production Setup Guide 🚀

## Quick Deployment Commands

### 1. Deploy Backend (Google Cloud Run)
```bash
./deploy-backend.sh
```

### 2. Deploy Frontend (Vercel)
```bash
./deploy-frontend.sh
```

## Step-by-Step Instructions

### Prerequisites Setup

1. **Google Cloud Setup**
```bash
# Initialize Google Cloud (will open browser for auth)
export PATH="/opt/homebrew/Caskroom/gcloud-cli/533.0.0/google-cloud-sdk/bin:$PATH"
gcloud init

# Create new project: chizen-fitness
# Select region: us-central1
```

2. **Get API Keys** (Required for production)
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/chizen-fitness`
- **Google OAuth**: Client ID + Secret from Google Console
- **OpenAI**: API key starting with `sk-`
- **ElevenLabs**: Voice API key
- **SendGrid**: Email API key starting with `SG.`

### Backend Deployment

1. **Run deployment script:**
```bash
./deploy-backend.sh
```

2. **Set environment variables in Google Cloud Console:**
- Go to: https://console.cloud.google.com/run
- Select `chizen-api` service
- Go to "Variables & Secrets" tab
- Add these variables:

```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/chizen-fitness
SECRET_KEY=your-super-secret-jwt-key
OPENAI_API_KEY=sk-your-openai-key
ELEVEN_LABS_KEY=your-elevenlabs-key
SENDGRID_API_KEY=SG.your-sendgrid-key
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
ENVIRONMENT=production
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
```

3. **Note your backend URL** (e.g., `https://chizen-api-xxx-uc.a.run.app`)

### Frontend Deployment

1. **Run deployment script:**
```bash
./deploy-frontend.sh
```

2. **Set environment variables in Vercel Dashboard:**
- Go to: https://vercel.com/dashboard
- Select your project
- Go to Settings → Environment Variables
- Add these variables:

```env
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
NEXT_PUBLIC_API_URL=https://your-backend-url.run.app
NEXT_PUBLIC_MOCK_BACKEND=false
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/chizen-fitness
```

3. **Redeploy after setting variables:**
```bash
vercel --prod
```

### Post-Deployment Configuration

1. **Update Google OAuth Settings:**
- Go to: https://console.cloud.google.com/apis/credentials
- Edit your OAuth client
- Add authorized origins: `https://your-app-name.vercel.app`
- Add callback URL: `https://your-app-name.vercel.app/api/auth/callback/google`

2. **Test Your Deployment:**
- Backend health: `https://your-backend-url.run.app/health`
- Frontend: `https://your-app-name.vercel.app`
- Authentication: Try Google sign-in
- AI features: Generate a routine
- Voice: Test audio playback

## Custom Domain Setup (Optional)

### Vercel Custom Domain
1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable
5. Update Google OAuth settings

## Monitoring & Costs

### Free Tier Limits
- **Google Cloud Run**: 2M requests/month, 360,000 GB-seconds
- **Vercel**: 100GB bandwidth/month, 1000 function executions
- **MongoDB Atlas**: 512MB storage (M0)

### Expected Costs (1000+ users)
- **Google Cloud Run**: $5-15/month
- **Vercel Pro**: $20/month (optional)
- **MongoDB Atlas M2**: $9/month
- **OpenAI API**: $10-30/month
- **ElevenLabs**: $5-22/month
- **SendGrid**: Free (100 emails/day) or $15/month

## Troubleshooting

### Common Issues
1. **Build fails**: Check all environment variables are set
2. **API connection errors**: Verify CORS_ORIGINS includes your frontend URL
3. **Authentication fails**: Check Google OAuth callback URLs
4. **Database connection**: Verify MongoDB Atlas network access (0.0.0.0/0)

### Debug Commands
```bash
# Check backend logs
gcloud logs read --service=chizen-api --limit=50

# Check frontend logs
vercel logs

# Test API endpoints
curl https://your-backend-url.run.app/health
```

## Security Checklist

- ✅ Environment variables set (no secrets in code)
- ✅ HTTPS enabled (automatic with Cloud Run + Vercel)
- ✅ CORS configured properly
- ✅ JWT secrets are strong and unique
- ✅ MongoDB network access restricted
- ✅ API rate limiting enabled

---

🎉 **Your ChiZen Fitness app is now live in production!**

Users can access AI-powered wellness routines at your deployed URLs.
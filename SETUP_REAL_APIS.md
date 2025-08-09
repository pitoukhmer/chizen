# ChiZen Fitness - Real API Setup Guide 🔑

## Required API Keys for Full Experience

### 1. OpenAI API Key (Required for AI Routines)
- **Website**: https://platform.openai.com/api-keys
- **Free Credit**: $5 free credit for new accounts
- **Cost**: ~$0.002 per routine generation
- **Format**: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. ElevenLabs API Key (Optional for Voice)
- **Website**: https://elevenlabs.io/app/settings
- **Free Tier**: 10,000 characters/month
- **Cost**: Very affordable for testing
- **Format**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. SendGrid API Key (Optional for Email)
- **Website**: https://sendgrid.com/solutions/email-api/
- **Free Tier**: 100 emails/day forever
- **Cost**: Free for testing
- **Format**: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 4. MongoDB Atlas (Required for Database)
- **Website**: https://cloud.mongodb.com
- **Free Tier**: 512 MB storage
- **Cost**: Free tier sufficient for testing
- **Format**: `mongodb+srv://user:pass@cluster.mongodb.net/chizen-fitness`

## Setup Instructions

### Step 1: Get Your API Keys
1. Sign up for each service above
2. Generate API keys
3. Keep them secure (never commit to git)

### Step 2: Update Backend Environment
Edit `/backend/.env` with your real keys:
```bash
# Database (REQUIRED)
MONGODB_URL=mongodb+srv://your-user:your-pass@your-cluster.mongodb.net/chizen-fitness

# AI Services (OpenAI Required for AI routines)
OPENAI_API_KEY=sk-proj-your-openai-key-here

# Voice (Optional - fallback to browser speech synthesis)
ELEVEN_LABS_KEY=your-elevenlabs-key-here
MASTER_LEE_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Email (Optional - works without)
SENDGRID_API_KEY=SG.your-sendgrid-key-here
FROM_EMAIL=noreply@yourdomain.com

# Keep existing
SECRET_KEY=chizen-jwt-secret-key-change-in-production-2024
ENVIRONMENT=development
```

### Step 3: Start Real Backend
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

### Step 4: Test Real Integration
1. Generate AI routine - powered by real OpenAI
2. Play voice guidance - powered by real ElevenLabs  
3. Subscribe to newsletter - powered by real SendGrid

## What You'll Experience with Real APIs

### 🤖 OpenAI Integration
- **Real AI-generated routines** personalized to user preferences
- **Dynamic content** that adapts to fitness level and goals
- **Varied and creative** wellness sessions every day
- **Contextual wisdom quotes** from Master Lee

### 🎙️ ElevenLabs Voice Synthesis  
- **High-quality AI voice** that sounds natural and calming
- **Master Lee persona** with consistent voice character
- **Multiple voice options** and emotional tones
- **Perfect pronunciation** of exercise instructions

### 📧 SendGrid Email Integration
- **Real email delivery** to subscribers
- **Professional email templates** with ChiZen branding  
- **Automated welcome series** for new subscribers
- **Delivery analytics** and bounce handling

### 💾 MongoDB Atlas Database
- **Real user data persistence** across sessions
- **Proper progress tracking** and streak management
- **User analytics** and behavior insights
- **Scalable data storage** for growth

## Cost Estimation for Testing

- **OpenAI**: ~$1-2/month for regular testing
- **ElevenLabs**: Free tier covers extensive testing
- **SendGrid**: Free tier covers all testing needs
- **MongoDB**: Free tier sufficient for development

**Total**: ~$1-2/month for full real API experience!

## Ready to Configure?

Let me know when you have your API keys and I'll help you:
1. Update the environment configuration
2. Switch to the FastAPI backend
3. Test each integration individually
4. Verify the complete real-time experience

The difference will be amazing - real AI routines, beautiful voice synthesis, and professional email delivery! 🚀
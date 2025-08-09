#!/bin/bash
# Frontend deployment script for Vercel

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 ChiZen Fitness - Frontend Deployment Script${NC}"
echo "=================================================="

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo -e "${YELLOW}🔐 Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Vercel:${NC}"
    vercel login
fi

# Deploy to Vercel
echo -e "${YELLOW}🏗️  Deploying frontend to Vercel...${NC}"
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
    
    echo -e "${YELLOW}⚠️  Next steps:${NC}"
    echo "1. Go to Vercel dashboard to set environment variables"
    echo "2. Add your backend URL to NEXT_PUBLIC_API_URL"
    echo "3. Set NEXT_PUBLIC_MOCK_BACKEND=false for production"
    echo "4. Configure Google OAuth callback URLs"
else
    echo -e "${RED}❌ Deployment failed. Check the logs above.${NC}"
    exit 1
fi
#!/bin/bash
# Backend deployment script for Google Cloud Run

# Set PATH for gcloud
export PATH="/opt/homebrew/Caskroom/gcloud-cli/533.0.0/google-cloud-sdk/bin:$PATH"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 ChiZen Fitness - Backend Deployment Script${NC}"
echo "================================================="

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${RED}❌ Please authenticate with Google Cloud first:${NC}"
    echo "   gcloud init"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ No project set. Please run 'gcloud init' first${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Project: $PROJECT_ID${NC}"

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required APIs...${NC}"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Navigate to backend directory
cd backend

# Deploy to Cloud Run
echo -e "${YELLOW}🏗️  Deploying backend to Cloud Run...${NC}"
gcloud run deploy chizen-api \
    --source=. \
    --platform=managed \
    --region=us-central1 \
    --allow-unauthenticated \
    --port=8000 \
    --memory=1Gi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --timeout=300 \
    --set-env-vars="ENVIRONMENT=production"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
    
    # Get the service URL
    SERVICE_URL=$(gcloud run services describe chizen-api --region=us-central1 --format="value(status.url)")
    echo -e "${GREEN}🌐 Backend URL: $SERVICE_URL${NC}"
    
    echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
    echo "1. Set environment variables in Cloud Run console"
    echo "2. Update frontend NEXT_PUBLIC_API_URL to: $SERVICE_URL"
    echo "3. Test the deployment: $SERVICE_URL/health"
else
    echo -e "${RED}❌ Deployment failed. Check the logs above.${NC}"
    exit 1
fi
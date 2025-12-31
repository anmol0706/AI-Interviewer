#!/bin/bash

# AI Interviewer - Google Cloud Deployment Script
# This script deploys the application to Google Cloud Run

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="ai-interviewer"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying AI Interviewer to Google Cloud Run"
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME}:latest .

# Push to Google Container Registry
echo "⬆️ Pushing to Container Registry..."
docker push ${IMAGE_NAME}:latest

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 5000 \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest,GEMINI_API_KEY=gemini-api-key:latest"

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo ""
echo "✅ Deployment complete!"
echo "🔗 Service URL: ${SERVICE_URL}"
echo ""
echo "Next steps:"
echo "1. Set up MongoDB Atlas and update the MONGODB_URI secret"
echo "2. Create secrets in Secret Manager for sensitive values"
echo "3. Configure custom domain (optional)"

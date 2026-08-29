#!/bin/bash
set -e

# Load local environment variables if present
if [ -f "$(dirname "$0")/env.sh" ]; then
  source "$(dirname "$0")/env.sh"
fi

echo "🚀 Deploying to Cloud Run..."

gcloud run deploy promptwars-aug29 \
  --project promptwars-aug29 \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "\
GEMINI_API_KEY=${GEMINI_API_KEY},\
FIREBASE_API_KEY=${FIREBASE_API_KEY},\
FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN},\
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID},\
FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET},\
FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID},\
FIREBASE_APP_ID=${FIREBASE_APP_ID}" \
  --quiet

echo "✅ Deploy complete. Live URL:"
gcloud run services describe promptwars-aug29 \
  --project promptwars-aug29 \
  --region asia-south1 \
  --format "value(status.url)"

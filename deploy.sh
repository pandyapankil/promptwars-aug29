#!/bin/bash
set -e

# Default environment variables if not exported
export GEMINI_API_KEY=${GEMINI_API_KEY:-"AIzaSyDDEzTr9uk_jQXiLHVyQFkqN1BDw8pwyRM"}
export FIREBASE_API_KEY=${FIREBASE_API_KEY:-"AIzaSyAmmvliUGEwfELxNLRiLmtdh6u0XrvrbDE"}
export FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN:-"promptwars-aug29.firebaseapp.com"}
export FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID:-"promptwars-aug29"}
export FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET:-"promptwars-aug29.firebasestorage.app"}
export FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID:-"913258105665"}
export FIREBASE_APP_ID=${FIREBASE_APP_ID:-"1:913258105665:web:a6d323eee3151089102fc0"}

PROJECT_ID="promptwars-aug29"
SERVICE_NAME="promptwars-aug29"
REGION="asia-south1"

echo "🚀 Deploying to Cloud Run ($SERVICE_NAME in project $PROJECT_ID, region $REGION)..."

gcloud run deploy "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --source . \
  --region "$REGION" \
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
gcloud run services describe "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --format "value(status.url)"

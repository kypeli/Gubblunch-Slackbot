#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting deployment..."

# Check if .env file exists in the current directory
if [ -f .env ]; then
  echo "📄 Loading environment variables from .env..."
  set -a
  source .env
  set +a
else
  echo "⚠️  No .env file found in the project root! Ensure your environment variables are set."
fi

echo "📦 Building Lambda bundle..."
bun run build:lambda

echo "🏗️  Running Terraform..."

# Navigate to the terraform directory where the configurations are
cd terraform

# Initialize Terraform (safe to run multiple times)
terraform init

# Apply the Terraform configuration passing the required secrets explicitly
# Variables that have default values in variables.tf are omitted, unless you want to override them.
terraform apply -auto-approve \
  -var="slack_bot_token=${SLACK_BOT_TOKEN}" \
  -var="slack_signing_secret=${SLACK_SIGNING_SECRET}" \
  -var="gemini_api_key=${GEMINI_API_KEY}"

echo "✅ Deployment finished!"

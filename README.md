# Gubblunch Slack Bot

A Slack bot that helps track lunch agreements per channel using Gemini AI. Responds in Swedish.

The bot is designed to run as an **AWS Lambda function**: Slack sends events to the Lambda Function URL, and the Lambda processes and responds to them. For local development it can also run in Socket Mode, where the bot maintains a persistent connection to Slack instead.

## Features

- **@mention only**: Bot only responds to direct mentions
- **Natural language**: Uses Gemini to detect intent and manage state
- **Persistent state**: Uses AWS DynamoDB for durable, shared state

## Architecture

- **`src/types.ts`**: Type definitions for state and Gemini responses
- **`src/state.ts`**: DynamoDB state manager using AWS SDK v3
- **`src/gemini.ts`**: Gemini client using `@google/genai` with structured JSON responses
- **`src/slack.ts`**: Bolt app setup and event handling (Socket Mode for local dev)
- **`src/index.ts`**: Entry point, wires everything together
- **`src/lambda.ts`**: AWS Lambda entry point using `AwsLambdaReceiver`

## Setup

### Prerequisites

- Bun runtime
- Gemini API key
- Slack app with bot token, app token (Socket Mode), and signing secret

### Installation

```bash
bun install
```

### Environment Variables

- `SLACK_BOT_TOKEN`: Bot OAuth token (`xoxb-...`)
- `SLACK_APP_TOKEN`: App-level token for Socket Mode (`xapp-...`)
- `SLACK_SIGNING_SECRET`: Signing secret for request verification
- `GEMINI_API_KEY`: Gemini API key
- `GEMINI_MODEL`: Model ID (default: `gemini-3.1-flash-lite-preview`)
- `DYNAMODB_TABLE`: DynamoDB table name (set by Terraform in Lambda deployment)

### Running locally (Socket Mode)

```bash
bun run src/index.ts
```

This uses Socket Mode — the bot opens a persistent WebSocket connection to Slack, so no public URL is needed. Requires `SLACK_APP_TOKEN` in addition to the other variables.

## Deployment (AWS Lambda)

In production the bot runs as an AWS Lambda function exposed via a **Lambda Function URL**. Slack is configured to POST events directly to that URL — no Socket Mode or long-running process is needed. Infrastructure is managed with Terraform.

### Prerequisites

- AWS CLI configured
- Terraform installed

### Deploy

```bash
./deploy.sh
```

This script:

1. Loads environment variables from `.env`
2. Builds the Lambda bundle (`dist/lambda.js`) with Bun
3. Runs `terraform apply` to deploy/update the Lambda, DynamoDB table, and Function URL

After deploying, Terraform outputs the Function URL:

```
slack_events_request_url = "https://<id>.lambda-url.<region>.on.aws/"
```

Configure this URL in your Slack app under **Event Subscriptions** request URL. Slack will POST all bot events to this endpoint, which the Lambda processes and responds to.

### Terraform variables

| Variable               | Default                         | Description          |
| ---------------------- | ------------------------------- | -------------------- |
| `aws_region`           | `us-east-1`                     | AWS region           |
| `slack_bot_token`      | —                               | Slack bot token      |
| `slack_signing_secret` | —                               | Slack signing secret |
| `gemini_api_key`       | —                               | Gemini API key       |
| `gemini_model_name`    | `gemini-3.1-flash-lite-preview` | Gemini model         |

## Future Work

- Add persistent logging/audit trail
- Scale to multiple channels with channel-scoped state

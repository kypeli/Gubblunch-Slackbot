# Gubblunch Slack Bot - AI Agent Guide

You are an AI assistant helping to develop and maintain the Gubblunch Slack Bot. This project is a Slack application that uses Gemini AI to manage lunch agreements among users.

## Project Overview

- **Purpose**: Tracks lunch agreements in Slack channels using natural language processing (Swedish).
- **Core Logic**: Uses Gemini (`@google/genai`) with structured JSON outputs to detect intent and manage state.
- **Persistence**: AWS DynamoDB for storing user lunch agreements.
- **Runtime**: Bun (primary runtime) and Node.js (for AWS Lambda).

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Slack Bolt for JavaScript/TypeScript](https://slack.dev/bolt-js/)
- **AI**: Google Gemini (via `@google/genai`)
- **Infrastructure**: AWS Lambda (via Function URL), DynamoDB, Terraform
- **Language**: TypeScript

## Key Files & Directory Structure

- `src/index.ts`: Entry point for local development using **Socket Mode**.
- `src/lambda.ts`: Entry point for **AWS Lambda** deployment using `AwsLambdaReceiver`.
- `src/slack.ts`: Contains the Bolt `App` setup and event handlers (specifically `app_mention`).
- `src/gemini.ts`: Wrapper for the Gemini API, handles prompt engineering and structured JSON parsing.
- `src/state.ts`: Manages DynamoDB interactions for reading and writing lunch state.
- `src/types.ts`: TypeScript interfaces for the application state and Gemini responses.
- `terraform/`: Infrastructure as Code for AWS resources.
- `deploy.sh`: Script to build the Lambda bundle and run Terraform.

## Development Workflows

### Local Development (Socket Mode)
- **Command**: `bun dev` (runs `src/index.ts`)
- **Requirement**: `SLACK_APP_TOKEN` must be set in `.env` for Socket Mode to work.
- **Behavior**: The bot maintains a persistent WebSocket connection to Slack.

### Production Deployment (AWS Lambda)
- **Command**: `./deploy.sh`
- **Process**:
  1. Builds the project using `bun build` into `dist/lambda.js`.
  2. Runs `terraform apply` to deploy to AWS.
- **Architecture**: Slack sends POST requests to the Lambda Function URL.

## Important Architectural Rules

1. **Swedish Language**: The bot MUST respond in Swedish. The Gemini system prompt in `src/gemini.ts` enforces this.
2. **No Slack Retries**: Slack events are processed with `processBeforeResponse: true`, and retries are explicitly skipped in `src/slack.ts` to prevent duplicate processing during Lambda cold starts.
3. **Structured AI Output**: Gemini is configured to return `application/json` with a specific schema (see `src/gemini.ts`). Always ensure the response matches the `GeminiResponse` type in `src/types.ts`.
4. **State Management**: The state is a simple list of `{ userId, agreedDate }`. Dates should always be stored as ISO strings (`YYYY-MM-DD`).
5. **Mention Only**: The bot only responds to `@mentions` (`app_mention` event).

## Environment Variables

- `SLACK_BOT_TOKEN`: OAuth token for the bot.
- `SLACK_APP_TOKEN`: App-level token (required for Socket Mode).
- `SLACK_SIGNING_SECRET`: Secret to verify Slack requests (required for Lambda).
- `GEMINI_API_KEY`: API key for Google AI.
- `GEMINI_MODEL`: Gemini model ID (e.g., `gemini-2.0-flash`).
- `DYNAMODB_TABLE`: Name of the DynamoDB table.

## Coding Style & Conventions

- Use **TypeScript** with strict type checking.
- Prefer **Bun** for scripts and building.
- Maintain the separation of concerns:
    - Keep Slack event handling in `slack.ts`.
    - Keep AI logic/prompts in `gemini.ts`.
    - Keep AWS/DB logic in `state.ts`.

# Gubblunch Slack Bot

A Slack bot that maintains per-channel topic/context using Gemini AI via Vertex AI.

## Features

- **@mention only**: Bot only responds to direct mentions
- **Per-channel state**: Maintains topic/context state for each channel
- **Natural language commands**: Uses Gemini to detect intent (state mutation vs. query)
- **No slash commands**: Everything is inferred from natural language
- **In-memory state**: Ready to be replaced with Redis for scaling

## Setup

### Prerequisites

- Bun runtime
- Google Cloud project with Vertex AI enabled
- Slack app with bot token and app token (Socket Mode)

### Installation

1. Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
bun install
```

### Environment Variables

- `SLACK_BOT_TOKEN`: Bot OAuth token from Slack
- `SLACK_APP_TOKEN`: App-level token for Socket Mode
- `SLACK_SIGNING_SECRET`: Signing secret for request verification
- `GOOGLE_CLOUD_PROJECT`: Your GCP project ID
- `GOOGLE_CLOUD_LOCATION`: Region for Vertex AI (e.g., `us-central1`)
- `GEMINI_MODEL`: Model ID (default: `gemini-2.0-flash-001`)

### Running

```bash
bun run src/index.ts
```

The bot will connect to Slack via Socket Mode and start listening for mentions.

## Usage Examples

```
@bot hello
→ Bot responds naturally

@bot let's talk about our Q2 roadmap
→ Bot acknowledges and sets topic to "Q2 roadmap"

@bot what are we discussing?
→ Bot reads current topic and responds accordingly

@bot clear the topic
→ Bot clears the topic state
```

## Architecture

- **`src/types.ts`**: Type definitions for state and Gemini responses
- **`src/state.ts`**: In-memory state manager (swappable interface for Redis)
- **`src/gemini.ts`**: Vertex AI client with prompt construction
- **`src/slack.ts`**: Bolt app setup and event handling
- **`src/index.ts`**: Entry point, wires everything together

## Future Work

- Replace `StateManager` with Redis client (AWS ElastiCache)
- Add persistent logging/audit trail
- Enhance Gemini prompt for more nuanced command detection

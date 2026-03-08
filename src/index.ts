import { setupSlackApp } from "./slack";
import { GeminiClient } from "./gemini";
import { StateManager } from "./state";

// Load environment variables
const requiredEnvVars = [
    "SLACK_BOT_TOKEN",
    "SLACK_APP_TOKEN",
    "GEMINI_API_KEY",
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

// Initialize components
const stateManager = new StateManager();
const geminiClient = new GeminiClient(
    process.env.GEMINI_API_KEY!,
    process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
);

// Setup and start Slack app
const app = setupSlackApp(stateManager, geminiClient);

app.start(process.env.SLACK_PORT ? Number(process.env.SLACK_PORT) : 3000).then(
    () => {
        console.log("✅ Slack bot is running on Socket Mode");
    },
);

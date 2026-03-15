import { AwsLambdaReceiver } from "@slack/bolt";
import { setupSlackApp } from "./slack";
import { GeminiClient } from "./gemini";
import { StateManager } from "./state";

const receiver = new AwsLambdaReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
});

const stateManager = new StateManager();
const geminiClient = new GeminiClient(
    process.env.GEMINI_API_KEY!,
    process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
);

const app = setupSlackApp(stateManager, geminiClient, receiver);

export const handler = async (event: any, context: any, callback: any) => {
    const handler = await receiver.start();
    return handler(event, context, callback);
};

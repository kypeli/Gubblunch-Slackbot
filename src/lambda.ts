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
    // Lambda Function URL uses payload format 2.0 (same as HTTP API Gateway v2).
    // AwsLambdaReceiver expects API Gateway v1 format which has `multiValueHeaders`
    // and `httpMethod`. Normalize here so the receiver doesn't crash.
    if (event.version === "2.0" && !event.multiValueHeaders) {
        event.httpMethod = event.requestContext?.http?.method;
        event.path = event.rawPath;
        event.multiValueHeaders = Object.fromEntries(
            Object.entries(event.headers ?? {}).map(([k, v]) => [k, [v]]),
        );

        console.log("Normalized Lambda event for API Gateway v2:", event);
    }

    const handler = await receiver.start();
    return handler(event, context, callback);
};

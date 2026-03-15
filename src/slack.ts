import { App, Receiver } from "@slack/bolt";
import { LunchState } from "./types";
import { GeminiClient } from "./gemini";
import { StateManager } from "./state";

export function setupSlackApp(
    stateManager: StateManager,
    geminiClient: GeminiClient,
    receiver?: Receiver,
): App {
    const app = new App(
        receiver
            ? {
                  token: process.env.SLACK_BOT_TOKEN,
                  receiver,
              }
            : {
                  socketMode: true,
                  appToken: process.env.SLACK_APP_TOKEN,
                  signingSecret: process.env.SLACK_SIGNING_SECRET,
                  token: process.env.SLACK_BOT_TOKEN,
              },
    );

    app.event("app_mention", async ({ event, say, client }) => {
        console.log("Received app_mention event:", event);
        try {
            // Extract user info
            const userId = event.user;
            const timestamp = event.ts;
            const threadTs = event.thread_ts;

            // Strip bot mention from text
            const text = event.text.replace(/<@[UW][A-Z0-9]+>/g, "").trim();

            if (!text) {
                await say({
                    text: "Hello! Send me a message and I'll help.",
                    thread_ts: threadTs,
                });
                return;
            }

            // Load current state
            const currentState = stateManager.get();

            // Process with Gemini
            const geminiResponse = await geminiClient.processMessage(
                userId + ": " + text,
                currentState,
            );

            console.log("Gemini response:", geminiResponse);

            // Update state if needed
            if (geminiResponse.lunchState) {
                const updatedState: Array<LunchState> =
                    geminiResponse.lunchState.map((item) => ({
                        userId: item?.userId || null,
                        agreedDate: item?.agreedDate || null,
                    }));

                // For simplicity, we replace the entire state. In a real app, you'd likely want to merge it.
                stateManager.set(updatedState);
            }

            // Post response
            await say({
                text: geminiResponse.response,
                thread_ts: threadTs,
            });
        } catch (error) {
            console.error("Error handling app_mention:", error);
            await say({
                text: "Sorry, I encountered an error. Please try again.",
                thread_ts: event.thread_ts,
            });
        }
    });

    return app;
}

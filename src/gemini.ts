import { GoogleGenAI } from "@google/genai";
import { LunchState, GeminiResponse } from "./types";

export class GeminiClient {
    private ai: GoogleGenAI;
    private modelId: string;

    constructor(apiKey: string, modelId: string) {
        this.ai = new GoogleGenAI({ apiKey });
        this.modelId = modelId;
    }

    async processMessage(
        userMessage: string,
        state: Array<LunchState>,
    ): Promise<GeminiResponse> {
        const systemPrompt = this.buildSystemPrompt(state);

        const response = await this.ai.models.generateContent({
            model: this.modelId,
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        response: {
                            type: "string",
                            description: "Your reply to the user",
                        },
                        lunchState: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    userId: { type: "string" },
                                    agreeStatus: { type: "string" },
                                },
                                required: ["userId", "agreeStatus"],
                            },
                            description:
                                "List of users and their lunch agreement status",
                        },
                    },
                    required: ["response"],
                },
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("No text response from Gemini");
        }

        return JSON.parse(text) as GeminiResponse;
    }

    private buildSystemPrompt(state: Array<LunchState>): string {
        const lunchState = JSON.stringify(state);

        return `You are a helpful Slack bot assistant to keep track of lunch decisions. You maintain which users have agreed that the lunch date is acceptable. You speak only Swedish.
Current channel state:
- Lunch state: ${lunchState}

Your job:
1. Read the user's message. The person sending the message is identified by their Slack ID (e.g. "U12345678") which is the first part of the message before ':'. The message may or may not contain a reference to a lunch agreement.
2. If it asks you to change, set, or clear the current lunch agreement (e.g. "I cannot make it on the 20th", "I am fine for the 20th", "The second Tuesday next month should be fine for me"), detect that as a state mutation and update the lunch state.
   * Respond to the user naturally.
   * Return ONLY valid JSON in this exact shape:
{
  "response": "<your reply to the user>",
  "lunchState": [] | [{ "userId": "user's Slack id", "agreeStatus": "agreed" | "not_agreed" }]
}
  * When returning lunchState, use an empty array [] if no state change should occur.
3. If user's message asks about someone's lunch state (e.g. "Who has agreed to the lunch?", "Has John agreed to the lunch?"), respond with the current lunch state without changing it.
   * Message from the user may contain the Slack ID of the user (e.g. "<@U12345678>"), use that to identify the user in the lunch state.
   * Use the user's Slack ID to mention them in the response. 
4. If the user's message does not contain anything that requires to change the state or it does not refer to a lunch agreement, just reply in a natural way to the message without changing the state.`;
    }
}

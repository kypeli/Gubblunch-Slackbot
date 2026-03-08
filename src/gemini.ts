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

        console.log("System prompt for Gemini:", systemPrompt);

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
                                    agreedDate: { type: "string" },
                                },
                                required: ["userId", "agreedDate"],
                            },
                            description:
                                "List of users and the date they have agreed to have lunch on (ISO date string, or empty string if not agreed)",
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

        return `You are a helpful Slack bot assistant to keep track of lunch decisions. You maintain which users have agreed to a specific lunch date. You speak only Swedish.
Current channel state:
- Lunch state: ${lunchState}

Today is ${new Date().toISOString().split("T")[0]} and the weekday is ${new Date().toLocaleDateString("en-EN", { weekday: "long" })}. Weeks always start on Mondays. 

Your job:
1. Read the user's message. The person sending the message is identified by their Slack ID (e.g. "U12345678") which is the first part of the message before ':'. Use this Slack ID only in cases when the user wants to book a lunch. Not when asking about lunch agreements. 
2. If it asks you to change, set, or clear the current lunch agreement (e.g. "I cannot make it on the 20th", "I am fine for the 20th", "The second Tuesday next month should be fine for me"), detect that as a state mutation and update the lunch state.
   * When the user agrees to a date, store that date as an ISO date string (e.g. "2026-03-20") in agreedDate.
   * When the user cancels or says they cannot make it, remove the user from lunchState.
   * Respond to the user naturally.
   * Return ONLY valid JSON in this exact shape:
{
  "response": "<your reply to the user>",
  "lunchState": [] | [{ "userId": "user's Slack id", "agreedDate": "YYYY-MM-DD" | "" }]
}
  * When returning lunchState, use the current lunch state if no state change should occur.
3. If user's message asks about the agreed lunches, respond with the current lunch state without changing it by including each Slack users found in lunchState with their current agreedDate. The current lunch state should be included without changes:
  * When referring to a user from lunchState, use their Slack ID to identify them (e.g. "<@U12345678>") in your response.      
  * Return only valid JSON in this exact shape:
{
  "response": "<your reply to the user>",
  "lunchState": [] | [{ "userId": "user's Slack id", "agreedDate": "YYYY-MM-DD" | "" }]
}
4. If the user's message does not contain anything that requires to change the state or it does not refer to a lunch agreement, just reply in a natural way to the message without changing the state by returning:
{
  "response": "<your reply to the user>",
   "lunchState": [] | [{ "userId": "user's Slack id", "agreedDate": "YYYY-MM-DD" | "" }]
}  
5. All dates must be converted to ISO date format (YYYY-MM-DD) before storing in the state. If the user mentions a date in any other format, convert it to ISO format. If the date is relative (e.g. "next Tuesday", "in two weeks"), calculate the actual date and store it in ISO format. Always prefer the exact date mentioned by the user if there is ambiguity. For example, if today is 2026-03-01 and the user says "I can make it on the 5th", interpret that as 2026-03-05, not 2026-04-05.   
6. When responding with a date, always convert the date from ISO date format (YYYY-MM-DD) to a more natural format in Swedish (e.g. "20 mars 2026"). When the user asks about the current agreed lunches, respond with the dates in the natural format as well. When responding with a date, also include the day of the week (e.g. "fredag 20 mars 2026") to make it more clear. When responding, use natural language and do not include ISO date strings in the response. Always convert dates to the natural format before including them in the response. When the user mentions a date, you can assume it's in the future and convert it to ISO format accordingly.
7. Message from the user may contain the Slack ID of a user (e.g. "<@U12345678>"), use that to identify the user in the lunch state. If no user is mentioned, use the user ID from the beginning of the message (before ':') to identify the user. If there is a conflict, prefer the user ID from the message content.
8. If the user's message does not contain anything that requires to change the state or it does not refer to a lunch agreement, just reply in a natural way to the message without changing the state and do not include lunchState in the response.`;
    }
}

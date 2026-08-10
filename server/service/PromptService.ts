
import * as z from "zod";

export default class PromptService {
    protected system_interactions = `You are a friendly assistant with conversation memory.
Use previous messages whenever the user refers to something they said,
asked, or discussed earlier.
You can freely chat and answer normal questions.
Only extract reminder information when the user explicitly asks for a reminder.
For questions about previous conversation, carefully distinguish:
- what the user said earlier
- what the user is saying now
- what the assistant said earlier
Do not assume that "again", "earlier", "before", etc. refer only to the current message.
`;
    getInputPrompt(currentIST: string, prompt: string) {
        return `Current IST Time:${currentIST},User Request:${prompt}`
    }
    getSchema(timezone: string) {
        const outputJsonSchema = {
            type: "object",
            properties: {
                heading: {
                    type: "string",
                    description: "A short title describing the task (2-5 words)",
                    maxLength: 200,
                },
                exact_remind_time: {
                    type: "string",
                    nullable: true,
                    description: "ISO datetime only for an explicit reminder request. Otherwise null."
                },
                timezone: {
                    type: "string",
                    description: `IANA timezone. Example: ${timezone}`
                },
                isValidPrompt: {
                    type: "boolean",
                    description: "True only when the user clearly requests a reminder and exact_remind_time is a valid future datetime. False when no reminder time is provided, the time is unclear, or the time is in the past. MUST CHECK THE PROMPT CONTAINS REMINDER TIME AND THE TIME MUST BE ON FUTURE"
                },
                textForChatResponse: {
                    type: "string",
                    maxLength: 200,
                }
            },
            required: [
                "heading",
                "exact_remind_time",
                "timezone",
                "isValidPrompt",
                "textForChatResponse",
            ]
        }
        return outputJsonSchema
    }
    getZodOutputSchema() {
        const outputSchema = z.object({
            heading: z
                .string()
                .max(200)
                .describe("A short title describing the task (2-5 words)"),

            exact_remind_time: z
                .string()
                .nullable()
                .describe(
                    "ISO datetime only for an explicit reminder request. Otherwise null."
                ),
            timezone: z
                .string()
                .describe(`IANA timezone`),
            isValidPrompt: z
                .boolean()
                .describe(
                    "True only when the user clearly requests a reminder and exact_remind_time is a valid future datetime. False when no reminder time is provided, the time is unclear, or the time is in the past. MUST CHECK THE PROMPT CONTAINS REMINDER TIME AND THE TIME MUST BE IN THE FUTURE."
                ),
            textForChatResponse: z
                .string()
                .max(200),
        });
        return outputSchema
    }
}
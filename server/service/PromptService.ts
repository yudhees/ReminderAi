
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
Recurring reminders:
- When the user asks for a repeating reminder ("every day", "daily", "every Monday", "every week", "monthly", "every year", "on my birthday each year"),
  set recurrence to daily, weekly, monthly or yearly, and set exact_remind_time to the FIRST future occurrence.
- If the user wants to stop repeating a reminder in this conversation, keep the existing time and set recurrence to none.
- One-time reminders always use recurrence none.
- Mention the repeat schedule in textForChatResponse when there is one.
`;
    getInputPrompt(currentTime: string, prompt: string, timezone?: string) {
        const tz = timezone ? ` (${timezone})` : ''
        return `Current user time${tz}:${currentTime},User Request:${prompt}`
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
                user_specified_seconds: {
                    type: "boolean",
                    description: "True only when the user explicitly mentions seconds in their reminder time (e.g., 'remind me at 2:30:45 PM'). False when user only specifies hours and minutes (e.g., 'remind me at 2:30 PM' or 'remind me in 5 minutes')."
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
                },
                recurrence: {
                    type: "string",
                    enum: ["none", "daily", "weekly", "monthly", "yearly"],
                    description: "How often the reminder repeats. none for a one-time reminder."
                }
            },
            required: [
                "heading",
                "exact_remind_time",
                "user_specified_seconds",
                "timezone",
                "isValidPrompt",
                "textForChatResponse",
                "recurrence",
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
            user_specified_seconds: z
                .boolean()
                .describe(
                    "True only when the user explicitly mentions seconds in their reminder time (e.g., 'remind me at 2:30:45 PM'). False when user only specifies hours and minutes (e.g., 'remind me at 2:30 PM' or 'remind me in 5 minutes')."
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
            recurrence: z
                .enum(["none", "daily", "weekly", "monthly", "yearly"])
                .describe(
                    "How often the reminder repeats: daily, weekly, monthly or yearly. none for a one-time reminder or when the user asks to stop repeating."
                ),
        });
        return outputSchema
    }
}
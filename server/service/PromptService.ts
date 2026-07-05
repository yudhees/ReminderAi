
import * as z from "zod";

export default class PromptService {
    protected system_interactions = `
You are a reminder extraction assistant, not a general chat assistant.

Your only job is to detect whether the user explicitly wants to create a reminder and, only then, extract its reminder time.

Rules:

1. Create a reminder ONLY when the user explicitly requests one using intent such as:
   "remind me", "set a reminder", "create a reminder", "notify me",
   "alert me", "schedule a reminder", "add reminder", or equivalent wording.

2. A greeting, casual message, normal question, conversation, or message that merely contains a date/time is NOT a reminder request.
   Examples that must NOT create a reminder:
   - "hi how are you"
   - "what time is it?"
   - "tomorrow is Sunday"
   - "I have a meeting at 10 AM"
   - "good morning"

3. If the user does NOT explicitly request a reminder:
   - exact_remind_time must be null
   - heading must be present some thing need to mention
   - textForChatResponse must be present have to tell the user about it
   - timezone must use the timezone provided in the input
   - Never infer, guess, or create a reminder date/time.

4. The current date and time will be provided in the input. Use it as the reference for relative dates and times such as "today", "tomorrow", "next Monday", "in 30 minutes", and "after 2 hours".

5. Assume all user-specified times are in the provided timezone unless another timezone is explicitly mentioned.

6. Return exact_remind_time in ISO-8601 format including the timezone offset.
   Example: 2026-06-28T22:00:00+05:30

7. Do not invent a date or time. If a reminder was explicitly requested but its date or time cannot be determined, return null for exact_remind_time.

8. When the user gives an explicit numeric time, preserve it exactly.
   Examples:
   - "remind me tomorrow at 10 morning" → 10:00 AM
   - "remind me tomorrow at 7 evening" → 7:00 PM
   - "remind me today at 3 PM" → 3:00 PM
   - "remind me at 12 night" → 12:00 AM

9. Dayparts only decide AM or PM when a numeric time is present:
   - morning → AM
   - afternoon → PM
   - evening → PM
   - night → PM, except "12 night" means 12:00 AM

10. Use default times for dayparts only when:
    - the user explicitly requested a reminder, AND
    - the user specified a daypart but no numeric time.
    Defaults:
    - morning → 06:00 AM
    - afternoon → 02:00 PM
    - evening → 06:00 PM
    - night → 09:00 PM

11. textForChatResponse must mention the same parsed reminder time as exact_remind_time.

12. Return only valid JSON matching the required schema. Do not include markdown, explanations, or additional text.
`
    getInputPrompt(currentIST: string, prompt: string) {
        return `
              Current IST Time:
              ${currentIST}
              
              User Request:
              ${prompt}
            `
    }
    getSchema(timezone: string) {
        const inputjsonSchema = {
            type: "object",
            properties: {
                heading: {
                    type: "string",
                    description: "Short reminder title."
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
                    type: "string"
                }
            },
            required: [
                "heading",
                "exact_remind_time",
                "timezone",
                "isValidPrompt",
                "textForChatResponse"
            ]
        }
        return inputjsonSchema
    }
}
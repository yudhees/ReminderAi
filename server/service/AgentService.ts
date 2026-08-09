
import { ChatGroq } from "@langchain/groq"
import { createAgent, providerStrategy, tool } from "langchain";
import PromptService from "./PromptService";

export default class AgentService extends PromptService {
    protected chatModel: ChatGroq;
    constructor() {
        super()
        this.chatModel = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "openai/gpt-oss-120b",
        });
    }
    protected getAgent() {
        const agent = createAgent({
            model: this.chatModel,
            tools: [],
            systemPrompt: this.system_interactions,
            responseFormat: providerStrategy(this.getZodOutputSchema())
        })
        return agent
    }
    async chat(message: string, thread_id: string, user_id: string) {
        try {

            const agent = this.getAgent()
            const res = await agent.invoke({ messages: [{ role: "human", content: message }] }, { configurable: { thread_id, user_id } })
            const last = res.messages.at(-1);
            if(last?.content){
                const content = last.content
                return JSON.parse(content) as ChatResponse
            }
        } catch (error) {
        }
        return null
    }
}
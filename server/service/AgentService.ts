
import { ChatGroq } from "@langchain/groq"
import { createAgent, providerStrategy, tool } from "langchain";
import PromptService from "./PromptService";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoClient  } from "mongodb";

export default class AgentService extends PromptService {
    protected chatModel: ChatGroq;
    protected checkpointer: MongoDBSaver;
    constructor() {
        super()
        this.chatModel = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "openai/gpt-oss-120b",
        });
        const client = new MongoClient(process.env.NUXT_MONGOOSE_URI as string);
        this.checkpointer = new MongoDBSaver({ client,dbName:"ReminderAI"});

    }
    protected getAgent() {
        const agent = createAgent({
            model: this.chatModel,
            tools: [],
            systemPrompt: this.system_interactions,
            responseFormat: providerStrategy(this.getZodOutputSchema()),
            checkpointer:this.checkpointer,
        })
        return agent
    }
    async chat(message: string, thread_id: string, user_id: string) {
        try {

            const agent = this.getAgent()
            const res = await agent.invoke({ messages: [{ role: "user", content: message }] }, { configurable: { thread_id, user_id } })
            const last = res.messages.at(-1);
            if (last?.content) {
                const content = last.content
                return JSON.parse(content) as ChatResponse
            }
        } catch (error) {
        }
        return null
    }
}
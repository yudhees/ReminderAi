import PromptService from "./PromptService";
import moment from 'moment-timezone';
import AgentService from './AgentService';

export class LLmService extends PromptService {
    protected agentService:AgentService
    constructor() {
        super()
        this.agentService=new AgentService()
    }
    protected userCurrentTime(timezone: string) {
        return moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss [GMT]Z');
    }
    async streamChat(prompt: string, timezone: string, sessionId: string,userId:string) {
        const currentIST = this.userCurrentTime(timezone);
        const userPrompt=this.getInputPrompt(currentIST, prompt)
        const interaction=await this.agentService.chat(userPrompt,sessionId,userId)
        return interaction
    }
}

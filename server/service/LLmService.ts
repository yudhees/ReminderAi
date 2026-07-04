import PromptService from "./PromptService";
import CloudflareService from "./CloudflareService";
import moment from 'moment-timezone';

export class LLmService extends PromptService {
    protected cfClient: CloudflareService;
    constructor() {
        super()
        this.cfClient = new CloudflareService()
    }
    protected userCurrentTime(timezone:string) {
        return moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss [GMT]Z');
    }
    async streamChat(prompt: string,timezone:string) {
        const currentIST = this.userCurrentTime(timezone);
        const responseSchema = this.getSchema(timezone)
        const messages = [
            {
                role: "system",
                content: this.system_interactions
            },
            {
                role:"user",
                content:this.getInputPrompt(currentIST,prompt)
            }
        ]
        const mongoId="asdgasdgsag"
        const response_format={
            type:"json_schema",
            json_schema:responseSchema
        }
        const interaction = await this.cfClient.interactions({messages,response_format},mongoId)
        const responseTime=moment().format('hh:mm A');
        let response="SomeThing went wrong please try again",isValidPrompt=false;
        if(interaction){
            isValidPrompt=interaction.isValidPrompt
            response=interaction.textForChatResponse
        }
        console.log(interaction);
        return {text:response,time:responseTime};
    }
}

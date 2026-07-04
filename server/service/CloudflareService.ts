import axios from 'axios'
export default class{
    protected model="@cf/ibm-granite/granite-4.0-h-micro";
    protected client;
    constructor(){
        const baseUrl=`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai`
        this.client=axios.create({
            baseURL:baseUrl,
            headers:{
                Authorization:`Bearer ${process.env.CLOUDFLARE_SECRET_KEY}`
            }
        })
    }
    async interactions(payload:Object,sessionId:string):Promise<ChatResponse|null>
    {
        try {
            const res=(await this.client.post(`/run/${this.model}`,payload,{headers:{
                'x-session-affinity':sessionId,
            }})).data
            return JSON.parse(res.result.choices[0].message.content) as ChatResponse
            // return res.result.response as ChatResponse;
        } catch (error) {
            console.error(error)
            return null
        }
    }
}
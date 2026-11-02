interface ChatResponse{
    emoji:string,
    exact_remind_time:string,
    heading:string,
    isValidPrompt:boolean,
    textForChatResponse:string,
    timezone:string,
    user_specified_seconds:boolean
}
type InteractionPayload = {
  sessionId: string
  input: string
  timezone: string
}

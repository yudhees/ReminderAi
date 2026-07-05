interface ChatResponse{
    emoji:string,
    exact_remind_time:string,
    heading:string,
    isValidPrompt:boolean,
    textForChatResponse:string,
    timezone:string
}
type InteractionPayload = {
  sessionId: string
  input: string
  timezone: string
}

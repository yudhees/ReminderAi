import moment from "moment"

type ChatReponseType={
    type:"user"|"ai",
    message:string,
    time:string,
    isLoading?:boolean,
}
export default function init() {
    const chatSend = ref(null)
    const chatInput = ref("")
    const route = useRoute()
    const chatResponses=ref<ChatReponseType[]>([])
    const isNew = computed(() => route.params.id == 'new')
    const loadingChat=ref(false)
    const sendChatDisabled=computed(()=>{
        return !chatInput.value || loadingChat.value
    })
    const timezone=userTimezone()
    const sendChat = async() => {
        loadingChat.value=true;
        try {
            chatResponses.value.push({
                type:"user",
                message:chatInput.value,
                time:moment().format('hh:mm A')
            })
            const aiReponse:ChatReponseType={
                type:'ai',
                isLoading:true,
                time:"",
                message:"",
            }
            chatResponses.value.push(aiReponse);
            const input=chatInput.value
            chatInput.value="";
            const res = await $fetch('/api/chat/streamChat',{
                method:"post",
                body:{input,timezone},
            })
            chatResponses.value.pop()
            chatResponses.value.push({
                type:"ai",
                message:res.text,
                time:res.time
            })
        } catch (error) {
            console.error(error);
        }
        loadingChat.value=false;
    }
    return {chatSend,chatInput,isNew,sendChat,sendChatDisabled,chatResponses}
}
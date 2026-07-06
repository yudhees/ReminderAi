import moment from "moment"
type ChatReponseType = {
    type: "user" | "ai",
    text: string,
    time: string,
    isLoading?: boolean,
    _id: string
}
export default function init() {
    const chatSend = ref(null)
    const bottomEl = ref(null)
    const chatInput = ref("")
    const router = useRouter()
    const route = useRoute()
    const chatResponses = ref<ChatReponseType[]>([])
    const isNew = computed(() => route.params.id == 'new')
    const loadingChat = ref(false)
    const sendChatDisabled = computed(() => {
        return !chatInput.value.trim() || loadingChat.value
    })
    const sessionId = computed(() => route.params.id)
    const timezone = userTimezone()
    const validateSession = async () => {
        if (!isNew.value) {
            const res = await $fetch('/api/chat/validateSession', {
                method: "POST", body: { sessionId: sessionId.value }
            })
            if (!res.success) {
                router.replace({ name: "chat-id", params: { id: 'new' } })
            } else {
                loadChat()
            }
        }
    }
    const loadChat = async () => {
        const res = await $fetch<(Pick<ChatReponseType, "type" | "text"|"_id"> & {
            created_at: string
        })[]>('/api/chat/loadChats', {
            method: "POST",
            body: { sessionId: sessionId.value }
        })
        chatResponses.value = res.map(val => {
            return {
                _id:val._id,
                text: val.text,
                type: val.type,
                time: moment(val.created_at).format('hh:mm A')
            }
        })        
    }
    const sendChat = async () => {
        loadingChat.value = true;
        try {
            chatResponses.value.push({
                type: "user",
                text: chatInput.value,
                time: moment().format('hh:mm A'),
                _id: crypto.randomUUID(),
            })
            const aiReponse: ChatReponseType = {
                type: 'ai',
                isLoading: true,
                time: "",
                text: "",
                _id: crypto.randomUUID(),
            }
            chatResponses.value.push(aiReponse);
            const input = chatInput.value
            chatInput.value = "";
            scrollDown()
            const res = await $fetch('/api/chat/streamChat', {
                method: "post",
                body: { input, timezone, sessionId: sessionId.value },
            })
            //@ts-ignore
            const session = res.sessionId
            chatResponses.value.pop()
            chatResponses.value.push({
                type: "ai",
                text: res.text,
                time: res.time,
                _id: crypto.randomUUID(),
                
            })
            if (isNew.value) {
                const url=router.resolve({params:{id:session}})
                replaceUrl(url.href)
            }
        } catch (error) {
            console.error(error);
        }
        loadingChat.value = false;
    }
    const scrollDown = () => {
        nextTick(() => {
            //@ts-ignore      
            bottomEl.value.scrollIntoView({ behavior: 'smooth' })
        })
    }
    onKeyStroke("Enter", (e) => {
        if (!sendChatDisabled.value) {
            sendChat()
        }
    })
    onMounted(() => {
        validateSession()
    })
    return { chatSend, chatInput, isNew, sendChat, sendChatDisabled, chatResponses, bottomEl }
}
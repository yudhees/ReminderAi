import moment from "moment"
import { repeatLabel } from "~/utils/repeat"
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
    const isNew = computed(() => sessionId.value=='new')
    const loadingChat = ref(false)
    const sendChatDisabled = computed(() => {
        return !chatInput.value.trim() || loadingChat.value
    })
    const sessionId=ref(route.params.id)
    const timezone = userTimezone()
    const {setDescription,setLabel}=useTopBarStore()
    const {loadSpecificChat,removeChat,updateLocalChat}=useChatSideBarStore()
    const session = ref<{ _id: string, heading?: string, remind_time?: string | null, recurrence?: string | null } | null>(null)
    const actionBusy = ref(false)
    const hasReminder = computed(() => !isNew.value && Boolean(session.value?.remind_time))
    const refreshSession = async () => {
        if (isNew.value) return
        try {
            const res = await $fetch('/api/chat/validateSession', {
                method: "POST", body: { sessionId: sessionId.value }
            })
            if (res.success) session.value = res.session as any
        } catch (error) {
            console.error(error);
        }
    }
    const { $toast } = useNuxtApp() as any
    const toastError = (error: any, fallback: string) => {
        $toast.error(error?.data?.statusMessage || error?.statusMessage || fallback)
    }
    const snooze = async (minutes: number) => {
        if (!hasReminder.value) return
        actionBusy.value = true
        try {
            const res = await $fetch<{ remind_time: string }>('/api/chat/snooze', {
                method: "POST",
                body: { chatId: sessionId.value, minutes }
            })
            if (session.value) session.value.remind_time = res.remind_time
            updateLocalChat(String(sessionId.value), { remind_time: res.remind_time })
            $toast.success(`Snoozed until ${moment(res.remind_time).format('ddd, h:mm A')}`)
        } catch (error) {
            console.error(error);
            toastError(error, 'Could not snooze this reminder')
        }
        actionBusy.value = false
    }
    const setRepeat = async (recurrence: string) => {
        if (!hasReminder.value) return
        actionBusy.value = true
        try {
            const res = await $fetch<{ reminder: { recurrence: string | null, remind_time: string } }>('/api/reminders/update', {
                method: "POST",
                body: { id: sessionId.value, recurrence }
            })
            if (session.value) session.value.recurrence = res.reminder.recurrence
            updateLocalChat(String(sessionId.value), { recurrence: res.reminder.recurrence } as any)
            const label = repeatLabel(res.reminder.recurrence)
            $toast.success(label ? `Repeats: ${label}` : 'Repeat turned off')
        } catch (error) {
            console.error(error);
            toastError(error, 'Could not change the repeat')
        }
        actionBusy.value = false
    }
    const deleteCurrent = async () => {
        if (isNew.value) return
        actionBusy.value = true
        try {
            await removeChat(String(sessionId.value))
            $toast.success('Reminder deleted')
        } catch (error) {
            console.error(error);
            toastError(error, 'Could not delete this reminder')
        }
        actionBusy.value = false
    }
    const validateSession = async () => {
        if (!isNew.value) {
            const res = await $fetch('/api/chat/validateSession', {
                method: "POST", body: { sessionId: sessionId.value }
            })
            if (!res.success) {
                router.replace({ name: "chat-id", params: { id: 'new' } })
            } else {
                session.value = res.session as any
                setLabel(res.session?.heading as string)
                loadChat().then(()=>{
                    nextTick(()=>{
                        scrollDown()
                    })
                })
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
            const newSessionId = res.sessionId
            chatResponses.value.pop()
            chatResponses.value.push({
                type: "ai",
                text: res.text,
                time: res.time,
                _id: crypto.randomUUID(),
                
            })
            if (isNew.value) {
                const url=router.resolve({params:{id:newSessionId}})
                replaceUrl(url.href)
                router.replace(url.href)
                await loadSpecificChat(newSessionId)
            }
            sessionId.value=newSessionId
            await refreshSession()
            if (!isNew.value && session.value) {
                updateLocalChat(String(sessionId.value), { remind_time: session.value.remind_time as any })
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
        if(isNew.value){
            setLabel('✨ Create New Reminder')
        }
        setDescription('')
    })
    return { chatSend, chatInput, isNew, sendChat, sendChatDisabled, chatResponses, bottomEl, hasReminder, actionBusy, snooze, deleteCurrent, session, setRepeat }
}


export const useChatSideBarStore = defineStore('ChatSideBarStore', () => {
    const chats = ref<ChatResponseType[]>([])
    const paginate = reactive({
        page: 1,
        hasMorePages: false
    })

    type ChatResponseType = {
        id: string,
        heading: string,
        remind_time: string,
    }

    const { deleteChat, saveSession } = useTopBarStore()
    const loadChats = async () => {
        try {
            const res = await $fetch<{ results: ChatResponseType[], hasMorePages: boolean }>('/api/chat/loadChatSessions', {
                body: JSON.stringify({
                    page: paginate.page
                }),
                method: "POST",
            })
            paginate.hasMorePages = res.hasMorePages
            chats.value = chats.value.concat(res.results)
        } catch (error) {
            console.error(error);
        }
    }

    const loadSpecificChat = async (chatId: string) => {
        try {
            const chat=(await $fetch("/api/chat/loadChatSessions",{
                body:JSON.stringify({
                    chatId
                }),
                method:"POST",
            })).results[0]
            if(chat){
                const existsIndex=chats.value.findIndex(chatData=>chatData.id==chat.id)
                if(existsIndex !==-1){
                      chats.value[existsIndex]=chat
                }else{
                    chats.value.unshift(chat)
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    const deleteSession = async (chatId: string, chatIndex: number) => {
        if (chats.value[chatIndex]) {
            try {
                await deleteChat(chatId)
                chats.value.splice(chatIndex, 1)
            } catch (error) {
                console.error(error);
            }
        }
    }

    const saveRename = (chatIndex: number, text: string) => {
        if (chats.value[chatIndex]) {
            const chat = chats.value[chatIndex]
            chats.value[chatIndex].heading = text
            saveSession(chat.id, { heading: text })
        }
    }

    /** Deletes a chat by id (from any page) and drops it from the sidebar list. */
    const removeChat = async (chatId: string) => {
        await deleteChat(chatId)
        const index = chats.value.findIndex(chat => chat.id == chatId)
        if (index !== -1) chats.value.splice(index, 1)
    }

    /** Keeps the sidebar in sync after a reminder is edited or snoozed elsewhere. */
    const updateLocalChat = (chatId: string, patch: Partial<ChatResponseType>) => {
        const chat = chats.value.find(chat => chat.id == chatId)
        if (chat) Object.assign(chat, patch)
    }

    /** Removes a chat the server already deleted (finished one-time reminder). */
    const dropLocal = (chatId: string) => {
        const index = chats.value.findIndex(chat => chat.id == chatId)
        if (index !== -1) chats.value.splice(index, 1)
    }

    return { chats, paginate, loadChats, loadSpecificChat, deleteSession, saveRename, removeChat, updateLocalChat, dropLocal }
})

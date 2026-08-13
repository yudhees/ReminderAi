


export const useTopBarStore = defineStore('TopBarStore', () => {

    const label = ref("")
    const description = ref("")
    const setLabel = (text: string) => {
        label.value = text
    }
    const setDescription = (text: string) => {
        description.value = text
    }
    const router=useRouter()
    const route=useRoute()
    const isRenameOpen = ref(false)
    const deleteChat = async(chatId: string) => {
        try {
            await $fetch(`/api/chat/${chatId}`,{
                method:"DELETE"
            })
            if(route.name=='chat-id' && route.params.id==chatId){                
                router.push({name:"chat-id",params:{id:'new'}})
            }
        } catch (error) {
            console.error(error);
        }
    }
    const saveSession = async (chatId: string, update: Record<string, any>) => {
        try {
            if(update.heading && route.name=='chat-id' && route.params.id==chatId){
                setLabel(update.heading as string)
            }
            await $fetch(`/api/chat/${chatId}`, {
                body: JSON.stringify({
                    chatId,
                    update
                }),
                method: "PUT"
            })
        } catch (error) {
            console.error(error);
        }
    }
    return { label, description, setDescription, setLabel, isRenameOpen,saveSession,deleteChat}

})
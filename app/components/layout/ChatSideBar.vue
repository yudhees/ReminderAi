
<template>
    <div class="px-4 pt-2 pb-1 text-[10px] font-extrabold text-slate-600 tracking-wider uppercase">
        Chats
    </div>
    <div class="overflow-y-auto max-h-screen" ref="el">
        <ChatLeftBar v-for="chat,index in chats" :key="chat.id" :heading="chat.heading" :active="chat.id==chatId" :chatId="chat.id" :remind_time="chat.remind_time" @isRenameOpen="(open)=>isRenameOpen=open" @rename="(text)=>saveRename(index,text)" @delete="()=>deleteSession(chat.id,index)"/>
    </div>
</template>
<script setup lang="ts">
import ChatLeftBar from './ChatLeftBar.vue';
const el = useTemplateRef('el')
const route=useRoute()
const chatId=computed(()=>route.params.id)
const paginate=reactive({
    page:1,
    hasMorePages:false
})
type ChatResonseType={
    id:string,
    heading:string,
    remind_time:string,  
}
const {deleteChat,saveSession}=useTopBarStore()
const {isRenameOpen}=storeToRefs(useTopBarStore())
const chats=ref<ChatResonseType[]>([])
const deleteSession=async(chatId:string,chatIndex:number)=>{
    if(chats.value[chatIndex]){
        await deleteChat(chatId)
        chats.value.splice(chatIndex, 1)
    }
}
const loadChats=async()=>{
    try {
        const res=await $fetch<{results:ChatResonseType[],hasMorePages:boolean}>('/api/chat/loadChatSessions',{
            body:JSON.stringify({
                page:paginate.page
            }),
            method:"POST",
        })
        paginate.hasMorePages=res.hasMorePages
        chats.value=chats.value.concat(res.results)
    } catch (error) {
        console.error(error);
    }
}
const saveRename=(chatIndex:number,text:string)=>{
    if(chats.value[chatIndex]){
        const chat=chats.value[chatIndex]
        chats.value[chatIndex].heading=text
        saveSession(chat.id,{heading:text})
    }
}
useInfiniteScroll(el,
    ()=>{
        console.log('yes');
    },
    {
        canLoadMore:()=>{
            return paginate.hasMorePages
        }
    }
)
onMounted(()=>{
    loadChats()
})
</script>

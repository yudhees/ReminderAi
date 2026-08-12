
<template>
    <div class="px-4 pt-2 pb-1 text-[10px] font-extrabold text-slate-600 tracking-wider uppercase">
        Chats
    </div>
    <div class="overflow-y-auto max-h-screen" ref="el">
        <ChatLeftBar v-for="chat in chats" :key="chat.id" :heading="chat.heading" :active="chat.id==chatId" :chatId="chat.id" :remind_time="chat.remind_time" />
    </div>
</template>
<script setup lang="ts">
import ChatLeftBar from './ChatLeftBar.vue';
const el = useTemplateRef('el')
const route=useRoute()
const chatId=computed(()=>route.params.id)
const loading=ref(false)
const paginate=reactive({
    page:1,
    hasMorePages:false
})
type ChatResonseType={
    id:string,
    heading:string,
    remind_time:string,  
}
const chats=shallowRef<ChatResonseType[]>([])
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


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
const {loadChats, deleteSession, saveRename } = useChatSideBarStore()
const { chats, paginate}=storeToRefs(useChatSideBarStore())
const {isRenameOpen}=storeToRefs(useTopBarStore())
useInfiniteScroll(el,
    ()=>{
        console.log('yes');
    },
    {
        canLoadMore:()=>{
            return paginate.value.hasMorePages
        }
    }
)
onMounted(()=>{
    loadChats()
})
</script>

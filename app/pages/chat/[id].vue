<template>
    <Teleport to="#topBarBtns">
        <TopBarChatBtns />
    </Teleport>
    <div id="cm" class="flex-1 overflow-y-auto p-6 flex flex-col gap-4.5 gap-4 bg-[#0f0f15]">
        <NewChatText>
             <ChatInput/>
        </NewChatText>
    </div>
</template>
<script setup>
import ChatInput from '~/components/ui/ChatInput.vue';
import NewChatText from '~/components/ui/NewChatText.vue';
import TopBarChatBtns from '~/components/ui/TopBarChatBtns.vue';

const { setDescription, setLabel } = useTopBarStore()
const route = useRoute()
console.log(route.params.id);
onMounted(() => {
    setLabel('✨ Create New Reminder')
    setDescription('')
})
</script>
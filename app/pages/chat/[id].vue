<template>
    <ClientOnly>
        <Teleport to="#topBarBtns">
            <TopBarChatBtns :open-snooze-on-load="openSnoozeOnLoad" :has-reminder="hasReminder" :can-delete="!isNew" :busy="actionBusy"
                :recurrence="session?.recurrence ?? null" :remind-time="session?.remind_time ?? null"
                @snooze="snooze" @delete="deleteCurrent" @repeat="setRepeat" />
        </Teleport>
    </ClientOnly>
    <div id="cm" class="flex-1 min-h-0 overflow-y-auto sm:p-6 flex flex-col justify-end gap-4 bg-[#0f0f15]">
        <NewChatText v-if="!chatResponses.length && isNew">
             <ChatInput :chat-send="chatSend" :send-chat-disabled="sendChatDisabled" v-model="chatInput" @send="sendChat" :is-new="isNew"/>
        </NewChatText>
    </div>
    <template v-if="chatResponses.length">
        <template v-for="chatResponse in chatResponses" :key="chatResponse._id">
            <AiResponse :is-loading="chatResponse.isLoading" :chat="chatResponse.text" :time="chatResponse.time" v-if="chatResponse.type=='ai'"/>
            <ChatUser :chat="chatResponse.text" :time="chatResponse.time" v-else/>
        </template>
        <div class="sticky bottom-0">
            <ChatInput :chat-send="chatSend" :send-chat-disabled="sendChatDisabled" v-model="chatInput" @send="sendChat" :is-new="false"/>
        </div>
    </template>
    <div ref="bottomEl" class="-mt-6 h-0 shrink-0"></div>
</template>
<script setup>
import AiResponse from '~/components/ui/AiResponse.vue';
import ChatInput from '~/components/ui/ChatInput.vue';
import ChatUser from '~/components/ui/ChatUser.vue';
import NewChatText from '~/components/ui/NewChatText.vue';
import TopBarChatBtns from '~/components/ui/TopBarChatBtns.vue';
import init from '~/composables/chat';
const {chatSend,chatInput,isNew,sendChat,sendChatDisabled,chatResponses,bottomEl,hasReminder,actionBusy,snooze,deleteCurrent,session,setRepeat}=init()
// ?snooze=1 comes from the notification's Snooze button: open the picker once, then drop it from the URL.
const route = useRoute()
const router = useRouter()
const openSnoozeOnLoad = ref(route.query.snooze === '1')
if (openSnoozeOnLoad.value) router.replace({ query: { ...route.query, snooze: undefined } })
</script>
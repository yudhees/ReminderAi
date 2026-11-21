<template>
  <ClientOnly>
    <div class="-mx-3 -mb-4 px-3 pt-3 border-t border-white/5 bg-[#111118] sm:mx-0 sm:mb-0 sm:px-6 sm:pt-3.5" style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom))">
      <ListingBar v-if="chatSend && chatSend.isListening" />
      <div
        class="bg-[#1a1a26] border border-white/10 focus-within:border-indigo-500/40 rounded-2xl px-3.5 py-3 flex items-end gap-2.5">
        <ChatInputBox v-model="chatInput"/>
        <ChatSendBtn ref="chatSend" :disable-chat-send="sendChatDisabled" @send="$emit('send')" @voice="handleVoiceInput"/>
      </div>
      <div class="flex gap-1.5 mt-2.5 flex-wrap" v-if="!isNew">
        <!-- <ChatInputHelpBtn>
          💤 Snooze 1hr
        </ChatInputHelpBtn>
        <ChatInputHelpBtn>
          🔁 Repeat weekly
        </ChatInputHelpBtn>
        <ChatInputHelpBtn>
          📅 Move to tomorrow
        </ChatInputHelpBtn>
        <ChatInputHelpBtn>
          🕐 Check time
        </ChatInputHelpBtn> -->
      </div>
    </div>
  </ClientOnly>
</template>
<script setup>
import ChatInputBox from './ChatInputBox.vue';
import ChatInputHelpBtn from './ChatInputHelpBtn.vue';
import ChatSendBtn from './ChatSendBtn.vue';
import ListingBar from './ListingBar.vue';
defineProps(['chatSend','sendChatDisabled','isNew'])
const chatInput=defineModel()
const emit = defineEmits(['send'])
const handleVoiceInput = (text) => {
  chatInput.value = chatInput.value + text
}
</script>
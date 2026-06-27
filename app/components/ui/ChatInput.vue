<template>
    <div class="px-6 pt-3.5 pb-4.5 border-t border-white/5 bg-[#111118]">
      <ListingBar/>
      <div class="bg-[#1a1a26] border border-white/10 focus-within:border-indigo-500/40 rounded-2xl px-3.5 py-3 flex items-end gap-2.5">
        <ChatInputBox/>
        <ChatSendBtn/>
      </div>
      <div class="flex gap-1.5 mt-2.5 flex-wrap">
        <ChatInputHelpBtn>
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
        </ChatInputHelpBtn>
      </div>
    </div>
</template>
<script setup>
import ChatInputBox from './ChatInputBox.vue';
import ChatInputHelpBtn from './ChatInputHelpBtn.vue';
import ChatSendBtn from './ChatSendBtn.vue';
import ListingBar from './ListingBar.vue';


</script>
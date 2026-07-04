<template>
    <textarea  placeholder="Ask AI to set, edit, snooze… or tap 🎤 to speak" v-model="input"
        class="flex-1 bg-transparent border-none outline-none text-slate-100 text-sm resize-none placeholder:text-slate-600 min-h-[22px] max-h-[120px]"
      ></textarea>
</template>
<script setup>
const input=defineModel()
</script>
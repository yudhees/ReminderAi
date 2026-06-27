<template>
       <button @click="$emit('snooze')" 
       class="bg-[#1c1c2a] border border-white/5 text-slate-400 rounded-lg px-3.5 py-2 text-xs flex items-center gap-1.5 hover:bg-[#2a2a3e]">💤 Snooze</button>
        <button class="bg-[#1c1c2a] border border-white/5 text-red-400 rounded-lg px-3.5 py-2 text-xs hover:bg-[#2a2a3e]" @click="$emit('delete')">🗑 Delete</button>
</template>
<script setup>
defineEmits(['snooze','delete'])
</script>
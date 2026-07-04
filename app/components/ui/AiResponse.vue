<template>
    <div class="flex gap-2.5 max-w-[74%]">
        <div
            class="w-8 h-8 rounded-full bg-[#1c1c30] border border-indigo-500/20 flex items-center justify-center text-sm flex-shrink-0">
            🤖</div>
        <div class="flex flex-col gap-1" v-if="!isLoading">
            <div
                class="bg-[#1c1c2e] border border-white/5 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-slate-200">
                {{ chat }}</div>
            <div class="text-[11px] text-slate-600 px-1">{{ time }}</div>
        </div>
        <div v-else
            class="bg-[#1c1c2e] border border-white/5 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style="animation-delay:.15s"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style="animation-delay:.3s"></span>
        </div>
    </div>
</template>
<script setup>
defineProps({
    chat: {},
    time: {},
    isLoading:{default:false}
})
</script>
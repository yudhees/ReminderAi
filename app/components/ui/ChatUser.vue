<template>
      <div class="flex flex-row-reverse gap-2.5 max-w-[88%] sm:max-w-[74%] self-end">
        <div class="hidden sm:flex w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[13px] font-extrabold flex-shrink-0">{{ firstLetter }}</div>
        <div class="flex flex-col gap-1">
          <div class="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl rounded-tr-sm px-3.5 py-2.5 text-sm break-words sm:px-4 sm:py-3">{{ chat }}</div>
          <div class="text-[11px] text-slate-600 px-1 text-right">{{ time }}</div>
        </div>
      </div>
</template>
<script setup>
defineProps({
    chat:{},
    time:{}
})
const {user}=useAuthStore()
const firstLetter=user.name[0].toLocaleUpperCase()
</script>
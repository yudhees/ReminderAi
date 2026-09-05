<template>
  <NuxtLink :to="{name:'chat-id',params:{id:reminder._id}}"
    class="group bg-[#13131e] border border-white/5 rounded-xl px-4.5 px-4 py-4 flex items-center gap-3.5 cursor-pointer hover:bg-[#1a1a28] hover:border-indigo-500/20">
    <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-bold">{{ reminder.heading }}</div>
      <div class="text-xs text-slate-500 mt-0.5">
        {{ label }}
      </div>
    </div>
    <div class="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">
      Active
    </div>
  </NuxtLink>
</template>
<script setup>
import moment from 'moment'

const props = defineProps(['reminder'])
const label = computed(() => {
  const {reminder}=props
  const date = moment(reminder.remind_time)
  return date.calendar(null, {
    sameDay: '[Today] · h:mm A',
    nextDay: '[Tomorrow] · h:mm A',
    lastDay: '[Yesterday] · h:mm A',
    sameElse: 'ddd · h:mm A'
  })
})

</script>
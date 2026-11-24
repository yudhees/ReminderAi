<template>
  <NuxtLink :to="{name:'chat-id',params:{id:reminder._id}}"
    class="group bg-[#13131e] border border-white/5 rounded-xl px-3 py-3 flex items-center gap-3 sm:px-4 sm:py-4 sm:gap-3.5 cursor-pointer hover:bg-[#1a1a28] hover:border-indigo-500/20">
    <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="status.dot"></div>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-bold line-clamp-2 sm:truncate">{{ reminder.heading }}</div>
      <div class="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
        <span>{{ label }}</span>
        <span class="sm:hidden font-semibold" :class="status.text_class">{{ status.text }}</span>
        <span v-if="repeatLabel" class="text-violet-300">🔁 {{ repeatLabel }}</span>
      </div>
    </div>
    <div class="hidden sm:block text-[11px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap" :class="status.badge">
      {{ status.text }}
    </div>
    <div v-if="actions" class="flex items-center gap-1">
      <button type="button" title="Edit reminder" aria-label="Edit reminder"
        class="h-9 w-9 flex items-center justify-center rounded-md text-slate-400 hover:bg-[#2a2a4d] hover:text-white"
        @click.prevent.stop="$emit('edit', reminder)">✏️</button>
      <button type="button" :title="confirmingDelete ? 'Tap again to delete' : 'Delete reminder'" aria-label="Delete reminder"
        class="h-9 flex items-center justify-center rounded-md px-2 text-xs"
        :class="confirmingDelete ? 'bg-red-500/20 text-red-300' : 'w-9 text-slate-400 hover:bg-red-500/10 hover:text-red-300'"
        @click.prevent.stop="onDelete">{{ confirmingDelete ? 'Delete?' : '🗑' }}</button>
    </div>
  </NuxtLink>
</template>
<script setup>
import moment from 'moment'
import { repeatLabel as formatRepeat } from '~/utils/repeat'

const props = defineProps({
  reminder: { type: Object, required: true },
  actions: { type: Boolean, default: true },
})
const emit = defineEmits(['edit', 'delete'])

const repeatLabel = computed(() => formatRepeat(props.reminder.recurrence))

const status = computed(() => {
  const { reminder } = props
  if (reminder.notification_sent) {
    return { text: 'Done', dot: 'bg-slate-500', badge: 'bg-slate-500/15 text-slate-400', text_class: 'text-slate-400' }
  }
  if (moment(reminder.remind_time).isBefore(moment())) {
    return { text: 'Due', dot: 'bg-amber-500', badge: 'bg-amber-500/15 text-amber-400', text_class: 'text-amber-400' }
  }
  return { text: 'Active', dot: 'bg-emerald-500', badge: 'bg-emerald-500/15 text-emerald-400', text_class: 'text-emerald-400' }
})

const label = computed(() => {
  const {reminder}=props
  const date = moment(reminder.remind_time)
  const now = moment()
  if (date.isSame(now, 'day')) {
    return `Today · ${date.format('h:mm A')}`
  } else if (date.isSame(now.clone().add(1, 'day'), 'day')) {
    return `Tomorrow · ${date.format('h:mm A')}`
  } else if (date.isSame(now.clone().subtract(1, 'day'), 'day')) {
    return `Yesterday · ${date.format('h:mm A')}`
  } else {
    return `${date.format('ddd, D MMM')} · ${date.format('h:mm A')}`
  }
})

// Two-step delete instead of a browser confirm() dialog.
const confirmingDelete = ref(false)
let timer = null
const onDelete = () => {
  if (!confirmingDelete.value) {
    confirmingDelete.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { confirmingDelete.value = false }, 3000)
    return
  }
  clearTimeout(timer)
  confirmingDelete.value = false
  emit('delete', props.reminder)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

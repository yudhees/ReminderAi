<template>
  <Teleport to="body">
    <div v-if="reminder" class="fixed inset-0 z-[10000] flex items-end justify-center bg-black/60 sm:items-center sm:px-4"
      @click.self="$emit('close')" @keydown.esc="$emit('close')">
      <form class="w-full max-w-md bg-[#13131e] border border-white/10 rounded-t-2xl shadow-xl sm:rounded-2xl" style="padding-bottom: env(safe-area-inset-bottom)" @submit.prevent="save">
        <div class="px-5 py-4 border-b border-white/5 text-sm font-bold">✏️ Edit reminder</div>
        <div class="p-5 flex flex-col gap-4">
          <label class="flex flex-col gap-1.5 text-xs text-slate-400">
            Title
            <input v-model="form.heading" maxlength="200" required ref="titleInput"
              class="bg-[#1a1a26] border border-white/10 focus:border-indigo-500/40 rounded-lg px-3 py-2.5 text-base text-slate-100 outline-none sm:py-2 sm:text-sm" />
          </label>
          <label class="flex flex-col gap-1.5 text-xs text-slate-400">
            Date and time
            <input v-model="form.time" type="datetime-local" required :min="minTime"
              class="bg-[#1a1a26] border border-white/10 focus:border-indigo-500/40 rounded-lg px-3 py-2.5 text-base text-slate-100 outline-none [color-scheme:dark] sm:py-2 sm:text-sm" />
          </label>
          <div class="flex flex-col gap-1.5 text-xs text-slate-400">
            Repeat
            <RepeatPicker v-model="form.recurrence" :fallback-day="fallbackDay" />
          </div>
          <p v-if="error" class="text-xs text-red-400">{{ error }}</p>
        </div>
        <div class="px-5 py-4 border-t border-white/5 flex justify-end gap-2">
          <button type="button" class="rounded-lg px-4 py-2.5 text-sm text-slate-400 hover:bg-[#2a2a3e] sm:px-3.5 sm:py-1.5 sm:text-xs" @click="$emit('close')">Cancel</button>
          <Button type="submit" class="px-5 py-2.5 text-sm sm:px-3 sm:py-1.5 sm:text-xs" :disabled="saving || !form.recurrence">{{ saving ? 'Saving…' : 'Save' }}</Button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
<script setup>
import moment from 'moment'
import RepeatPicker from './RepeatPicker.vue'
import Button from './Button.vue'

const props = defineProps({ reminder: { type: Object, default: null } })
const emit = defineEmits(['close', 'saved'])

const form = reactive({ heading: '', time: '', recurrence: 'none' })
const original = reactive({ time: '' })
const saving = ref(false)
const error = ref('')
const titleInput = ref(null)
const minTime = computed(() => moment().format('YYYY-MM-DDTHH:mm'))
const fallbackDay = computed(() => (form.time ? moment(form.time, 'YYYY-MM-DDTHH:mm') : moment()).day())

watch(() => props.reminder, (reminder) => {
  if (!reminder) return
  error.value = ''
  form.heading = reminder.heading ?? ''
  form.time = reminder.remind_time ? moment(reminder.remind_time).format('YYYY-MM-DDTHH:mm') : ''
  form.recurrence = reminder.recurrence || 'none'
  original.time = form.time
  nextTick(() => titleInput.value?.focus())
}, { immediate: true })

const save = async () => {
  error.value = ''
  if (!form.recurrence) {
    error.value = 'Finish choosing how it repeats.'
    return
  }
  const body = { id: props.reminder._id, heading: form.heading.trim(), recurrence: form.recurrence }
  // Only send the time when it changed, so a past reminder can still be renamed.
  if (form.time && form.time !== original.time) {
    const date = moment(form.time, 'YYYY-MM-DDTHH:mm')
    if (!date.isAfter(moment())) {
      error.value = 'Pick a time in the future.'
      return
    }
    body.remind_time = date.toDate().toISOString()
  }
  saving.value = true
  try {
    const res = await $fetch('/api/reminders/update', { method: 'POST', body })
    emit('saved', res.reminder)
  } catch (e) {
    error.value = e?.data?.statusMessage || 'Could not save this reminder.'
  }
  saving.value = false
}
</script>

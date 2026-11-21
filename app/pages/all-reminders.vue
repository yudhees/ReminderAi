<template>
  <div>
    <div class="-mx-3 px-3 pb-3 border-b border-white/5 flex gap-2 items-center overflow-x-auto sm:mx-0 sm:px-1 sm:pb-4 sm:flex-wrap">
      <button v-for="view in views" :key="view.value" type="button" @click="setView(view.value)"
        class="shrink-0 rounded-full px-3.5 py-2 text-xs cursor-pointer border sm:py-1.5"
        :class="filters.view === view.value
          ? 'bg-[#1e1e38] border-indigo-500/40 text-violet-300'
          : 'bg-[#1a1a26] border-white/5 text-slate-500 hover:border-indigo-500/40 hover:text-violet-300'">
        {{ view.label }}
      </button>
    </div>
    <div class="flex-1 py-4 flex flex-col gap-5 sm:py-5 sm:gap-6">
      <div v-if="loading && !reminders.length" class="text-sm text-slate-500">Loading reminders…</div>
      <div v-else-if="!reminders.length" class="text-sm text-slate-500">
        {{ emptyText }}
        <NuxtLink :to="{ name: 'chat-id', params: { id: 'new' } }" class="text-violet-300 hover:underline ml-1">Create one</NuxtLink>
      </div>
      <template v-for="reminder in reminders" :key="reminder._id">
        <ReminderGroup :date="reminder._id">
           <RemindersBox v-for="remin in reminder.reminders" :reminder="remin" :key="remin._id"
             @edit="editing = $event" @delete="deleteReminder"/>
        </ReminderGroup>
      </template>
    </div>
    <ReminderEditModal :reminder="editing" @close="editing = null" @saved="onSaved" />
  </div>
</template>
<script setup lang="ts">
import ReminderGroup from '~/components/ui/ReminderGroup.vue'
import RemindersBox from '~/components/ui/RemindersBox.vue'
import ReminderEditModal from '~/components/ui/ReminderEditModal.vue'

type Reminder = {
  _id: string,
  heading: string,
  remind_time: string,
  recurrence?: string | null,
  notification_sent?: boolean,
}
type RemindersType = {
  _id: string,
  reminders: Reminder[]
}
const views = [
  { label: 'All', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Recurring', value: 'recurring' },
  { label: 'Done', value: 'done' },
]
const reminders = ref<RemindersType[]>([])
const loading = ref(false)
const editing = ref<Reminder | null>(null)
const filters = reactive({
  view: 'all',
})
const emptyText = computed(() => ({
  upcoming: 'No upcoming reminders.',
  recurring: 'No repeating reminders yet.',
  done: 'No finished reminders yet.',
} as Record<string, string>)[filters.view] ?? 'No reminders yet.')

const { $toast } = useNuxtApp() as any
const { removeChat, updateLocalChat } = useChatSideBarStore()

const getReminders = async () => {
  loading.value = true
  try {
    const res = await $fetch<{
      reminders: RemindersType[]
    }>("/api/reminders", {
      query: { ...filters, timezone: userTimezone() },
      method: "POST"
    })
    reminders.value = res.reminders ?? []
  } catch (error) {
    console.error(error);
  }
  loading.value = false
}
const setView = (view: string) => {
  filters.view = view
  getReminders()
}
const deleteReminder = async (reminder: Reminder) => {
  try {
    await removeChat(reminder._id)
    $toast.success('Reminder deleted')
    getReminders()
  } catch (error: any) {
    console.error(error);
    $toast.error(error?.data?.statusMessage || 'Could not delete this reminder')
  }
}
const onSaved = (reminder: Reminder) => {
  editing.value = null
  updateLocalChat(reminder._id, { heading: reminder.heading, remind_time: reminder.remind_time })
  $toast.success('Reminder updated')
  getReminders()
}
const { setLabel, setDescription } = useTopBarStore()
onMounted(() => {
  getReminders()
  setLabel("📋 All Reminders")
  setDescription("")
})
</script>

<template>
  <div>
    <div class="px-7 py-4 border-b border-white/5 flex gap-2.5 items-center">
      <!-- <input placeholder="🔍  Search reminders…"
        class="flex-1 bg-[#1a1a26] border border-white/5 rounded-lg px-3.5 py-2 text-[13px] outline-none focus:border-indigo-500/40 placeholder:text-slate-600" /> -->
      <!-- <div class="bg-[#1e1e38] border border-indigo-500/40 text-violet-300 rounded-full px-3.5 py-1.5 text-xs cursor-pointer">All</div>
      <div class="bg-[#1a1a26] border border-white/5 rounded-full px-3.5 py-1.5 text-xs text-slate-500 cursor-pointer hover:border-indigo-500/40 hover:text-violet-300">Today</div>
      <div class="bg-[#1a1a26] border border-white/5 rounded-full px-3.5 py-1.5 text-xs text-slate-500 cursor-pointer hover:border-indigo-500/40 hover:text-violet-300">Upcoming</div>
      <div class="bg-[#1a1a26] border border-white/5 rounded-full px-3.5 py-1.5 text-xs text-slate-500 cursor-pointer hover:border-indigo-500/40 hover:text-violet-300">Recurring</div>
      <div class="bg-[#1a1a26] border border-white/5 rounded-full px-3.5 py-1.5 text-xs text-slate-500 cursor-pointer hover:border-indigo-500/40 hover:text-violet-300">Completed</div>
      <div class="bg-[#1a1a26] border border-white/5 rounded-full px-3.5 py-1.5 text-xs text-slate-500 cursor-pointer hover:border-indigo-500/40 hover:text-violet-300">Work</div>
      <div class="bg-[#1a1a26] border border-white/5 rounded-full px-3.5 py-1.5 text-xs text-slate-500 cursor-pointer hover:border-indigo-500/40 hover:text-violet-300">Personal</div> -->
    </div>
    <div class="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-6">
      <template v-for="reminder in reminders" :key="reminder._id">
        <ReminderGroup :date="reminder._id">
           <RemindersBox v-for="remin in reminder.reminders" :reminder="remin" :key="remin._id"/>
        </ReminderGroup>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import ReminderGroup from '~/components/ui/ReminderGroup.vue'
import RemindersBox from '~/components/ui/RemindersBox.vue'


type Reminder = {
  _id: string,
  heading: string,
  remind_time: string,
}
type RemindersType = {
  _id: string,
  reminders: Reminder[]
}
const reminders = ref<RemindersType[]>([])
const filters = reactive({
  search: "",
  date: "",
})
const getReminders = async () => {
  try {
    const res = await $fetch<{
      reminders: RemindersType[]
    }>("/api/reminders", {
      query: { ...filters, timezone: userTimezone() },
      method: "POST"
    })
    reminders.value = res.reminders
  } catch (error) {
    console.error(error);
  }
}
const { setLabel } = useTopBarStore()
onMounted(() => {
  getReminders()
  setLabel("📋 All Reminders")
})
</script>
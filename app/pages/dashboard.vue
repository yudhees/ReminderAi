<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div v-for="tile in tiles" :key="tile.label" class="bg-[#13131e] border border-white/5 rounded-xl px-4 py-4">
        <div class="text-xs text-slate-500">{{ tile.icon }} {{ tile.label }}</div>
        <div class="text-2xl font-extrabold mt-1">{{ loading ? '–' : tile.value }}</div>
      </div>
    </div>

    <div class="bg-[#13131e] border border-white/5 rounded-2xl">
      <div class="px-5 py-4 border-b border-white/5 flex items-center justify-between gap-3">
        <div class="text-sm font-bold">⏰ Coming up next</div>
        <NuxtLink :to="{ name: 'all-reminders' }" class="text-xs text-violet-300 hover:underline">See all</NuxtLink>
      </div>
      <div class="p-4 flex flex-col gap-2.5">
        <div v-if="loading" class="text-sm text-slate-500 px-1">Loading…</div>
        <template v-else-if="upcoming.length">
          <RemindersBox v-for="reminder in upcoming" :key="reminder._id" :reminder="reminder" :actions="false" />
        </template>
        <div v-else class="text-sm text-slate-500 px-1 py-2">
          Nothing scheduled. Try “Remind me to drink water every day at 10am”.
        </div>
      </div>
    </div>

    <NuxtLink :to="{ name: 'chat-id', params: { id: 'new' } }" class="self-start">
      <Button class="px-4 py-2 text-sm">✨ New reminder</Button>
    </NuxtLink>
  </div>
</template>
<script setup>
import moment from 'moment'
import RemindersBox from '~/components/ui/RemindersBox.vue'
import Button from '~/components/ui/Button.vue'

const { user } = useAuthStore()
const now = moment()
const {setLabel,setDescription}=useTopBarStore()

const loading = ref(true)
const upcoming = ref([])
const counts = ref({ dueToday: 0, upcoming: 0, recurring: 0, done: 0 })
const tiles = computed(() => [
  { icon: '📅', label: 'Due today', value: counts.value.dueToday },
  { icon: '⏳', label: 'Upcoming', value: counts.value.upcoming },
  { icon: '🔁', label: 'Repeating', value: counts.value.recurring },
  { icon: '✅', label: 'Done', value: counts.value.done },
])

const load = async () => {
  loading.value = true
  try {
    const res = await $fetch('/api/reminders/upcoming', { query: { timezone: userTimezone(), limit: 5 } })
    upcoming.value = res.upcoming
    counts.value = res.counts
  } catch (error) {
    console.error(error)
  }
  loading.value = false
}

onMounted(()=>{
   setLabel(`Hi, ${user?.name ?? 'there'} 👋`)
   setDescription(`${ now.format('dddd') }, ${ now.format('MMM') } ${ now.format('D') }`)
   load()
})
</script>

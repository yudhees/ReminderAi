<template>
    <div class="relative" ref="snoozeWrap">
        <button type="button" @click="snoozeOpen = !snoozeOpen" aria-label="Snooze" :disabled="!hasReminder || busy"
            :title="hasReminder ? 'Snooze this reminder' : 'Set a reminder time first'"
            class="bg-[#1c1c2a] border border-white/5 text-slate-400 rounded-lg h-9 px-2.5 text-xs flex items-center gap-1.5 hover:bg-[#2a2a3e] disabled:opacity-40 disabled:cursor-not-allowed sm:px-3.5">
            💤<span class="hidden sm:inline">Snooze</span>
        </button>
        <div v-if="snoozeOpen"
            class="absolute right-0 top-full mt-1 z-50 min-w-[150px] rounded-lg border border-slate-700 bg-[#14142d] p-1 shadow-lg">
            <button v-for="option in snoozeOptions" :key="option.minutes" type="button"
                class="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-slate-200 transition hover:bg-[#1c1c38]"
                @click="pickSnooze(option.minutes)">
                {{ option.label }}
            </button>
        </div>
    </div>
    <button type="button" :disabled="!canDelete || busy"
        class="border rounded-lg h-9 px-2.5 text-xs whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
        :class="confirmingDelete ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-[#1c1c2a] border-white/5 text-red-400 hover:bg-[#2a2a3e]'"
        :aria-label="confirmingDelete ? 'Tap again to delete' : 'Delete reminder'" @click="onDelete">
        <template v-if="confirmingDelete">Tap again</template>
        <template v-else>🗑<span class="hidden sm:inline"> Delete</span></template>
    </button>
</template>
<script setup>
const props = defineProps({
    hasReminder: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
})
const emit = defineEmits(['snooze', 'delete'])

const snoozeOptions = [
    { label: '10 minutes', minutes: 10 },
    { label: '30 minutes', minutes: 30 },
    { label: '1 hour', minutes: 60 },
    { label: '3 hours', minutes: 180 },
    { label: 'Tomorrow (24 h)', minutes: 1440 },
]
const snoozeOpen = ref(false)
const snoozeWrap = ref(null)
onClickOutside(snoozeWrap, () => { snoozeOpen.value = false })

const pickSnooze = (minutes) => {
    snoozeOpen.value = false
    emit('snooze', minutes)
}

// Two-step delete instead of a browser confirm() dialog.
const confirmingDelete = ref(false)
let confirmTimer = null
const onDelete = () => {
    if (!confirmingDelete.value) {
        confirmingDelete.value = true
        clearTimeout(confirmTimer)
        confirmTimer = setTimeout(() => { confirmingDelete.value = false }, 3000)
        return
    }
    clearTimeout(confirmTimer)
    confirmingDelete.value = false
    emit('delete')
}
onBeforeUnmount(() => clearTimeout(confirmTimer))
</script>

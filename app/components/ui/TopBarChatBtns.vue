<template>
    <button type="button" @click="openSnooze" aria-label="Snooze" :disabled="!hasReminder || busy"
        :title="hasReminder ? 'Snooze this reminder' : 'Set a reminder time first'"
        class="bg-[#1c1c2a] border border-white/5 text-slate-300 rounded-lg h-9 px-2.5 text-xs flex items-center gap-1.5 hover:bg-[#2a2a3e] disabled:opacity-40 disabled:cursor-not-allowed sm:px-3.5">
        💤<span class="hidden sm:inline">Snooze</span>
    </button>
    <!-- Snooze picker: bottom sheet on phones, small dialog on larger screens -->
    <Teleport to="body">
        <div v-if="snoozeOpen" class="fixed inset-0 z-[10000] flex items-end justify-center bg-black/60 sm:items-center sm:px-4"
            @click.self="snoozeOpen = false" @keydown.esc="snoozeOpen = false">
            <div role="dialog" aria-modal="true" aria-labelledby="snooze-title"
                class="w-full max-w-sm rounded-t-2xl border border-white/10 bg-[#16162a] shadow-2xl sm:rounded-2xl"
                style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom))">
                <div class="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20 sm:hidden"></div>
                <div class="flex items-center justify-between px-5 pt-3 pb-2 sm:pt-4">
                    <div id="snooze-title" class="text-base font-bold text-slate-100">💤 Snooze reminder</div>
                    <button type="button" class="h-9 w-9 rounded-lg text-slate-400 hover:bg-white/10" aria-label="Close" @click="snoozeOpen = false">✕</button>
                </div>
                <div class="px-3 pb-2">
                    <button v-for="option in snoozeOptions" :key="option.minutes" type="button"
                        class="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-left hover:bg-white/5 active:bg-white/10"
                        @click="pickSnooze(option.minutes)">
                        <span class="text-[15px] font-semibold text-slate-100">{{ option.label }}</span>
                        <span class="text-sm text-slate-400">until {{ untilLabel(option.minutes) }}</span>
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
    <button type="button" :disabled="!canDelete || busy"
        class="border rounded-lg h-9 px-2.5 text-xs whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
        :class="confirmingDelete ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-[#1c1c2a] border-white/5 text-red-400 hover:bg-[#2a2a3e]'"
        :aria-label="confirmingDelete ? 'Tap again to delete' : 'Delete reminder'" @click="onDelete">
        <template v-if="confirmingDelete">Tap again</template>
        <template v-else>🗑<span class="hidden sm:inline"> Delete</span></template>
    </button>
</template>
<script setup>
import { SNOOZE_OPTIONS, snoozeUntilLabel } from '~/utils/snoozeOptions'
const props = defineProps({
    hasReminder: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
    // Opened from the notification's Snooze button: show the picker straight away.
    openSnoozeOnLoad: { type: Boolean, default: false },
})
const emit = defineEmits(['snooze', 'delete'])

const snoozeOptions = SNOOZE_OPTIONS
const snoozeOpen = ref(false)
const now = ref(Date.now())
const openSnooze = () => {
    now.value = Date.now()
    snoozeOpen.value = true
}
const untilLabel = (minutes) => snoozeUntilLabel(minutes, now.value)
watch(() => props.openSnoozeOnLoad && props.hasReminder, (open) => { if (open) openSnooze() }, { immediate: true })

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

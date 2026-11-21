<template>
  <ClientOnly>
    <Teleport to="body">
      <div v-if="activeAlarm" class="fixed inset-0 z-[10001] flex items-center justify-center bg-black/70 px-4" role="alertdialog"
        aria-live="assertive" :aria-label="`Reminder: ${activeAlarm.body || activeAlarm.title}`">
        <div class="w-full max-w-sm bg-[#13131e] border border-indigo-500/30 rounded-2xl p-6 text-center shadow-2xl">
          <div class="text-5xl animate-bounce">⏰</div>
          <div class="mt-3 text-xs uppercase tracking-wider text-slate-500">{{ activeAlarm.title }}</div>
          <div class="mt-1 text-lg font-extrabold text-slate-100 break-words">{{ activeAlarm.body }}</div>
          <button v-if="needsTap" type="button" @click="retryAlarmSound"
            class="mt-4 w-full rounded-xl border border-white/10 bg-[#1c1c2a] py-2.5 text-sm text-slate-300">
            🔊 Tap to play the alarm sound
          </button>
          <div v-if="!choosingSnooze" class="mt-5 grid grid-cols-2 gap-2.5">
            <button type="button" @click="choosingSnooze = true"
              class="rounded-xl border border-white/10 bg-[#1c1c2a] py-3 text-sm font-bold text-slate-200 hover:bg-[#2a2a3e]">💤 Snooze…</button>
            <button type="button" @click="dismissAlarm"
              class="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 py-3 text-sm font-bold text-white hover:opacity-90">✋ Stop</button>
          </div>
          <div v-else class="mt-5 text-left">
            <div class="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Snooze for</div>
            <button v-for="option in SNOOZE_OPTIONS" :key="option.minutes" type="button" @click="snoozeAlarm(option.minutes)"
              class="flex w-full items-center justify-between rounded-xl px-3 py-3 hover:bg-white/5 active:bg-white/10">
              <span class="text-[15px] font-semibold text-slate-100">{{ option.label }}</span>
              <span class="text-sm text-slate-400">until {{ snoozeUntilLabel(option.minutes) }}</span>
            </button>
            <button type="button" @click="choosingSnooze = false"
              class="mt-2 w-full rounded-xl border border-white/10 py-2.5 text-sm text-slate-400 hover:bg-white/5">Back</button>
          </div>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>
<script setup>
import { SNOOZE_OPTIONS, snoozeUntilLabel } from '~/utils/snoozeOptions'
const { activeAlarm, needsTap, dismissAlarm, snoozeAlarm, retryAlarmSound } = useNotificationSound()
const choosingSnooze = ref(false)
// Each new alarm starts on the Snooze / Stop choice.
watch(() => activeAlarm.value?.reminderId, () => { choosingSnooze.value = false })
</script>

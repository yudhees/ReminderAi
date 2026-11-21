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
          <div class="mt-5 grid grid-cols-2 gap-2.5">
            <button type="button" @click="snoozeAlarm(10)"
              class="rounded-xl border border-white/10 bg-[#1c1c2a] py-3 text-sm font-bold text-slate-200 hover:bg-[#2a2a3e]">💤 Snooze 10 min</button>
            <button type="button" @click="dismissAlarm"
              class="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 py-3 text-sm font-bold text-white hover:opacity-90">✋ Stop</button>
          </div>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>
<script setup>
const { activeAlarm, needsTap, dismissAlarm, snoozeAlarm, retryAlarmSound } = useNotificationSound()
</script>

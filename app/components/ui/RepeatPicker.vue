<template>
  <div class="flex flex-col gap-3">
    <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Repeat">
      <button v-for="preset in presets" :key="preset.mode" type="button" role="radio" :aria-checked="state.mode === preset.mode"
        class="rounded-xl border px-3 py-2.5 text-left text-sm leading-tight transition-colors sm:py-2 sm:text-[13px]"
        :class="state.mode === preset.mode ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200' : 'border-white/10 bg-[#1a1a26] text-slate-300 hover:bg-[#22222f]'"
        @click="state.mode = preset.mode">
        {{ preset.label }}
      </button>
    </div>

    <div v-if="state.mode === 'days'" class="flex flex-col gap-2">
      <div class="flex justify-between gap-1.5">
        <button v-for="(day, i) in dayShort" :key="day" type="button" :aria-pressed="state.days.includes(i)" :aria-label="day"
          class="h-10 flex-1 rounded-full border text-sm font-semibold sm:h-9 sm:text-xs"
          :class="state.days.includes(i) ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-white/10 bg-[#1a1a26] text-slate-400 hover:bg-[#22222f]'"
          @click="toggleDay(i)">
          {{ day.charAt(0) }}
        </button>
      </div>
      <p class="text-xs" :class="state.days.length ? 'text-slate-400' : 'text-amber-400'">
        {{ state.days.length ? `Repeats on ${daysText}` : 'Pick at least one day.' }}
      </p>
    </div>

    <div v-if="state.mode === 'every'" class="flex flex-col gap-2">
      <div class="flex items-center gap-2 text-sm text-slate-300">
        <span>Every</span>
        <input v-model.number="state.everyN" type="number" inputmode="numeric" min="1" :max="unitMax" aria-label="How many"
          class="w-20 rounded-lg border border-white/10 bg-[#1a1a26] px-3 py-2 text-base text-slate-100 outline-none focus:border-indigo-500/40 sm:py-1.5 sm:text-sm" />
        <select v-model="state.everyUnit" aria-label="Unit"
          class="rounded-lg border border-white/10 bg-[#1a1a26] px-3 py-2 text-base text-slate-100 outline-none sm:py-1.5 sm:text-sm">
          <option v-for="unit in units" :key="unit.value" :value="unit.value">{{ unit.label }}</option>
        </select>
      </div>
      <p v-if="!model" class="text-xs text-amber-400">Enter a number from 1 to {{ unitMax }}.</p>
    </div>
  </div>
</template>
<script setup>
import { REPEAT_PRESETS, DAY_SHORT, EVERY_UNITS, parseRepeat, buildRepeat } from '~/utils/repeat'

// v-model: the repeat value to save ('none', 'daily', 'days:mon,wed', 'every:3h' …), or null while incomplete.
const model = defineModel({ type: [String, null], default: 'none' })
const props = defineProps({
  // Weekday (0 = Sun) preselected when switching to "Pick days".
  fallbackDay: { type: Number, default: () => new Date().getDay() },
})

const presets = REPEAT_PRESETS
const dayShort = DAY_SHORT
const units = EVERY_UNITS
const state = reactive(parseRepeat(model.value, props.fallbackDay))

const unitMax = computed(() => units.find(u => u.value === state.everyUnit)?.max ?? 99)
const daysText = computed(() => [...state.days].sort((a, b) => a - b).map(d => DAY_SHORT[d]).join(', '))
const toggleDay = (i) => {
  state.days = state.days.includes(i) ? state.days.filter(d => d !== i) : [...state.days, i]
}

watch(state, () => { model.value = buildRepeat(state) }, { deep: true })
watch(model, (value) => {
  if (value === null || value === buildRepeat(state)) return
  Object.assign(state, parseRepeat(value, props.fallbackDay))
})
</script>

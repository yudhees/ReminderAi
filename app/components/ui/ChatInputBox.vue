<template>
  <textarea placeholder="Ask AI to set, edit, snooze… or tap 🎤 to speak" v-model="input" ref="textArea"
    class="flex-1 bg-transparent border-none outline-none text-slate-100 text-sm resize-none placeholder:text-slate-600 min-h-[22px] max-h-[120px]"></textarea>
</template>
<script setup>
const input = defineModel();
const textArea = ref(null);
onMounted(() => {
  toggleTextAreaFocus()
});
const toggleTextAreaFocus = () => {
  nextTick(() => {
    textArea.value.focus();
  });
}
onKeyStroke('Enter', (e) => {
  if (e.shiftKey) {
    return 
  }
  e.preventDefault()
}, { target: textArea })
onKeyStroke((e) => {
  if (!input.value) {
    if (/^[a-zA-Z]$/.test(e.key)) {
      input.value = e.key
      toggleTextAreaFocus()
    }
  }
});
</script>

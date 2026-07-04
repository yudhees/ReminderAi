<template>
  <button id="vbtn" @click="toggleVoice"
    class="w-9 h-9 rounded-full bg-[#1e1e38] border border-indigo-500/30 text-indigo-400 flex items-center justify-center flex-shrink-0 text-base hover:bg-indigo-500 hover:text-white transition-colors"
    :disabled="!isSupported"
    :class="{
    'bg-red-500': isListening,
    'border-red-500': isListening,
    'text-white': isListening
  }"
    >{{isListening?'⏹':'🎤'}}</button>

  <button @click="!disableChatSend && $emit('send')" :disabled="disableChatSend"
    class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30 hover:scale-110 transition-transform cursor-pointer">
    <svg width="15" height="15" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  </button>
  {{ result }}
</template>
<script setup>
defineEmits(['voice', 'send'])
defineProps({
  disableChatSend:{default:false}
})
const { user } = useAuthStore()
const {
  isSupported,
  isListening,
  isFinal,
  result,
  confidence,
  start,
  stop,
} = useSpeechRecognition({
  lang: user.ai_input_language,
  continuous: true,
  interimResults: true,
})
const toggleVoice = () => {
  if(!isListening.value){
    start()
  }else{
    stop()
  }
}
onMounted(() => {

})
defineExpose({isListening})
</script>
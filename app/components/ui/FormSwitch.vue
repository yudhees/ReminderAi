<template>
    <div class="w-11 h-6 rounded-full cursor-pointer relative transition-colors flex-shrink-0" @click="toggle"
        role="switch" :aria-checked="Boolean(check)" tabindex="0" @keydown.enter.prevent="toggle" @keydown.space.prevent="toggle"
        :class="check ? 'bg-indigo-500' : 'bg-slate-600'">
        <div class="w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] left-[3px] transition-transform"
            :class="{ 'translate-x-5': check }"></div>
    </div>
</template>
<script setup>
const props=defineProps(['checked','disabled'])
const check = defineModel();
const emit = defineEmits([ 'change'])
const toggle = () => {
    if(props.disabled)return;
    check.value = !check.value
    emit("change",check.value)
}
const updateChecked=()=>{
    if(props.checked===undefined)return
    check.value=Boolean(props.checked)
}
watch(()=>props.checked,()=>{
    updateChecked()
})
onMounted(()=>{
    updateChecked()
})
</script>

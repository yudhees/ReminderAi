<template>
    <div class="flex items-center justify-between px-5 py-3.5 border-b border-white/5 hover:bg-[#1a1a26]">
        <div>
            <div class="text-sm font-semibold">{{ heading }}</div>
            <div class="text-xs text-slate-500 mt-0.5">{{ description }}</div>
        </div>
        <slot></slot>
        <FormSwitch v-if="!slots.default"/>
    </div>
</template>
<script setup>
import FormSwitch from './FormSwitch.vue';
defineProps(['heading','description'])
const slots=useSlots()
</script>
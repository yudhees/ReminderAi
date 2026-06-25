<template>
    <select class="bg-[#1a1a26] border border-white/5 rounded-lg px-3 py-1.5 text-[13px] outline-none cursor-pointer" v-model="select">
        <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
        </option>
    </select>
</template>

<script setup>
const select = defineModel();
defineProps({
    options: {},
});
</script>

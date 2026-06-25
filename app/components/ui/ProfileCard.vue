<template>
    <div class="bg-[#13131e] border border-white/5 rounded-2xl">
        <div class="px-5 py-4 border-b border-white/5 text-sm font-bold flex items-center gap-2">
             {{ heading }}
        </div>
        <slot></slot>
    </div>
</template>
<script setup>
defineProps(['heading'])
</script>
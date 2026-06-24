<template>
    <div class="px-4 py-4 border-b border-white/5 flex items-center justify-between gap-3">
        <div class="text-base font-extrabold text-violet-400">⏰ RemindAI</div>
        <div class="flex items-center gap-2">
            <Button>
                + New
            </Button>
            <label for="sidebar-toggle"
                class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/5 bg-white/5 text-sm text-slate-400 hover:bg-white/10 lg:hidden"
                aria-label="Close sidebar">✕</label>
        </div>
    </div>

</template>
<script setup>
import Button from '~/components/ui/Button.vue';

</script>
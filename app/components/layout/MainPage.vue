<template>
    <main class="min-w-0 min-h-screen flex flex-col lg:h-screen lg:flex-1 lg:overflow-hidden">
        <div
            class="px-4 py-4 border-b border-white/5 bg-[#111118] flex flex-col gap-3 sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-7">
            <div class="flex min-w-0 items-start gap-3">
                <label for="sidebar-toggle"
                    class="mt-0.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/5 bg-[#1c1c2a] text-lg text-slate-300 hover:bg-[#2a2a3e] lg:hidden"
                    aria-label="Open sidebar">☰</label>
                <div class="min-w-0">
                    <h2 class="text-lg font-extrabold sm:text-xl">
                        {{ label }}
                    </h2>
                    <div class="text-[13px] text-slate-500 mt-0.5">{{ description }}</div>
                    <!-- · 2 reminders due today -->
                </div>
            </div>
            <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-2.5" id="topBarBtns">
                <template  v-if="isDefaultTopBarBtns">
                    <button
                        class="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-[#1c1c2a] px-3.5 py-2 text-[13px] text-slate-400 hover:bg-[#2a2a3e] sm:flex-none">🎤
                        Voice</button>
                    <button
                        class="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-[#1c1c2a] px-3.5 py-2 text-[13px] text-slate-400 hover:bg-[#2a2a3e] sm:flex-none">
                        🔔 Notifications <span class="bg-red-500 text-white rounded-full px-1.5 text-[10px] ml-0.5">3</span>
                    </button>
                    <router-link :to="{name:'profile'}">
                        <img :src="user.image" class="hidden w-[34px] h-[34px] rounded-full cursor-pointer sm:flex" /></router-link>
                </template>
            </div>
        </div>
        <div class="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-6 sm:px-6 lg:px-7 lg:py-6">
            <slot></slot>
        </div>
    </main>
</template>
<script setup>
const { user } = useAuthStore()
const { description, label } = storeToRefs(useTopBarStore())
const route=useRoute()
const isDefaultTopBarBtns=computed(()=>!(['chat-id']).includes(route.name))
</script>
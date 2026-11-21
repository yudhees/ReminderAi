<template>
    <main class="flex h-[100dvh] min-w-0 flex-1 flex-col overflow-hidden">
        <div
            class="shrink-0 px-3 py-3 border-b border-white/5 bg-[#111118] flex items-center justify-between gap-2 sm:px-6 sm:py-4 lg:px-7"
            style="padding-top: max(0.75rem, env(safe-area-inset-top))">
            <div class="flex min-w-0 flex-1 items-center gap-3">
                <label for="sidebar-toggle"
                    class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/5 bg-[#1c1c2a] text-lg text-slate-300 hover:bg-[#2a2a3e] lg:hidden"
                    aria-label="Open sidebar">☰</label>
                <div class="min-w-0">
                    <h2 class="truncate text-base font-extrabold sm:text-xl sm:whitespace-normal">
                        {{ label }}
                    </h2>
                    <div class="truncate text-xs text-slate-500 mt-0.5 sm:text-[13px]" v-if="description">{{ description }}</div>
                    <!-- · 2 reminders due today -->
                </div>
            </div>
            <div class="flex shrink-0 items-center justify-end gap-2 sm:gap-2.5" id="topBarBtns">
                <template  v-if="isDefaultTopBarBtns">
                    <button v-if="!enabled" :disabled="loading" title="Enable notifications" aria-label="Enable notifications"
                        class="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-[#1c1c2a] px-2.5 text-[13px] text-slate-400 hover:bg-[#2a2a3e] sm:px-3.5" @click="enablePush">
                        🔔<span class="hidden sm:inline">Enable notifications</span></button>
                    <router-link :to="{name:'profile'}">
                        <img :src="user.image" class="hidden w-[34px] h-[34px] rounded-full cursor-pointer sm:flex" /></router-link>
                </template>
            </div>
        </div>
        <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-4 flex flex-col gap-6 sm:px-6 sm:py-5 lg:px-7 lg:py-6">
            <slot></slot>
        </div>
    </main>
</template>
<script setup>
const { user } = useAuthStore()
const { description, label } = storeToRefs(useTopBarStore())
const route=useRoute()
const isChat=computed(()=>route.name==='chat-id')
const isDefaultTopBarBtns=computed(()=>!isChat.value)
const {
  isSupported,
  hasAlreadySubscribed,
  enableNotifications
} = usePushNotifications()

const loading = ref(false)
const justEnabled = ref(false)
// Hide the button once this device is subscribed.
const enabled = computed(() => justEnabled.value || (isSupported.value && hasAlreadySubscribed.value))

async function enablePush() {
  try {
    loading.value = true

    await enableNotifications()

    justEnabled.value = true
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <input id="sidebar-toggle" type="checkbox" class="peer hidden"/>
  <label for="sidebar-toggle" class="fixed inset-0 z-40 hidden bg-black/60 peer-checked:block lg:hidden" aria-label="Close sidebar"></label>
  <aside class="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[84vw] -translate-x-full flex-col overflow-y-auto bg-[#111118] border-r border-white/5 transition-transform duration-300 peer-checked:translate-x-0 lg:static lg:z-auto lg:h-screen lg:w-[260px] lg:min-w-[260px] lg:max-w-none lg:translate-x-0 lg:overflow-hidden">
    <AppLogo />
    <nav class="flex flex-col gap-0.5 p-2">
      <NuxtLink v-for="route,index in routes" :key="`${index}-route`" :to="route.to"
        class="shrink-0 flex items-center gap-2.5 px-3 py-3 cursor-pointer rounded-lg text-sm lg:py-2.5 lg:text-[13px] text-slate-400 hover:bg-[#1c1c2a] hover:text-slate-200 transition-colors"
        exact-active-class="!bg-[#1c1c38] !text-violet-300 font-semibold">
        {{ route.label }}</NuxtLink>
        <ChatSideBar/>
    </nav>
    <router-link :to="{name:'profile'}" class="block mt-auto px-4 py-3.5 border-t border-white/5 flex items-center gap-2.5">
      <img :src="user.image"  class="w-8.5 h-8.5 w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0"/>
      <div class="min-w-0">
        <div class="text-[13px] font-bold truncate">{{ user.name }}</div>
        <div class="text-[11px] text-slate-500 truncate">{{ user.email }}</div>
      </div>
    </router-link>
  </aside>
</template>
<script setup>
import AppLogo from './AppLogo.vue';
import ChatSideBar from './ChatSideBar.vue';
const {user}=useAuthStore()
// On phones the sidebar is a drawer: close it whenever the page changes.
const route = useRoute()
watch(() => route.fullPath, () => {
  const toggle = document.getElementById('sidebar-toggle')
  if (toggle) toggle.checked = false
})
const routes = [
  { label: "🏠 Dashboard" ,to:{name:"dashboard"}},
  { label: "➕ New Reminder",to:{name:"chat-id",params:{id:'new'}}},
  { label: "📋 All Reminders",to:{name:"all-reminders"}},
  { label: "⚙️ Settings", to:{name:"profile"}},
]
</script>

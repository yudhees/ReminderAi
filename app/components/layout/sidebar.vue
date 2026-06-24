<template>
  <input id="sidebar-toggle" type="checkbox" class="peer hidden"/>
  <label for="sidebar-toggle" class="fixed inset-0 z-40 hidden bg-black/60 peer-checked:block lg:hidden" aria-label="Close sidebar"></label>
  <aside class="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[84vw] -translate-x-full flex-col overflow-y-auto bg-[#111118] border-r border-white/5 transition-transform duration-300 peer-checked:translate-x-0 lg:static lg:z-auto lg:h-screen lg:w-[260px] lg:min-w-[260px] lg:max-w-none lg:translate-x-0 lg:overflow-hidden">
    <AppLogo />
    <nav class="flex flex-col gap-0.5 p-2">
      <NuxtLink v-for="route,index in routes" :key="`${index}-route`"
        class=" shrink-0 flex items-center gap-2.5 px-3 py-2.5 cursor-pointer rounded-lg text-[13px]"
        :class="{
          'text-slate-400 hover:bg-[#1c1c2a] hover:text-slate-200 transition-colors':true,
          'bg-[#1c1c38] text-violet-300 font-semibold':false
        }">
        {{ route.label }}</NuxtLink>
    </nav>
    <div class="mt-auto px-4 py-3.5 border-t border-white/5 flex items-center gap-2.5">
      <img :src="user.image"  class="w-8.5 h-8.5 w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0"/>
      <div>
        <div class="text-[13px] font-bold">{{ user.name }}</div>
        <div class="text-[11px] text-slate-500">{{ user.email }}</div>
      </div>
    </div>
  </aside>
</template>
<script setup>
import AppLogo from './AppLogo.vue';
const {user}=useAuthStore()
console.log(user);

const routes = [
  { label: "🏠 Dashboard" },
  { label: "➕ New Reminder" },
  { label: "📋 All Reminders" },
  { label: "🔔 Notifications" },
  { label: "⚙️ Settings" },
]
</script>

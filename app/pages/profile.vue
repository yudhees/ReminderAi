<template>
     <Layout>
          <template #left>
               <ProfileCard heading="👤 Profile">
                    <div class="flex items-center gap-4 p-5">
                         <img class="w-16 h-16 rounded-full flex-shrink-0"  :src="user.image"/>
                    <div>
                         <div class="text-lg font-extrabold">{{ user.name}}</div>
                         <div class="text-[13px] text-slate-500 mt-0.5">
                              {{ user.email }} · Google Account
                         </div>
                         <div class="flex gap-2 mt-2.5">
                              <button class="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3.5 py-1.5 text-xs hover:bg-red-500/20" type="button" @click="logout">
                                   ↩ Sign Out
                              </button>
                         </div>
                    </div>
                    </div>
               </ProfileCard>
               <ProfileCard heading="🔔 Notifications">
                    <NotificationBarLayout heading="Push Notifications" description="Receive alerts in browser"/>
                    <NotificationBarLayout heading="Email Reminders" description="Backup alerts to your email"/>
                    <NotificationBarLayout heading="Email Reminders" description="Backup alerts to your email"/>
                    <NotificationBarLayout heading="Sound Alerts" description="Play a chime when reminder fires"/>
                    <NotificationBarLayout heading="Default Early Reminder" description="Notify me before the set time">
                         <Select :options="reminderOptions"/>
                    </NotificationBarLayout>
               </ProfileCard>
               <ProfileCard heading="🤖 AI Settings">
                    <NotificationBarLayout heading="AI Language" description="Language for voice and chat input">
                          <Select :options="languageOptions"/>
                    </NotificationBarLayout>
               </ProfileCard>
          </template>
     </Layout>
</template>
<script setup>
import Layout from "~/components/profile/layout.vue";
import NotificationBarLayout from "~/components/ui/NotificationBarLayout.vue";
import ProfileCard from "~/components/ui/ProfileCard.vue";
import Select from "~/components/ui/Select.vue";

const { setLabel, setDescription } = useTopBarStore();
const {user,logout}=useAuthStore()
const reminderOptions=[
     {label:'15 minues',value:15},
     {label:'30 minues',value:30},
     {label:'1 hour',value:60},
]
const languageOptions=[
     {label:"English",value:'english'},
     {label:"Tamil",value:'tamil'},
     {label:"Hindi",value:'hindi'},
     {label:"Spanish",value:'spanish'},
]
onMounted(() => {
     setLabel("⚙️ Settings");
     setDescription("");
});
</script>

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
                    <NotificationBarLayout heading="Push Notifications" description="Receive alerts in browser"
                    v-model="form.push_notification" 
                    @change="save('push_notification')"/>
                    <!-- <NotificationBarLayout heading="Email Reminders" description="Backup alerts to your email" v-model="form.email_reminders"
                    @change="save('email_reminders')"
                    /> -->
                    <!-- <NotificationBarLayout heading="Sound Alerts" description="Play a chime when reminder fires" v-model="form.sound_alerts"
                    @change="save('sound_alerts')"
                    /> -->
                    <!-- new sound selector -->
                    <NotificationBarLayout heading="Sound" description="Choose notification sound">
                         <div class="flex items-center gap-2">
                              <Select :options="soundOptions" v-model="form.notification_sound" 
                              @change="()=>{
                                   save('notification_sound')
                                   playSound(form.notification_sound)
                              }"/>
                              <button type="button" class="p-2 rounded-md hover:bg-slate-100 cursor-pointer" :disabled="!form.notification_sound" @click="playSound(form.notification_sound)">
                                   <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path d="M6.5 5.5v9a1 1 0 0 0 1.555.832L15.5 11.832A1 1 0 0 0 15.5 9.168L8.055 4.668A1 1 0 0 0 6.5 5.5z"/>
                                   </svg>
                              </button>
                         </div>
                    </NotificationBarLayout>
                    <!-- <NotificationBarLayout heading="Default Early Reminder" description="Notify me before the set time">
                         <Select :options="reminderOptions" v-model="form.default_daily_reminders_in_mins"  @change="save('default_daily_reminders_in_mins')"/>
                    </NotificationBarLayout> -->
               </ProfileCard>
               <ProfileCard heading="🤖 AI Settings">
                    <NotificationBarLayout heading="AI Language" description="Language for voice and chat input">
                          <Select :options="languageOptions" v-model="form.ai_input_language" @change="save('ai_input_language')"/>
                    </NotificationBarLayout>
               </ProfileCard>
          </template>
     </Layout>
</template>
<script setup>
import pick from "lodash/pick.js";
import moment from "moment-timezone";
import Layout from "~/components/profile/layout.vue";
import NotificationBarLayout from "~/components/ui/NotificationBarLayout.vue";
import ProfileCard from "~/components/ui/ProfileCard.vue";
import Select from "~/components/ui/Select.vue";
import { useWebNotification } from '@vueuse/core'
const {isSupported,show}=useWebNotification()
console.log(isSupported.value);
const { setLabel, setDescription } = useTopBarStore();
const {user,logout}=useAuthStore()
const form =reactive({
     ...pick(user,["ai_input_language",'push_notification','email_reminders','sound_alerts','default_daily_reminders_in_mins','notification_sound']),
})
const save=async(key)=>{
     try {
          const res=await $fetch('/api/user/updateProfile',{method:"POST",body:{[key]:form[key]}})
          success("Saved")
     } catch (error) {
        console.error(error)
     }
}
const reminderOptions=[
     {label:'15 minues',value:15},
     {label:'30 minues',value:30},
     {label:'1 hour',value:60},
]
const languageOptions=speechLanguages.map(val=>{
     return {
          label:val.name,
          value:val.code
     }
})

const soundOptions = ref([
     {label:"Alarm",value:"alarm"},
     {label:"Critical Alarm",value:"critical_alarm"},
     {label:"DIgital Beep",value:"digital_beep"},
     {label:"Success",value:"success"},
     {label:"Urgent Alert",value:"urgent_alert"},
     {label:"Warning",value:"warning"},
]);
const playSound = (file) => {
     if (!file) return;
     try {
          const audio = new Audio(`/sounds/${file}.mp3`);
          audio.play().catch();
     } catch (e) {
          console.error(e);
     }
}

onMounted(() => {
     setLabel("⚙️ Settings");
     setDescription("");
     show({title:"test"})
});
</script>

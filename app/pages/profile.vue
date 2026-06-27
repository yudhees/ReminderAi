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
                    <NotificationBarLayout heading="Push Notifications" description="Receive alerts in browser" v-model="form.push_notification" 
                    @change="save('push_notification')"/>
                    <NotificationBarLayout heading="Email Reminders" description="Backup alerts to your email" v-model="form.email_reminders"
                    @change="save('email_reminders')"
                    />
                    <NotificationBarLayout heading="Sound Alerts" description="Play a chime when reminder fires" v-model="form.sound_alerts"
                    @change="save('sound_alerts')"
                    />
                    <NotificationBarLayout heading="Default Early Reminder" description="Notify me before the set time">
                         <Select :options="reminderOptions" v-model="form.default_daily_reminders_in_mins"  @change="save('default_daily_reminders_in_mins')"/>
                    </NotificationBarLayout>
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
import { pick } from "lodash";
import Layout from "~/components/profile/layout.vue";
import NotificationBarLayout from "~/components/ui/NotificationBarLayout.vue";
import ProfileCard from "~/components/ui/ProfileCard.vue";
import Select from "~/components/ui/Select.vue";

const { setLabel, setDescription } = useTopBarStore();
const {user,logout}=useAuthStore()
const form =reactive({
     ...pick(user,["ai_input_language",'push_notification','email_reminders','sound_alerts','default_daily_reminders_in_mins']),
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
onMounted(() => {
     setLabel("⚙️ Settings");
     setDescription("");
});
</script>

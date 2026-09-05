<template>
      <div>
        <div class="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">{{ label }}</div>
        <div class="flex flex-col gap-2.5">
            <slot></slot>
        </div>
      </div>
</template>
<script setup>
import moment from 'moment'

const props=defineProps(['date'])
const label=computed(()=>{
    const {date}=props
    const momemtDate=moment(date)    
    if(momemtDate.format("YYYY-MM-DD") == moment().format("YYYY-MM-DD"))
       return "Today"
    if(momemtDate.format("YYYY-MM-DD") == moment().add(1,"day").format("YYYY-MM-DD"))
       return "Tomorrow"

    return momemtDate.format("DD MMM YYYY")
})
</script>
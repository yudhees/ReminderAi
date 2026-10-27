<template>

     Dashboard
</template>
<script setup>
import moment from 'moment'
const { user } = useAuthStore()
const now = moment()
const {setLabel,setDescription}=useTopBarStore()
onMounted(()=>{
   setLabel(`Hi, ${user.name} 👋`)
   setDescription(`${ now.format('dddd') }, ${ now.format('MMM') } ${ now.format('D') }`)
})
</script>
<template>

     Dashboard
</template>
<script setup>
import moment from 'moment'
const { user } = useAuthStore()
const momemt = moment()
const {setLabel,setDescription}=useTopBarStore()
onMounted(()=>{
   setLabel(`Hi, ${user.name} 👋`)
   setDescription(`${ momemt.format('dddd') }, ${ momemt.format('m') } ${ momemt.date() }`)   
})
</script>
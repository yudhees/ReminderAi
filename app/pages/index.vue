<template>
    Index {{ data.label }}
</template>
<script setup>
const data=await $fetch('/api/test',{method:"POST"})
console.log(data);

</script>
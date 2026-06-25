<template>
    <div class="w-11 h-6 rounded-full cursor-pointer relative transition-colors flex-shrink-0" @click="check=!check"
        :class="{'bg-indigo-500': check }">
        <div class="w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] left-[3px] transition-transform"
         :class="{'translate-x-5': check, }"
        ></div>
    </div>
</template>
<script setup>
const check = defineModel();
</script>

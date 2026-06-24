
<template>
    <div class="min-h-screen overflow-x-hidden bg-[#0f0f13] text-slate-100 font-sans lg:h-screen lg:flex lg:overflow-hidden">
        <Sidebar/>
        <MainPage>
            <slot></slot>
        </MainPage>
    </div>
</template>
<script setup lang="ts">
import MainPage from '~/components/layout/MainPage.vue';
import Sidebar from '~/components/layout/sidebar.vue';

</script>
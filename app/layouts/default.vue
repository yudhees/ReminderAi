
<template>
    <div class="flex h-[100dvh] overflow-hidden bg-[#0f0f13] text-slate-100 font-sans">
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
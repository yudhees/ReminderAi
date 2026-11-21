<template>
    <NuxtPwaManifest />
    <NuxtLayout>
        <NuxtPage/>
    </NuxtLayout>
    <AlarmOverlay />
</template>

<script setup>
import AlarmOverlay from '~/components/ui/AlarmOverlay.vue'
</script>

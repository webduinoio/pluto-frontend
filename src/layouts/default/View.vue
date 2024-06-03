<script lang="ts" setup>
import TheNotification from '@/components/TheNotification.vue';
//
</script>

<template>
  <v-main>
    <router-view v-slot="{ Component }">
      <KeepAlive include="HomeView">
        <component :is="Component"></component>
      </KeepAlive>
    </router-view>
    <TheNotification />
  </v-main>
</template>

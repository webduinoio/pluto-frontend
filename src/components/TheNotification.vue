<script setup lang="ts">
import { NOTIFICATION_TIMEOUT } from '@/config';
import { useNotificationStore } from '@/stores/notification';

const store = useNotificationStore();
</script>

<template>
  <v-snackbar
    v-model="store.show"
    :location="store.location"
    :timeout="NOTIFICATION_TIMEOUT"
    min-width="unset"
    :style="{
      top: store.location.includes('top') ? '70px' : 'unset',
    }"
  >
    {{ store.message }}
  </v-snackbar>
</template>

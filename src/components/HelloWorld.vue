<script setup lang="ts">
defineProps<{
  msg: string;
}>();
</script>

<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <v-img contain height="200" src="@/assets/logo.png" />
      <h1 class="green">{{ msg }}</h1>
    </v-responsive>
  </v-container>
</template>

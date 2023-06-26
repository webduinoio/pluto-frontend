<script lang="ts" setup></script>

<template>
  <v-app-bar class="header px-3">
    <v-img src="@/assets/logo.webp" :height="48" inline></v-img>
    <v-toolbar-title class="title"> 伴學小書僮 </v-toolbar-title>
    <v-avatar>
      <v-icon color="blue-grey-lighten-4" icon="mdi-account-circle" size="x-large"></v-icon>
    </v-avatar>
  </v-app-bar>
</template>

<style lang="scss">
.header {
  background: linear-gradient(90.29deg, #00ae97 10.12%, #225584 86.63%) !important;
}

.title {
  color: #fff;
  font-size: 1.875rem !important;
  line-height: 2.25rem !important;
  font-weight: 800 !important;
}
</style>

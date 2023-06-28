<script lang="ts" setup>
import TheMarkdown from '@/components/TheMarkdown.vue';

const text = `subject\n========\n![](https://md.webduino.io/uploads/upload_dc8fa211ba85052f49fe9c12eab1fa83.png)`;
</script>

<template>
  <TheMarkdown :value="text" />
</template>

<style lang="scss" scoped></style>

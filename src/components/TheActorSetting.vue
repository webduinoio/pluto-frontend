<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: string;
  }>(),
  {}
);

// const emit = defineEmits<{
//   (e: 'create'): void;
//   (e: 'update'): void;
// }>();

const tab = ref();
</script>

<template>
  <v-window-item :value="props.value">
    <v-container>
      <v-sheet width="342" class="mt-4 bg-grey-lighten-2">
        <v-form>
          <v-textarea variant="outlined" label="介紹你的小書僮" rows="3"></v-textarea>
          <v-file-input variant="outlined" label="小書僮圖片"></v-file-input>
          <v-btn type="submit" color="#467974" class="text-white mt-12" size="large">儲存</v-btn>
        </v-form>
      </v-sheet>
    </v-container>
  </v-window-item>
</template>

<style scoped></style>

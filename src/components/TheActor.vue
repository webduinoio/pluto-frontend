<script setup lang="ts">
import type { Actor } from '@/types';
const props = withDefaults(
  defineProps<{
    data: Actor;

    // cssVarFooterFontSize?: string; // 設定 footer 的字型大小
    // showIndex?: boolean;
    // showIndexSymbol?: string;
  }>(),
  {
    // cssVarFooterFontSize: '16px',
    // showIndex: false,
    // rowsItems: () => [10, 20, 30],
  }
);

const emit = defineEmits<{
  (e: 'edit', id: number): void;
  (e: 'open', id: number): void;
}>();
</script>

<template>
  <!-- <v-card height="380" width="320" class="ma-2 pa-2"></v-card> -->
  <v-card height="380" width="320" class="d-flex flex-column">
    <v-card-item>
      <v-card-title>{{ props.data.name }}</v-card-title>
    </v-card-item>

    <v-card-text class="overflow-auto">
      <v-img :src="props.data.image" height="200" cover class="text-white"></v-img>
      <p class="mt-2">{{ props.data.description }}</p>
    </v-card-text>
    <v-card-actions class="d-flex justify-end">
      <v-btn variant="outlined" @click="emit('edit', props.data.id)"> 編輯 </v-btn>
      <v-btn variant="flat" color="indigo-darken-3" @click="emit('open', props.data.id)">
        開啟
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

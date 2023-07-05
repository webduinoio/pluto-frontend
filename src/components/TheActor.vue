<script setup lang="ts">
import { useOAuthStore } from '@/stores/oauth';
import type { Actor } from '@/types';

const oauth = useOAuthStore();
const user = oauth.user;
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
  (e: 'edit', data: Actor): void;
  (e: 'open', data: Actor): void;
  (e: 'delete', id: number): void;
}>();
</script>

<template>
  <v-card height="380" width="320" class="d-flex flex-column">
    <v-toolbar color="rgba(0, 0, 0, 0)">
      <v-toolbar-title class="text-h6">
        {{ props.data.name }}
      </v-toolbar-title>

      <template v-slot:append>
        <v-menu v-if="props.data.createdBy === user?.id" min-width="200px" rounded>
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
          </template>

          <v-list>
            <v-list-item :value="props.data.id" disabled>
              <v-list-item-title>複製分享連結</v-list-item-title>
            </v-list-item>
            <v-list-item :value="props.data.id" @click="emit('delete', props.data.id)">
              <v-list-item-title>刪除</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-toolbar>

    <v-card-text class="overflow-auto">
      <v-img :src="props.data.image" height="180" cover class="text-white"></v-img>
      <p class="mt-2 description text-truncate">
        {{ props.data.description }}
        <v-tooltip v-if="props.data.description.length > 19" activator="parent" location="top">
          {{ props.data.description }}
        </v-tooltip>
      </p>
    </v-card-text>
    <v-card-actions class="d-flex justify-end">
      <v-btn
        v-if="props.data.createdBy === user?.id"
        variant="outlined"
        @click="emit('edit', props.data)"
      >
        編輯
      </v-btn>
      <v-btn variant="flat" color="indigo-darken-3" @click="emit('open', props.data)"> 開啟 </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style lang="scss" scoped>
.description {
  min-height: 20px;
}
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

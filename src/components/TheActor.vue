<script setup lang="ts">
import { useOAuthStore } from '@/stores/oauth';
import type { Actor } from '@/types';
import { mdiDotsVertical, mdiEarth, mdiLock } from '@mdi/js';

const oauth = useOAuthStore();
const user = oauth.user;
const props = withDefaults(
  defineProps<{
    data: Actor;
  }>(),
  {
    // nothing
  }
);

const emit = defineEmits<{
  (e: 'edit', data: Actor): void;
  (e: 'open', data: Actor): void;
  (e: 'delete', id: number): void;
  (e: 'copy', actor: Actor): void;
}>();
</script>

<template>
  <v-card height="380" width="320" class="d-flex flex-column">
    <v-toolbar color="rgba(0, 0, 0, 0)">
      <v-toolbar-title>
        <div class="d-flex align-center" style="gap: 5px">
          <div class="text-h6 text-truncate" style="max-width: 200px">
            {{ props.data.name }}
            <v-tooltip v-if="props.data.name.length > 19" activator="parent" location="top">
              {{ props.data.name }}
            </v-tooltip>
          </div>
          <v-tooltip location="top" v-if="props.data.shared">
            <template v-slot:activator="{ props }">
              <v-icon :icon="mdiEarth" size="x-small" color="#6D6D6D" v-bind="props"> </v-icon>
            </template>
            <span>公開</span>
          </v-tooltip>
          <v-tooltip location="top" v-else>
            <template v-slot:activator="{ props }">
              <v-icon :icon="mdiLock" size="x-small" color="#6D6D6D" v-bind="props"> </v-icon>
            </template>
            <span>不公開</span>
          </v-tooltip>
          <!-- TODO: 如果是指定分享，則用這個 icon -->
          <!-- <v-tooltip location="end" >
            <template v-slot:activator="{ props }">
              <v-icon :icon="mdiAccountMultiple" size="x-small" v-bind="props"></v-icon>
            </template>
            <span>指定分享</span>
          </v-tooltip> -->
        </div>
      </v-toolbar-title>

      <template v-slot:append>
        <v-menu min-width="200px" rounded>
          <template v-slot:activator="{ props }">
            <v-btn :icon="mdiDotsVertical" v-bind="props"></v-btn>
          </template>

          <v-list>
            <v-list-item :value="props.data.id" @click="emit('copy', props.data)">
              <v-list-item-title v-if="props.data.createdBy === user?.id && props.data.shared">
                停止分享
              </v-list-item-title>
              <v-list-item-title v-else> 複製分享連結 </v-list-item-title>
            </v-list-item>
            <v-list-item
              :value="props.data.id"
              @click="emit('delete', props.data.id)"
              v-if="props.data.createdBy === user?.id"
            >
              <v-list-item-title>刪除</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-toolbar>

    <v-card-text class="overflow-auto">
      <v-img
        :src="props.data.image"
        height="180"
        cover
        class="text-white clickable-image"
        @click="emit('open', props.data)"
      ></v-img>
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
        color="secondary"
        @click="emit('edit', props.data)"
      >
        編輯
      </v-btn>
      <v-btn variant="flat" color="secondary" @click="emit('open', props.data)"> 開啟 </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style lang="scss" scoped>
.description {
  min-height: 20px;
}

.clickable-image {
  cursor: pointer;
}
</style>

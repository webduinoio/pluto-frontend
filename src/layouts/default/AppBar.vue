<script lang="ts" setup>
import { logout } from '@/services';
import { useOAuthStore } from '@/stores/oauth';

const router = useRouter();
const oauth = useOAuthStore();
const user = oauth.user;
</script>

<template>
  <v-app-bar class="header px-3">
    <v-img
      class="logo"
      src="@/assets/logo.webp"
      :height="48"
      inline
      @click="router.push({ name: 'Home' })"
    ></v-img>
    <v-toolbar-title class="title"> 伴學小書僮 </v-toolbar-title>
    <!-- <v-avatar>
      <v-icon color="blue-grey-lighten-4" icon="mdi-account-circle" size="x-large"></v-icon>
    </v-avatar> -->
    <v-menu min-width="200px" rounded open-on-hover>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-avatar>
            <v-icon color="blue-grey-lighten-4" icon="mdi-account-circle" size="x-large"></v-icon>
          </v-avatar>
        </v-btn>
      </template>
      <v-card>
        <v-card-text>
          <div class="mx-9 text-center">
            <v-avatar>
              <v-icon color="grey" icon="mdi-account-circle" size="x-large"></v-icon>
            </v-avatar>
            <p class="text-caption mt-1">
              {{ user.email }}
            </p>
            <div class="d-flex flex-column justify-center">
              <v-btn rounded variant="text"> 方案 </v-btn>
              <v-btn rounded variant="text"> 語言 </v-btn>
              <v-btn rounded variant="text"> 我的群組 </v-btn>
            </div>
            <v-divider class="mb-9 mt-1"></v-divider>
            <v-btn variant="outlined" density="comfortable" rounded="lg" @click="logout">
              登出
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>

<style lang="scss" scoped>
.title {
  color: #fff;
  font-size: 1.875rem !important;
  line-height: 2.25rem !important;
  font-weight: 800 !important;
}

.logo {
  cursor: pointer;
}
</style>

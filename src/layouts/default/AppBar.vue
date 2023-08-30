<script lang="ts" setup>
import { ROUTER_NAME } from '@/enums';
import { logout } from '@/services';
import { useOAuthStore } from '@/stores/oauth';
import { mdiAccountCircle, mdiChevronRight, mdiSchoolOutline } from '@mdi/js';

const router = useRouter();
const oauth = useOAuthStore();
const logoText = ref(import.meta.env.VITE_LOGO_TEXT);
const isPro = ref(oauth.plan && oauth.plan.name !== 'free');
const isHidePlanInformation = ref(import.meta.env.VITE_HIDE_PLAN_INFORMATION === 'true');

const onClickPlan = () => {
  location.href = `${import.meta.env.VITE_OAUTH_SERVER_HOST}/voucher?user_id=${
    oauth.user?.oauthID
  }&redirect_uri=${location.href}`;
};
const onClickResource = () => {
  window.open('https://resource.webduino.io/docs/webduino-aitutor/handbook', '_blank');
};
// const onClickTheme = () => {};
// const onClickLocation = () => {};
</script>

<template>
  <v-app-bar class="header px-3" color="secondary">
    <span class="text-h4 font-weight-black" v-if="logoText">{{ logoText }}</span>
    <v-img
      v-else
      class="logo"
      src="@/assets/logo.webp"
      :height="48"
      inline
      @click="router.push({ name: ROUTER_NAME.HOME })"
    ></v-img>
    <v-toolbar-title class="title">
      <span style="cursor: pointer" @click="router.push({ name: ROUTER_NAME.HOME })"
        >伴學小書僮</span
      >
    </v-toolbar-title>
    <v-menu v-if="isHidePlanInformation" width="250px" open-on-hover open-on-click>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-avatar>
            <v-icon color="blue-grey-lighten-4" :icon="mdiAccountCircle" size="x-large"></v-icon>
          </v-avatar>
        </v-btn>
      </template>
      <v-card>
        <v-card-text>
          <div class="mx-9 text-center">
            <v-avatar>
              <v-icon color="grey" :icon="mdiAccountCircle" size="x-large"></v-icon>
            </v-avatar>
            <p class="text-caption mt-1">
              {{ oauth.user?.email }}
            </p>
            <v-divider class="mb-9 mt-1"></v-divider>
            <v-btn variant="outlined" density="comfortable" rounded="lg" @click="logout">
              登出
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
    <v-menu v-else width="250px" open-on-hover open-on-click>
      <template v-slot:activator="{ props }">
        <v-chip
          v-if="isPro"
          variant="elevated"
          pill
          v-bind="props"
          color="white"
          style="opacity: 0.8; box-shadow: none"
        >
          <span class="font-weight-bold text-secondary">PRO</span>
          <v-avatar class="mr-n3">
            <v-icon color="#F1A23A" size="x-large" :icon="mdiAccountCircle"></v-icon>
          </v-avatar>
        </v-chip>
        <v-btn v-else icon v-bind="props">
          <v-avatar>
            <v-icon color="blue-grey-lighten-5" :icon="mdiAccountCircle" size="x-large"></v-icon>
          </v-avatar>
        </v-btn>
      </template>
      <v-card class="rounded-lg">
        <v-list>
          <v-list-item>
            <template #title>
              {{ oauth.user?.name }}
              <v-chip
                v-if="isPro"
                class="my-1 mx-2 px-1 font-weight-bold text-caption h-25"
                color="secondary"
                variant="outlined"
                density="compact"
                label
              >
                PRO
              </v-chip>
            </template>

            <template #subtitle>
              <div class="text-truncate">{{ oauth.user?.email }}</div>
            </template>
            <template #prepend>
              <v-avatar v-if="oauth.user?.avatar" :image="oauth.user?.avatar"></v-avatar>
              <v-avatar v-else>
                <v-icon color="gray" :icon="mdiAccountCircle" size="x-large"></v-icon>
              </v-avatar>
            </template>
          </v-list-item>

          <v-divider class="ma-2"></v-divider>

          <v-list-item class="mx-1" @click="onClickPlan">
            <template #title>
              <template v-if="isPro">
                <span class="text-secondary font-weight-bold">剩餘天數</span>
              </template>
              <template v-else>
                <v-icon color="secondary" :icon="mdiSchoolOutline"></v-icon>
                <span class="ml-2 text-secondary font-weight-bold">成為 PRO</span>
              </template>
            </template>

            <template #append>
              <span v-if="isPro" class="text-medium-emphasis">{{
                `${oauth.getRemindDays()} 天`
              }}</span>
              <v-icon class="ml-1" :icon="mdiChevronRight"></v-icon>
            </template>
          </v-list-item>
          <v-list-item class="mx-1" title="學習資源" @click="onClickResource"> </v-list-item>
          <!-- <v-list-item class="mx-1" title="深色模式" @click="onClickTheme"> </v-list-item>
          <v-list-item
            class="mx-1"
            title="繁體中文"
            @click="onClickLocation"
            :appendIcon="mdiChevronRight"
          >
          </v-list-item> -->

          <v-divider class="ma-2"></v-divider>

          <v-list-item class="mx-1" title="登出" @click="logout"></v-list-item>
        </v-list>
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

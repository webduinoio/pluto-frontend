<script lang="ts" setup>
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { logout } from '@/services';

const { fire, showLoading } = useSweetAlert();

fire({
  title: '登入並開始與小書僮對話',
  text: '即將轉導回登入頁',
  icon: undefined,
  confirmButtonText: '確認',
  timer: 7000,
  timerProgressBar: true,
  allowOutsideClick: false,
}).then(async () => {
  showLoading();
  logout();
});
</script>

<template></template>

<script lang="ts" setup>
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { logout } from '@/services';

const { fire, showLoading } = useSweetAlert();

fire({
  title: '學習不再是孤軍奮戰！',
  text: '登入並開始與小助教對話',
  icon: undefined,
  confirmButtonText: '免費開始',
  timer: 7000,
  timerProgressBar: true,
  allowOutsideClick: false,
}).then(async () => {
  showLoading();
  logout();
});
</script>

<template></template>

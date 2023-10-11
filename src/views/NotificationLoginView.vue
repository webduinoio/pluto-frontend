<script lang="ts" setup>
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { logout } from '@/services';
import { useTheme } from 'vuetify';

const { fire, showLoading } = useSweetAlert();
const { current } = useTheme();

fire({
  title: '學習不再是孤軍奮戰！',
  text: '登入並開始與小助教對話',
  icon: undefined,
  confirmButtonText: '免費開始',
  timer: 7000,
  timerProgressBar: true,
  allowOutsideClick: false,
  confirmButtonColor: current.value.colors.secondary,
}).then(async () => {
  showLoading();
  logout();
});
</script>

<template></template>

<template>
  <router-view />
</template>

<style>
html {
  overflow: auto !important;
}

div:where(.swal2-container) {
  z-index: 9999 !important;
}
</style>

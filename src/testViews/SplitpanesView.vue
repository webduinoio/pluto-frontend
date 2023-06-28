<script lang="ts" setup>
// https://antoniandre.github.io/splitpanes/
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
</script>

<template>
  <splitpanes class="default-theme">
    <pane min-size="20">1<br /><em class="specs">I have a min width of 20%</em></pane>
    <pane>
      <splitpanes class="default-theme" horizontal="horizontal">
        <pane min-size="15">2<br /><em class="specs">I have a min height of 15%</em></pane>
        <pane>3</pane>
        <pane>4</pane>
      </splitpanes>
    </pane>
    <pane>5</pane>
  </splitpanes>
</template>

<style lang="scss" scoped>
.splitpanes__pane {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.2) inset;
}

em.specs {
  font-size: 2rem;
  line-height: 1;
  position: absolute;
  color: #bbb;
  bottom: 0.5em;
  left: 0;
  right: 0;
  text-align: center;
}
</style>

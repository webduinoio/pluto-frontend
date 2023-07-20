<template>
  <div id="pdfContainer"></div>
</template>
<script lang="ts">
export default {
  data() {
    return {
      pdf: null,
    };
  },
  mounted() {
    var ele = document.getElementById('pdfContainer');
    pdf.setViewElement(ele);
    (async function () {
      pdf.load('../book.pdf');
    })();
  },
  methods: {
    someMethod() {},
  },
};
</script>

<style>
#pdfContainer {
  height: 100vh;
  overflow-y: scroll;
}

.highlight {
  color: brown;
  background-color: rgb(33, 20, 205);
}
</style>

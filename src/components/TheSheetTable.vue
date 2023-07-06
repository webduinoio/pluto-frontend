<script setup lang="ts">
/**
 * 呈現類似試算表的表格元件
 */
import { get } from '@vueuse/core';

interface SheetValue {
  value?: string | number;
  rowSpan?: number;
  colSpan?: number;
}

const props = withDefaults(
  defineProps<{
    value?: Array<SheetValue[]>;
  }>(),
  {
    value: () => [],
  }
);

const generateAlphabet = (n: number): string[] => {
  const result: string[] = [];

  for (let i = 0; i < n; i++) {
    let str = '';
    let num = i;

    while (num >= 0) {
      str = String.fromCharCode(65 + (num % 26)) + str;
      num = Math.floor(num / 26) - 1;
    }

    result.push(str);
  }

  return result;
};

const cols = computed(() => {
  if (!props.value || props.value.length === 0) return 0;
  const firstRow = props.value[0];
  const dataColCount = firstRow.reduce((acc, val) => {
    if (val.colSpan) return acc + val.colSpan;
    return acc + 1;
  }, 0);

  // 增加開頭空白的 1 格
  return dataColCount + 1;
});

const alphabet = computed(() => {
  if (get(cols) === 0) return [];
  return generateAlphabet(cols.value - 1);
});
</script>

<template>
  <div class="w-100 h-100 overflow-auto">
    <table>
      <thead>
        <tr>
          <th v-for="(_, idx) in cols">
            {{ idx === 0 ? '' : alphabet[idx - 1] }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in props.value">
          <td>{{ idx }}</td>
          <td v-for="item2 in item" :rowspan="item2.rowSpan" :colspan="item2.colSpan">
            {{ item2.value || '' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
table {
  width: 0px;
  height: 0px;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: center;
  border: 1px solid gray;
}

th,
td {
  width: 100px;
  height: 30px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  border: 1px solid gray;

  &:first-child {
    width: 50px;
  }
}
</style>

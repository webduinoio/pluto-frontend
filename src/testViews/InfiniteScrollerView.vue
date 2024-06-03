<script lang="ts" setup>
const items: Ref<any> = ref([]);

const api = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // @ts-ignore
      resolve(Array.from({ length: 10 }, (k, v) => v + items.value.at(-1) + 1));
    }, 1000);
  });
};

const load = async ({ done }: { done: Function }) => {
  // Perform API call
  const res = (await api()) as any;
  items.value.push(...res);
  done('ok');
};
</script>

<template>
  <v-container class="mb-6 d-flex justify-center">
    <v-responsive max-width="1024">
      <v-main>
        <v-container>
          <v-infinite-scroll
            :items="items"
            :onLoad="load"
            min-height="300"
            class="overflow-x-hidden"
          >
            <v-row justify="center">
              <template v-for="(item, index) in items" :key="index">
                <div
                  class="ma-2 pa-2"
                  style="height: 380px; width: 250px"
                  :class="['pa-2', index % 2 === 0 ? 'bg-grey-lighten-2' : '']"
                >
                  Item #{{ item }}
                </div>
              </template>
            </v-row>
          </v-infinite-scroll>
        </v-container>
      </v-main>
    </v-responsive>
  </v-container>
</template>

<style lang="scss" scoped></style>

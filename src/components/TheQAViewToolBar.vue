<template>
  <v-toolbar class="custom-toolbar">
    <v-btn color="primary" style="min-width: 200px">
      {{ selectedItem.title }}
      <v-menu activator="parent" style="min-width: 200px">
        <v-list>
          <v-list-item v-for="(item, index) in items" :key="index" @click="selectItem(item)">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-btn>
    <v-divider vertical></v-divider>

    <v-btn icon @click="prevPage"><v-icon>mdi-chevron-left</v-icon></v-btn>
    <div style="width: 60px; display: flex; align-items: center">
      <v-text-field v-model="currentPage" :max="totalPages" class="page-number-field">
        <template v-slot:input="{ on, attrs }">
          <input v-bind="attrs" v-on="on" class="page-number-input" />
        </template>
      </v-text-field>
    </div>
    <span class="page-number-text">/</span>
    <span class="page-number-text">{{ totalPages }}</span>
    <v-btn icon @click="nextPage"><v-icon>mdi-chevron-right</v-icon></v-btn>
    <v-divider vertical></v-divider>

    <v-btn icon @click="adjustUI('-')"><v-icon>mdi-minus</v-icon></v-btn>
    <span>滿版</span>
    <v-btn icon @click="adjustUI('+')"><v-icon>mdi-plus</v-icon></v-btn>
    <v-divider vertical></v-divider>

    <div class="search-container">
      <v-text-field
        v-model="searchText"
        flat
        solo
        rounded
        class="search-field page-number-field"
        append-icon="mdi-magnify"
        @click:append="search"
      ></v-text-field>
    </div>
  </v-toolbar>
</template>

<script>
export default {
  data: () => ({
    items: [{ title: '1.pdf' }, { title: '2.pdf' }, { title: 'Q&A.pdf' }],
    selectedItem: { title: '1.pdf' },
    totalPages: 200,
    currentPage: 1,
    searchText: '',
  }),
  methods: {
    search() {
      console.log(`search....${this.searchText}`);
    },
    adjustUI(operation) {
      console.log(operation);
    },
    selectItem(item) {
      this.selectedItem = item;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
  },
};
</script>

<style scoped>
.page-number-text,
.page-number-input {
  line-height: 16px;
  font-size: 16px;
}

.page-number-input {
  text-align: right;
  width: 100%;
}

.page-number-field {
  height: 60px;
}

.custom-toolbar.v-toolbar {
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.2) !important;
}

.search-container {
  width: 300px;
}

.search-field .v-input__icon--append .v-icon {
  width: 36px;
  height: 36px;
}
</style>

<template>
  <v-app>
    <v-app-bar color="primary" elevation="0" height="64">
      <v-app-bar-title class="text-h5 font-weight-bold">
        DL Finance
      </v-app-bar-title>

      <!-- Desktop Navigation -->
      <template #append>
        <v-btn
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          variant="text"
          class="d-none d-md-flex mx-1"
          color="white"
        >
          <v-icon start>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
      </template>
    </v-app-bar>

    <v-main class="bg-surface-variant" style="padding-bottom: 80px;">
      <router-view />
    </v-main>

    <v-bottom-navigation
      v-model="currentRoute"
      color="primary"
      bg-color="#242424"
      elevation="8"
      height="70"
      class="d-md-none rounded-t-xl bottom-nav-border"
      fixed
      grow
    >
      <v-btn
        v-for="item in menuItems"
        :key="item.to"
        :value="item.to"
        :to="item.to"
        height="60"
      >
        <v-icon size="28">{{ item.icon }}</v-icon>
        <span class="text-caption mt-1">{{ item.title }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const currentRoute = ref(route.path);

const menuItems = [
  { title: 'Categorias', icon: 'mdi-folder', to: '/categorias' },
  { title: 'Lançamentos', icon: 'mdi-receipt-text', to: '/lancamentos' },
];

watch(() => route.path, (newPath) => {
  currentRoute.value = newPath;
});
</script>

<style scoped>
.bottom-nav-border {
  border: 2px solid #9C27B0 !important;
  border-bottom: none !important;
}
</style>

<template>
  <v-app>
    <v-app-bar color="primary" elevation="0" height="64">
      <!-- Menu hamburguer para mobile -->
      <v-app-bar-nav-icon
        class="d-md-none"
        @click="drawer = !drawer"
        color="white"
      />

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

    <!-- Menu Lateral -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="left"
      class="d-md-none drawer-custom"
      width="280"
    >
      <v-divider class="mb-2" />

      <!-- Itens do Menu -->
      <v-list nav class="px-2">
        <v-list-item
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          @click="drawer = false"
          rounded="xl"
          class="mb-1"
          color="primary"
        />
      </v-list>

      <!-- Rodapé do Menu -->
      <template #append>
        <div class="pa-4 text-center">
          <v-divider class="mb-3" />
          <v-chip
            color="primary"
            variant="flat"
            size="small"
            class="mb-2"
            prepend-icon="mdi-information-outline"
          >
            Versão 1.0.0
          </v-chip>
          <p class="text-caption text-disabled">
            © {{ new Date().getFullYear() }} DL Finance
          </p>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main class="bg-surface-variant">
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const drawer = ref(false);

const menuItems = [
  { title: 'Categorias', icon: 'mdi-folder', to: '/categorias' },
  { title: 'Lançamentos', icon: 'mdi-receipt-text', to: '/lancamentos' },
];
</script>

<style scoped>
.drawer-custom {
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
}

.drawer-header {
  background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
  color: white;
}

.v-list-item {
  transition: all 0.3s ease;
}

.v-list-item:hover {
  transform: translateX(8px);
}
</style>
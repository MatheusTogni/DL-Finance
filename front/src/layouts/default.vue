<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>DL Finance</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          to="/"
        />
        <v-list-item
          prepend-icon="mdi-folder"
          title="Categorias"
          to="/categorias"
        />
        <v-list-item
          prepend-icon="mdi-receipt-text"
          title="Lançamentos"
          to="/lancamentos"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>

    <v-bottom-navigation
      v-model="currentRoute"
      color="primary"
      grow
      class="d-md-none"
    >
      <v-btn value="/" to="/">
        <v-icon>mdi-view-dashboard</v-icon>
        <span>Dashboard</span>
      </v-btn>

      <v-btn value="/categorias" to="/categorias">
        <v-icon>mdi-folder</v-icon>
        <span>Categorias</span>
      </v-btn>

      <v-btn value="/lancamentos" to="/lancamentos">
        <v-icon>mdi-receipt-text</v-icon>
        <span>Lançamentos</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const drawer = ref(false);
const route = useRoute();
const currentRoute = ref(route.path);

watch(() => route.path, (newPath) => {
  currentRoute.value = newPath;
});
</script>


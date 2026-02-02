<template>
  <v-container class="pa-4">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Dashboard</h1>
      </v-col>
    </v-row>

    <!-- Cards de resumo -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card color="success" variant="elevated">
          <v-card-text>
            <div class="text-overline mb-1">Total de Entradas</div>
            <div class="text-h5">R$ {{ formatarValor(estatisticas.total_entradas) }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="error" variant="elevated">
          <v-card-text>
            <div class="text-overline mb-1">Total de Saídas</div>
            <div class="text-h5">R$ {{ formatarValor(estatisticas.total_saidas) }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" variant="elevated">
          <v-card-text>
            <div class="text-overline mb-1">Saldo Total</div>
            <div class="text-h5">R$ {{ formatarValor(estatisticas.saldo_total) }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="info" variant="elevated">
          <v-card-text>
            <div class="text-overline mb-1">Total de Lançamentos</div>
            <div class="text-h5">{{ estatisticas.total_lancamentos }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Resumo por categoria -->
    <v-row class="mt-4">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Resumo por Categoria</h2>
      </v-col>

      <v-col
        v-for="categoria in categorias"
        :key="categoria.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          :style="{ borderLeft: `4px solid ${categoria.cor}` }"
          class="categoria-card"
          @click="$router.push('/lancamentos')"
        >
          <v-card-title>
            {{ categoria.nome }}
          </v-card-title>
          
          <v-card-text>
            <div class="text-h6 mb-2">
              Saldo: R$ {{ formatarValor(categoria.saldo_atual) }}
            </div>
            <v-divider class="my-2" />
            <div class="text-caption">
              <div class="d-flex justify-space-between">
                <span>Entradas:</span>
                <span class="text-success">+R$ {{ formatarValor(categoria.total_entradas) }}</span>
              </div>
              <div class="d-flex justify-space-between">
                <span>Saídas:</span>
                <span class="text-error">-R$ {{ formatarValor(categoria.total_saidas) }}</span>
              </div>
              <div class="d-flex justify-space-between mt-1">
                <span>Lançamentos:</span>
                <span>{{ categoria.total_lancamentos }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="categorias.length === 0" cols="12">
        <v-card>
          <v-card-text class="text-center pa-8">
            <v-icon size="64" color="grey">mdi-folder-outline</v-icon>
            <p class="text-h6 mt-4">Nenhuma categoria cadastrada</p>
            <v-btn
              color="primary"
              class="mt-4"
              @click="$router.push('/categorias')"
            >
              Criar Primeira Categoria
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Últimos lançamentos -->
    <v-row class="mt-4">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h2 class="text-h5">Últimos Lançamentos</h2>
          <v-btn
            variant="text"
            append-icon="mdi-arrow-right"
            @click="$router.push('/lancamentos')"
          >
            Ver todos
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card v-if="lancamentos.length === 0">
          <v-card-text class="text-center pa-8">
            <v-icon size="64" color="grey">mdi-receipt-text-outline</v-icon>
            <p class="text-h6 mt-4">Nenhum lançamento encontrado</p>
            <v-btn
              color="primary"
              class="mt-4"
              @click="$router.push('/lancamentos')"
            >
              Criar Primeiro Lançamento
            </v-btn>
          </v-card-text>
        </v-card>

        <v-list v-else class="bg-transparent">
          <v-list-item
            v-for="lancamento in lancamentos.slice(0, 5)"
            :key="lancamento.id"
            class="mb-2 bg-surface rounded"
          >
            <template #prepend>
              <v-avatar :color="lancamento.categoria_cor || '#9C27B0'">
                <v-icon>
                  {{ lancamento.tipo_lancamento === 'entrada' ? 'mdi-plus' : 'mdi-minus' }}
                </v-icon>
              </v-avatar>
            </template>

            <v-list-item-title>
              {{ lancamento.descricao || 'Sem descrição' }}
            </v-list-item-title>
            
            <v-list-item-subtitle>
              {{ lancamento.categoria_nome }} • 
              {{ formatarData(lancamento.data_lancamento) }}
            </v-list-item-subtitle>

            <template #append>
              <span
                class="text-h6"
                :class="lancamento.tipo_lancamento === 'entrada' ? 'text-success' : 'text-error'"
              >
                {{ lancamento.tipo_lancamento === 'entrada' ? '+' : '-' }}
                R$ {{ formatarValor(lancamento.valor) }}
              </span>
            </template>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { categoriasApi, lancamentosApi, type CategoriaResumo, type Lancamento } from '@/services/api';

const categorias = ref<CategoriaResumo[]>([]);
const lancamentos = ref<Lancamento[]>([]);
const estatisticas = ref({
  total_lancamentos: 0,
  total_entradas: 0,
  total_saidas: 0,
  saldo_total: 0,
});

const carregarDados = async () => {
  try {
    const [categoriasRes, lancamentosRes, estatisticasRes] = await Promise.all([
      categoriasApi.getResumo(),
      lancamentosApi.getAll(),
      lancamentosApi.getEstatisticas(),
    ]);

    categorias.value = categoriasRes.data;
    lancamentos.value = lancamentosRes.data;
    estatisticas.value = estatisticasRes.data;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
};

const formatarValor = (valor: number) => {
  return valor.toFixed(2).replace('.', ',');
};

const formatarData = (data: string) => {
  const date = new Date(data);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  carregarDados();
});
</script>

<style scoped>
.categoria-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.categoria-card:hover {
  transform: translateY(-4px);
}
</style>


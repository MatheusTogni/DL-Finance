<template>
  <v-container class="pa-4">
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">Lançamentos</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="abrirDialogLancamento()"
          >
            Novo Lançamento
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filtro por categoria -->
    <v-row>
      <v-col cols="12">
        <v-select
          v-model="filtroCategoria"
          :items="categoriasOptions"
          item-title="text"
          item-value="value"
          label="Filtrar por categoria"
          clearable
          @update:model-value="carregarLancamentos"
        />
      </v-col>
    </v-row>

    <!-- Lista de lançamentos -->
    <v-row>
      <v-col cols="12">
        <v-card v-if="lancamentos.length === 0">
          <v-card-text class="text-center pa-8">
            <v-icon size="64" color="grey">mdi-receipt-text-outline</v-icon>
            <p class="text-h6 mt-4">Nenhum lançamento encontrado</p>
          </v-card-text>
        </v-card>

        <v-list v-else class="bg-transparent">
          <v-list-item
            v-for="lancamento in lancamentos"
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
              <div class="d-flex align-center">
                <span
                  class="text-h6 mr-4"
                  :class="lancamento.tipo_lancamento === 'entrada' ? 'text-success' : 'text-error'"
                >
                  {{ lancamento.tipo_lancamento === 'entrada' ? '+' : '-' }}
                  R$ {{ formatarValor(lancamento.valor) }}
                </span>
                
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="abrirDialogLancamento(lancamento)"
                />
                
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmarExclusao(lancamento)"
                />
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>

    <!-- Dialog para criar/editar lançamento -->
    <v-dialog v-model="dialogLancamento" max-width="500">
      <v-card>
        <v-card-title>
          {{ lancamentoEdit ? 'Editar Lançamento' : 'Novo Lançamento' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="formLancamento" v-model="formValid">
            <v-select
              v-model="formData.categoria_id"
              :items="categorias"
              item-title="nome"
              item-value="id"
              label="Categoria"
              :rules="[v => !!v || 'Categoria é obrigatória']"
              required
            >
              <template #selection="{ item }">
                <v-chip :color="item.raw.cor">
                  {{ item.raw.nome }}
                </v-chip>
              </template>
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :prepend-icon="'mdi-circle'"
                  :base-color="item.raw.cor"
                />
              </template>
            </v-select>

            <v-radio-group
              v-model="formData.tipo_lancamento"
              inline
              :rules="[v => !!v || 'Tipo é obrigatório']"
            >
              <v-radio label="Entrada" value="entrada" color="success" />
              <v-radio label="Saída" value="saida" color="error" />
            </v-radio-group>
            
            <v-text-field
              v-model.number="formData.valor"
              label="Valor"
              type="number"
              step="0.01"
              prefix="R$"
              :rules="[
                v => !!v || 'Valor é obrigatório',
                v => v > 0 || 'Valor deve ser maior que zero'
              ]"
              required
            />
            
            <v-text-field
              v-model="formData.descricao"
              label="Descrição"
              hint="Opcional"
            />
            
            <v-text-field
              v-model="formData.data_lancamento"
              label="Data"
              type="datetime-local"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogLancamento = false">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="!formValid"
            @click="salvarLancamento"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmação de exclusão -->
    <v-dialog v-model="dialogExcluir" max-width="400">
      <v-card>
        <v-card-title>Confirmar Exclusão</v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir este lançamento?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogExcluir = false">
            Cancelar
          </v-btn>
          <v-btn color="error" variant="elevated" @click="excluirLancamento">
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { lancamentosApi, categoriasApi, type Lancamento, type Categoria } from '@/services/api';

const lancamentos = ref<Lancamento[]>([]);
const categorias = ref<Categoria[]>([]);
const filtroCategoria = ref<number | null>(null);
const dialogLancamento = ref(false);
const dialogExcluir = ref(false);
const lancamentoEdit = ref<Lancamento | null>(null);
const lancamentoParaExcluir = ref<Lancamento | null>(null);
const formValid = ref(false);
const formLancamento = ref();

const formData = ref({
  categoria_id: null as number | null,
  descricao: '',
  valor: 0,
  tipo_lancamento: 'saida' as 'entrada' | 'saida',
  data_lancamento: new Date().toISOString().slice(0, 16),
});

const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const categoriasOptions = computed(() => [
  { text: 'Todas as categorias', value: null },
  ...categorias.value.map(c => ({ text: c.nome, value: c.id }))
]);

const carregarLancamentos = async () => {
  try {
    const response = await lancamentosApi.getAll(filtroCategoria.value || undefined);
    lancamentos.value = response.data;
  } catch (error) {
    mostrarMensagem('Erro ao carregar lançamentos', 'error');
  }
};

const carregarCategorias = async () => {
  try {
    const response = await categoriasApi.getAll();
    categorias.value = response.data;
  } catch (error) {
    mostrarMensagem('Erro ao carregar categorias', 'error');
  }
};

const abrirDialogLancamento = (lancamento?: Lancamento) => {
  if (lancamento) {
    lancamentoEdit.value = lancamento;
    formData.value = {
      categoria_id: lancamento.categoria_id,
      descricao: lancamento.descricao || '',
      valor: lancamento.valor,
      tipo_lancamento: lancamento.tipo_lancamento,
      data_lancamento: new Date(lancamento.data_lancamento).toISOString().slice(0, 16),
    };
  } else {
    lancamentoEdit.value = null;
    formData.value = {
      categoria_id: null,
      descricao: '',
      valor: 0,
      tipo_lancamento: 'saida',
      data_lancamento: new Date().toISOString().slice(0, 16),
    };
  }
  dialogLancamento.value = true;
};

const salvarLancamento = async () => {
  if (!formLancamento.value) return;
  
  const valid = await formLancamento.value.validate();
  if (!valid.valid) return;

  try {
    const dados = {
      categoria_id: formData.value.categoria_id!,
      descricao: formData.value.descricao || undefined,
      valor: formData.value.valor,
      tipo_lancamento: formData.value.tipo_lancamento,
      data_lancamento: formData.value.data_lancamento,
    };

    if (lancamentoEdit.value) {
      await lancamentosApi.update(lancamentoEdit.value.id, dados);
      mostrarMensagem('Lançamento atualizado com sucesso!');
    } else {
      await lancamentosApi.create(dados);
      mostrarMensagem('Lançamento criado com sucesso!');
    }
    dialogLancamento.value = false;
    carregarLancamentos();
  } catch (error) {
    mostrarMensagem('Erro ao salvar lançamento', 'error');
  }
};

const confirmarExclusao = (lancamento: Lancamento) => {
  lancamentoParaExcluir.value = lancamento;
  dialogExcluir.value = true;
};

const excluirLancamento = async () => {
  if (!lancamentoParaExcluir.value) return;

  try {
    await lancamentosApi.delete(lancamentoParaExcluir.value.id);
    mostrarMensagem('Lançamento excluído com sucesso!');
    dialogExcluir.value = false;
    carregarLancamentos();
  } catch (error) {
    mostrarMensagem('Erro ao excluir lançamento', 'error');
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

const mostrarMensagem = (texto: string, cor: string = 'success') => {
  snackbarText.value = texto;
  snackbarColor.value = cor;
  snackbar.value = true;
};

onMounted(() => {
  carregarCategorias();
  carregarLancamentos();
});
</script>

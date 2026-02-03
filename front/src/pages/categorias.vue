<template>
  <v-container class="pa-4 pa-md-6" style="max-width: 1200px">
    <!-- Header -->
    <div class="mb-6">
      <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-plus-circle"
        block
        class="mb-4"
        elevation="2"
        @click="abrirDialogCategoria()"
      >
        Nova Categoria
      </v-btn>
    </div>

    <!-- Lista de Categorias -->
    <div v-if="loadingCategorias" class="text-center pa-16">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        width="6"
      />
      <p class="text-h6 mt-6 text-medium-emphasis">Buscando categorias...</p>
    </div>

    <v-row v-else>
      <v-col v-for="categoria in categorias" :key="categoria.id" cols="12" sm="6" md="4">
        <v-card class="categoria-card" elevation="2" hover>
          <div class="pa-4">
            <div class="d-flex justify-space-between align-center mb-3">
              <div class="d-flex align-center">
                <div
                  :style="{
                    backgroundColor: categoria.cor,
                    width: '12px',
                    height: '40px',
                    borderRadius: '6px',
                    marginRight: '12px',
                  }"
                />
                <div>
                  <h3 class="text-h6 font-weight-bold">{{ categoria.nome }}</h3>
                  <v-chip
                    :color="categoria.cor"
                    size="small"
                    variant="tonal"
                    class="mt-1"
                  >
                    {{ categoria.tipo }}
                  </v-chip>
                </div>
              </div>
            </div>

            <v-divider class="my-3" />

            <div
              v-if="categoria.total_lancamentos !== undefined"
              class="text-caption text-medium-emphasis mb-3"
            >
              <v-icon size="16" class="mr-1">mdi-receipt-text</v-icon>
              {{ categoria.total_lancamentos }} lançamento{{
                categoria.total_lancamentos !== 1 ? "s" : ""
              }}
            </div>

            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-medium-emphasis mb-1">Saldo Atual</div>
                <div class="text-h5 font-weight-bold" :style="{ color: categoria.cor }">
                  R$ {{ formatarValor(categoria.saldo_atual) }}
                </div>
              </div>
              
              <div class="d-flex gap-2">
                <v-btn
                  variant="tonal"
                  color="#269B71"
                  size="small"
                  icon="mdi-pencil"
                  @click="abrirDialogCategoria(categoria)"
                />
                <v-btn
                  variant="tonal"
                  color="error"
                  size="small"
                  icon="mdi-delete"
                  @click="confirmarExclusao(categoria)"
                />
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog para criar/editar categoria -->
    <v-dialog
      v-model="dialogCategoria"
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card rounded="xl">
        <v-card-title class="bg-primary text-white pa-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2">{{
              categoriaEdit ? "mdi-pencil" : "mdi-plus-circle"
            }}</v-icon>
            {{ categoriaEdit ? "Editar Categoria" : "Nova Categoria" }}
          </div>
        </v-card-title>

        <v-card-text class="pa-4 pa-md-6">
          <v-form ref="formCategoria" v-model="formValid">
            <v-text-field
              v-model="formData.nome"
              label="Nome da Categoria"
              placeholder="Ex: Lanches, Mercado, Investimentos"
              :rules="[(v) => !!v || 'Nome é obrigatório']"
              prepend-inner-icon="mdi-tag"
              class="mb-2"
              required
            />

            <v-text-field
              v-model="formData.tipo"
              label="Tipo"
              placeholder="Ex: gastos, investimentos, lanches"
              :rules="[(v) => !!v || 'Tipo é obrigatório']"
              prepend-inner-icon="mdi-shape"
              class="mb-2"
              required
            />

            <div class="mb-4">
              <v-label class="mb-2">Cor da Categoria</v-label>
              <div class="d-flex align-center gap-3">
                <div
                  :style="{
                    width: '60px',
                    height: '60px',
                    backgroundColor: formData.cor || '#9C27B0',
                    borderRadius: '12px',
                    border: '3px solid #E0E0E0',
                  }"
                />
                <v-text-field
                  v-model="formData.cor"
                  placeholder="#9C27B0"
                  :rules="[validarCor]"
                  hide-details
                  density="comfortable"
                />
              </div>
              <div class="mt-2 d-flex flex-wrap gap-2">
                <v-btn
                  v-for="cor in coresSugeridas"
                  :key="cor"
                  :color="cor"
                  size="small"
                  icon
                  @click="formData.cor = cor"
                />
              </div>
            </div>

            <v-text-field
              v-if="!categoriaEdit"
              v-model.number="formData.saldo_inicial"
              label="Saldo Inicial (opcional)"
              type="number"
              step="0.01"
              prepend-inner-icon="mdi-cash"
              prefix="R$"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="dialogCategoria = false"> Cancelar </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            variant="elevated"
            size="large"
            :disabled="!formValid"
            :loading="salvandoCategoria"
            @click="salvarCategoria"
          >
            <v-icon start>mdi-content-save</v-icon>
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmação de exclusão -->
    <v-dialog v-model="dialogExcluir" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-4">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text class="pa-4">
          Tem certeza que deseja excluir a categoria
          <strong>"{{ categoriaParaExcluir?.nome }}"</strong>? <br /><br />
          <v-alert type="warning" variant="tonal" density="compact">
            Todos os lançamentos associados também serão excluídos.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="dialogExcluir = false"> Cancelar </v-btn>
          <v-spacer />
          <v-btn color="error" variant="elevated" :loading="excluindoCategoria" @click="excluirCategoria">
            <v-icon start>mdi-delete</v-icon>
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      location="top"
      rounded="pill"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{
          snackbarColor === "success" ? "mdi-check-circle" : "mdi-alert-circle"
        }}</v-icon>
        {{ snackbarText }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { categoriasApi, type Categoria, type CategoriaResumo } from '@/services/api';

const categorias = ref<CategoriaResumo[]>([]);
const dialogCategoria = ref(false);
const dialogExcluir = ref(false);
const categoriaEdit = ref<Categoria | null>(null);
const categoriaParaExcluir = ref<Categoria | null>(null);
const formValid = ref(false);
const formCategoria = ref();
const loadingCategorias = ref(false);
const salvandoCategoria = ref(false);
const excluindoCategoria = ref(false);

const formData = ref({
  nome: '',
  tipo: '',
  cor: '#9C27B0',
  saldo_inicial: 0,
});

const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const coresSugeridas = [
  '#9C27B0', // Roxo
  '#E91E63', // Rosa
  '#3F51B5', // Azul
  '#009688', // Verde-azulado
  '#FF9800', // Laranja
  '#795548', // Marrom
  '#607D8B', // Cinza-azulado
  '#F44336', // Vermelho
];

const carregarCategorias = async () => {
  try {
    loadingCategorias.value = true;
    const response = await categoriasApi.getResumo();
    categorias.value = response.data;
    console.log('Categorias carregadas:', response.data);
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    mostrarMensagem('Erro ao carregar categorias', 'error');
  } finally {
    loadingCategorias.value = false;
  }
};

const abrirDialogCategoria = (categoria?: Categoria) => {
  if (categoria) {
    categoriaEdit.value = categoria;
    formData.value = {
      nome: categoria.nome,
      tipo: categoria.tipo,
      cor: categoria.cor,
      saldo_inicial: 0,
    };
  } else {
    categoriaEdit.value = null;
    formData.value = {
      nome: '',
      tipo: '',
      cor: '#9C27B0',
      saldo_inicial: 0,
    };
  }
  dialogCategoria.value = true;
};

const salvarCategoria = async () => {
  if (!formCategoria.value) return;

  const valid = await formCategoria.value.validate();
  if (!valid.valid) return;

  try {
    salvandoCategoria.value = true;
    if (categoriaEdit.value) {
      await categoriasApi.update(categoriaEdit.value.id, {
        nome: formData.value.nome,
        tipo: formData.value.tipo,
        cor: formData.value.cor,
      });
      mostrarMensagem('Categoria atualizada com sucesso!');
    } else {
      await categoriasApi.create(formData.value);
      mostrarMensagem('Categoria criada com sucesso!');
    }
    dialogCategoria.value = false;
    carregarCategorias();
  } catch (error) {
    mostrarMensagem('Erro ao salvar categoria', 'error');
  } finally {
    salvandoCategoria.value = false;
  }
};

const confirmarExclusao = (categoria: Categoria) => {
  categoriaParaExcluir.value = categoria;
  dialogExcluir.value = true;
};

const excluirCategoria = async () => {
  if (!categoriaParaExcluir.value) return;

  try {
    excluindoCategoria.value = true;
    await categoriasApi.delete(categoriaParaExcluir.value.id);
    mostrarMensagem('Categoria excluída com sucesso!');
    dialogExcluir.value = false;
    carregarCategorias();
  } catch (error) {
    mostrarMensagem('Erro ao excluir categoria', 'error');
  } finally {
    excluindoCategoria.value = false;
  }
};

const validarCor = (v: string) => {
  if (!v) return true;
  return /^#[0-9A-F]{6}$/i.test(v) || 'Cor inválida (use formato #RRGGBB)';
};

const formatarValor = (valor: number | string) => {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  return num.toFixed(2).replace('.', ',');
};

const mostrarMensagem = (texto: string, cor: string = 'success') => {
  snackbarText.value = texto;
  snackbarColor.value = cor;
  snackbar.value = true;
};

onMounted(() => {
  carregarCategorias();
});
</script>

<style scoped>
.categoria-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.categoria-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(156, 39, 176, 0.15) !important;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}
</style>

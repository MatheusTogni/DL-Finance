<template>
  <v-container class="pa-4">
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">Categorias</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="abrirDialogCategoria()"
          >
            Nova Categoria
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
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
        >
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ categoria.nome }}</span>
            <v-chip :color="categoria.cor" size="small">
              {{ categoria.tipo }}
            </v-chip>
          </v-card-title>
          
          <v-card-text>
            <div class="text-h5 mb-2">
              R$ {{ formatarValor(categoria.saldo_atual) }}
            </div>
            <div v-if="categoria.total_lancamentos !== undefined" class="text-caption">
              {{ categoria.total_lancamentos }} lançamentos
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn
              size="small"
              variant="text"
              @click="abrirDialogCategoria(categoria)"
            >
              <v-icon>mdi-pencil</v-icon>
              Editar
            </v-btn>
            <v-btn
              size="small"
              variant="text"
              color="error"
              @click="confirmarExclusao(categoria)"
            >
              <v-icon>mdi-delete</v-icon>
              Excluir
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog para criar/editar categoria -->
    <v-dialog v-model="dialogCategoria" max-width="500">
      <v-card>
        <v-card-title>
          {{ categoriaEdit ? 'Editar Categoria' : 'Nova Categoria' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="formCategoria" v-model="formValid">
            <v-text-field
              v-model="formData.nome"
              label="Nome"
              :rules="[v => !!v || 'Nome é obrigatório']"
              required
            />
            
            <v-text-field
              v-model="formData.tipo"
              label="Tipo"
              :rules="[v => !!v || 'Tipo é obrigatório']"
              hint="Ex: gastos, investimentos, lanches, mercado"
              required
            />
            
            <v-text-field
              v-model="formData.cor"
              label="Cor (hexadecimal)"
              placeholder="#9C27B0"
              :rules="[validarCor]"
            >
              <template #prepend>
                <div
                  :style="{ 
                    width: '30px', 
                    height: '30px', 
                    backgroundColor: formData.cor || '#9C27B0',
                    borderRadius: '4px'
                  }"
                />
              </template>
            </v-text-field>
            
            <v-text-field
              v-if="!categoriaEdit"
              v-model.number="formData.saldo_inicial"
              label="Saldo Inicial"
              type="number"
              step="0.01"
              prefix="R$"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogCategoria = false">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="!formValid"
            @click="salvarCategoria"
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
          Tem certeza que deseja excluir a categoria "{{ categoriaParaExcluir?.nome }}"?
          Todos os lançamentos associados também serão excluídos.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogExcluir = false">
            Cancelar
          </v-btn>
          <v-btn color="error" variant="elevated" @click="excluirCategoria">
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
import { ref, onMounted } from 'vue';
import { categoriasApi, type Categoria, type CategoriaResumo } from '@/services/api';

const categorias = ref<CategoriaResumo[]>([]);
const dialogCategoria = ref(false);
const dialogExcluir = ref(false);
const categoriaEdit = ref<Categoria | null>(null);
const categoriaParaExcluir = ref<Categoria | null>(null);
const formValid = ref(false);
const formCategoria = ref();

const formData = ref({
  nome: '',
  tipo: '',
  cor: '#9C27B0',
  saldo_inicial: 0,
});

const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const carregarCategorias = async () => {
  try {
    const response = await categoriasApi.getResumo();
    categorias.value = response.data;
  } catch (error) {
    mostrarMensagem('Erro ao carregar categorias', 'error');
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
  }
};

const confirmarExclusao = (categoria: Categoria) => {
  categoriaParaExcluir.value = categoria;
  dialogExcluir.value = true;
};

const excluirCategoria = async () => {
  if (!categoriaParaExcluir.value) return;

  try {
    await categoriasApi.delete(categoriaParaExcluir.value.id);
    mostrarMensagem('Categoria excluída com sucesso!');
    dialogExcluir.value = false;
    carregarCategorias();
  } catch (error) {
    mostrarMensagem('Erro ao excluir categoria', 'error');
  }
};

const validarCor = (v: string) => {
  if (!v) return true;
  return /^#[0-9A-F]{6}$/i.test(v) || 'Cor inválida (use formato #RRGGBB)';
};

const formatarValor = (valor: number) => {
  return valor.toFixed(2).replace('.', ',');
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
  transition: transform 0.2s;
}

.categoria-card:hover {
  transform: translateY(-4px);
}
</style>

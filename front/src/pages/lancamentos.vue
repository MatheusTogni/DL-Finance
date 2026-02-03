<template>
  <v-container class="pa-4 pa-md-6" style="max-width: 1200px;">
    <!-- Header -->
    <div class="mb-6">
      <v-btn
        block
        class="mb-4"
        color="primary"
        elevation="2"
        prepend-icon="mdi-plus-circle"
        size="large"
        @click="abrirDialogLancamento()"
      >
        Novo Lançamento
      </v-btn>
    </div>

    <!-- Filtro por categoria -->
    <v-card class="mb-4" elevation="1">
      <v-card-text class="pa-3">
        <v-select
          v-model="filtroCategoria"
          clearable
          hide-details
          item-title="text"
          item-value="value"
          :items="categoriasOptions"
          label="Filtrar por categoria"
          prepend-inner-icon="mdi-filter"
          @update:model-value="carregarLancamentos"
        />
      </v-card-text>
    </v-card>

    <!-- Lista de lançamentos -->
    <div v-if="loadingLancamentos" class="text-center pa-16">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
        width="6"
      />
      <p class="text-h6 mt-6 text-medium-emphasis">Buscando lançamentos...</p>
    </div>

    <div v-else-if="lancamentos.length === 0" class="mb-4">
      <v-card class="text-center pa-8" color="surface-variant" elevation="0">
        <v-icon color="grey-lighten-1" size="80">mdi-receipt-text-outline</v-icon>
        <p class="text-h6 mt-4 mb-2 text-medium-emphasis">Nenhum lançamento encontrado</p>
        <p class="text-body-2 text-medium-emphasis">Adicione seu primeiro lançamento</p>
      </v-card>
    </div>

    <div v-else>
      <v-card
        v-for="lancamento in lancamentos"
        :key="lancamento.id"
        class="mb-3 lancamento-card"
        elevation="2"
        hover
      >
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-center">
            <div>
              <h3 class="text-body-1 font-weight-bold">
                {{ lancamento.descricao || 'Sem descrição' }}
              </h3>
              <div class="d-flex align-center mt-1">
                <v-chip
                  class="mr-2"
                  :color="lancamento.categoria_cor"
                  size="x-small"
                  variant="tonal"
                >
                  {{ lancamento.categoria_nome }}
                </v-chip>
              </div>
            </div>

            <div class="d-flex align-center gap-3">
              <div
                class="text-h6 font-weight-bold"
                :class="lancamento.tipo_lancamento === 'entrada' ? 'text-success' : 'text-error'"
              >
                {{ lancamento.tipo_lancamento === 'entrada' ? '+' : '-' }}
                R$ {{ formatarValor(lancamento.valor) }}
              </div>
              <div class="d-flex gap-2">
                <v-btn
                  color="#269B71"
                  icon="mdi-pencil"
                  size="small"
                  variant="tonal"
                  @click="abrirDialogLancamento(lancamento)"
                />
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  size="small"
                  variant="tonal"
                  @click="confirmarExclusao(lancamento)"
                />
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Dialog para criar/editar lançamento -->
    <v-dialog v-model="dialogLancamento" max-width="500" transition="dialog-bottom-transition">
      <v-card rounded="xl">
        <v-card-title class="bg-primary text-white pa-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2">{{ lancamentoEdit ? 'mdi-pencil' : 'mdi-plus-circle' }}</v-icon>
            {{ lancamentoEdit ? 'Editar Lançamento' : 'Novo Lançamento' }}
          </div>
        </v-card-title>

        <v-card-text class="pa-4 pa-md-6">
          <v-form ref="formLancamento" v-model="formValid">
            <v-select
              v-model="formData.categoria_id"
              class="mb-2"
              item-title="nome"
              item-value="id"
              :items="categorias"
              label="Categoria"
              prepend-inner-icon="mdi-folder"
              required
              :rules="[v => !!v || 'Categoria é obrigatória']"
            >
              <template #selection="{ item }">
                <v-chip :color="item.raw.cor" variant="tonal">
                  {{ item.raw.nome }}
                </v-chip>
              </template>
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :base-color="item.raw.cor"
                  :prepend-icon="'mdi-circle'"
                />
              </template>
            </v-select>

            <v-text-field
              v-model.number="formData.valor"
              class="mb-2"
              label="Valor"
              prefix="R$"
              prepend-inner-icon="mdi-currency-usd"
              required
              :rules="[
                v => !!v || 'Valor é obrigatório',
                v => v > 0 || 'Valor deve ser maior que zero'
              ]"
              step="0.01"
              type="number"
            />

            <v-text-field
              v-model="formData.descricao"
              label="Descrição (opcional)"
              placeholder="Ex: Compras no supermercado"
              prepend-inner-icon="mdi-text"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="dialogLancamento = false">
            Cancelar
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            :disabled="!formValid"
            :loading="salvandoLancamento"
            size="large"
            variant="elevated"
            @click="salvarLancamento"
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
          <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text class="pa-4">
          <v-alert density="compact" type="warning" variant="tonal">
            Tem certeza que deseja excluir este lançamento?
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="dialogExcluir = false">
            Cancelar
          </v-btn>
          <v-spacer />
          <v-btn color="error" :loading="excluindoLancamento" variant="elevated" @click="excluirLancamento">
            <v-icon start>mdi-delete</v-icon>
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      location="top"
      rounded="pill"
      timeout="3000"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ snackbarColor === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
        {{ snackbarText }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { type Categoria, categoriasApi, type Lancamento, lancamentosApi } from '@/services/api'

  const lancamentos = ref<Lancamento[]>([])
  const categorias = ref<Categoria[]>([])
  const filtroCategoria = ref<number | null>(null)
  const dialogLancamento = ref(false)
  const dialogExcluir = ref(false)
  const lancamentoEdit = ref<Lancamento | null>(null)
  const lancamentoParaExcluir = ref<Lancamento | null>(null)
  const formValid = ref(false)
  const formLancamento = ref()
  const loadingLancamentos = ref(false)
  const salvandoLancamento = ref(false)
  const excluindoLancamento = ref(false)

  const formData = ref({
    categoria_id: null as number | null,
    descricao: '',
    valor: 0,
    tipo_lancamento: 'saida' as 'entrada' | 'saida',
    data_lancamento: new Date().toISOString().slice(0, 16),
  })

  const snackbar = ref(false)
  const snackbarText = ref('')
  const snackbarColor = ref('success')

  const categoriasOptions = computed(() => [
    { text: 'Todas as categorias', value: null },
    ...categorias.value.map(c => ({ text: c.nome, value: c.id })),
  ])

  async function carregarLancamentos () {
    try {
      loadingLancamentos.value = true
      const response = await lancamentosApi.getAll(filtroCategoria.value || undefined)
      lancamentos.value = response.data
      console.log('Lançamentos carregados:', response.data)
    } catch (error) {
      console.error('Erro ao carregar lançamentos:', error)
      mostrarMensagem('Erro ao carregar lançamentos', 'error')
    } finally {
      loadingLancamentos.value = false
    }
  }

  async function carregarCategorias () {
    try {
      const response = await categoriasApi.getAll()
      categorias.value = response.data
    } catch {
      mostrarMensagem('Erro ao carregar categorias', 'error')
    }
  }

  function abrirDialogLancamento (lancamento?: Lancamento) {
    if (lancamento) {
      lancamentoEdit.value = lancamento
      formData.value = {
        categoria_id: lancamento.categoria_id,
        descricao: lancamento.descricao || '',
        valor: lancamento.valor,
        tipo_lancamento: lancamento.tipo_lancamento,
        data_lancamento: new Date().toISOString().slice(0, 16),
      }
    } else {
      lancamentoEdit.value = null
      formData.value = {
        categoria_id: null,
        descricao: '',
        valor: 0,
        tipo_lancamento: 'saida',
        data_lancamento: new Date().toISOString().slice(0, 16),
      }
    }
    dialogLancamento.value = true
  }

  async function salvarLancamento () {
    if (!formLancamento.value) return

    const valid = await formLancamento.value.validate()
    if (!valid.valid) return

    try {
      salvandoLancamento.value = true
      const dados = {
        categoria_id: formData.value.categoria_id!,
        descricao: formData.value.descricao || undefined,
        valor: formData.value.valor,
        tipo_lancamento: formData.value.tipo_lancamento,
        data_lancamento: formData.value.data_lancamento,
      }

      if (lancamentoEdit.value) {
        await lancamentosApi.update(lancamentoEdit.value.id, dados)
        mostrarMensagem('Lançamento atualizado com sucesso!')
      } else {
        await lancamentosApi.create(dados)
        mostrarMensagem('Lançamento criado com sucesso!')
      }
      dialogLancamento.value = false
      carregarLancamentos()
    } catch {
      mostrarMensagem('Erro ao salvar lançamento', 'error')
    } finally {
      salvandoLancamento.value = false
    }
  }

  function confirmarExclusao (lancamento: Lancamento) {
    lancamentoParaExcluir.value = lancamento
    dialogExcluir.value = true
  }

  async function excluirLancamento () {
    if (!lancamentoParaExcluir.value) return

    try {
      excluindoLancamento.value = true
      await lancamentosApi.delete(lancamentoParaExcluir.value.id)
      mostrarMensagem('Lançamento excluído com sucesso!')
      dialogExcluir.value = false
      carregarLancamentos()
    } catch {
      mostrarMensagem('Erro ao excluir lançamento', 'error')
    } finally {
      excluindoLancamento.value = false
    }
  }

  function formatarValor (valor: number | string) {
    const num = typeof valor === 'string' ? Number.parseFloat(valor) : valor
    return num.toFixed(2).replace('.', ',')
  }

  function mostrarMensagem (texto: string, cor = 'success') {
    snackbarText.value = texto
    snackbarColor.value = cor
    snackbar.value = true
  }

  // Determinar automaticamente o tipo de lançamento baseado na categoria
  watch(() => formData.value.categoria_id, novaCategoriaId => {
    if (novaCategoriaId) {
      const categoriaSelecionada = categorias.value.find(c => c.id === novaCategoriaId)
      if (categoriaSelecionada) {
        // Se a categoria é do tipo "Positivo", é entrada; se "Negativo", é saída
        formData.value.tipo_lancamento = categoriaSelecionada.tipo.toLowerCase() === 'positivo' ? 'entrada' : 'saida'
      }
    }
  })

  onMounted(() => {
    carregarCategorias()
    carregarLancamentos()
  })
</script>

<style scoped>
.lancamento-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.lancamento-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(156, 39, 176, 0.15) !important;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.w-100 {
  width: 100%;
}
</style>

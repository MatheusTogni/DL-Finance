<template>
  <v-container class="pa-4 pa-md-6" style="max-width: 1200px">
    <!-- Header -->
    <div class="mb-6">
      <v-btn
        block
        class="mb-4"
        color="primary"
        elevation="2"
        prepend-icon="mdi-plus-circle"
        size="large"
        @click="abrirDialogCategoria()"
      >
        Nova Categoria
      </v-btn>
    </div>

    <!-- Lista de Categorias -->
    <div v-if="loadingCategorias" class="text-center pa-16">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
        width="6"
      />
      <p class="text-h6 mt-6 text-medium-emphasis">Buscando categorias...</p>
    </div>

    <v-row v-else>
      <v-col
        v-for="categoria in categorias"
        :key="categoria.id"
        cols="12"
        md="4"
        sm="6"
      >
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
                    class="mt-1"
                    :color="categoria.cor"
                    size="small"
                    variant="tonal"
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
              <v-icon class="mr-1" size="16">mdi-receipt-text</v-icon>
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
                <div v-if="categoria.meta" class="mt-2">
                  <div class="text-caption text-medium-emphasis">
                    Meta: R$ {{ formatarValor(categoria.meta) }}
                  </div>
                  <v-progress-linear
                    :model-value="Math.min((categoria.saldo_atual / categoria.meta) * 100, 100)"
                    :color="categoria.saldo_atual > categoria.meta ? 'error' : categoria.cor"
                    class="mt-1"
                    height="6"
                    rounded
                  />
                  <div class="text-caption mt-1" :class="categoria.saldo_atual > categoria.meta ? 'text-error' : 'text-success'">
                    {{ categoria.saldo_atual > categoria.meta ? 'Acima da meta!' : `Restante: R$ ${formatarValor(categoria.meta - categoria.saldo_atual)}` }}
                  </div>
                </div>
              </div>

              <div class="d-flex gap-2">
                <v-btn
                  color="#269B71"
                  icon="mdi-pencil"
                  size="small"
                  variant="tonal"
                  @click="abrirDialogCategoria(categoria)"
                />
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  size="small"
                  variant="tonal"
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
              class="mb-2"
              label="Nome da Categoria"
              placeholder="Ex: Lanches, Mercado, Investimentos"
              prepend-inner-icon="mdi-tag"
              required
              :rules="[(v) => !!v || 'Nome é obrigatório']"
            />

            <v-text-field
              v-model="formData.tipo"
              class="mb-2"
              label="Tipo"
              placeholder="Ex: gastos, investimentos, lanches"
              prepend-inner-icon="mdi-shape"
              required
              :rules="[(v) => !!v || 'Tipo é obrigatório']"
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
                  density="comfortable"
                  hide-details
                  placeholder="#9C27B0"
                  :rules="[validarCor]"
                />
              </div>
              <div class="mt-2 d-flex flex-wrap gap-2">
                <v-btn
                  v-for="cor in coresSugeridas"
                  :key="cor"
                  :color="cor"
                  icon
                  size="small"
                  @click="formData.cor = cor"
                />
              </div>
            </div>

            <v-text-field
              v-if="!categoriaEdit"
              v-model.number="formData.saldo_inicial"
              label="Saldo Inicial (opcional)"
              prefix="R$"
              prepend-inner-icon="mdi-cash"
              step="0.01"
              type="number"
            />

            <v-text-field
              v-model.number="formData.meta"
              label="Meta de Gastos (opcional)"
              prefix="R$"
              prepend-inner-icon="mdi-target"
              step="0.01"
              type="number"
              hint="Defina um limite de gastos para esta categoria"
              persistent-hint
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="dialogCategoria = false"> Cancelar </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            :disabled="!formValid"
            :loading="salvandoCategoria"
            size="large"
            variant="elevated"
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
          <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text class="pa-4">
          Tem certeza que deseja excluir a categoria
          <strong>"{{ categoriaParaExcluir?.nome }}"</strong>? <br><br>
          <v-alert density="compact" type="warning" variant="tonal">
            Todos os lançamentos associados também serão excluídos.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="dialogExcluir = false"> Cancelar </v-btn>
          <v-spacer />
          <v-btn color="error" :loading="excluindoCategoria" variant="elevated" @click="excluirCategoria">
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
        <v-icon class="mr-2">{{
          snackbarColor === "success" ? "mdi-check-circle" : "mdi-alert-circle"
        }}</v-icon>
        {{ snackbarText }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { type Categoria, type CategoriaResumo, categoriasApi } from '@/services/api'

  const categorias = ref<CategoriaResumo[]>([])
  const dialogCategoria = ref(false)
  const dialogExcluir = ref(false)
  const categoriaEdit = ref<Categoria | null>(null)
  const categoriaParaExcluir = ref<Categoria | null>(null)
  const formValid = ref(false)
  const formCategoria = ref()
  const loadingCategorias = ref(false)
  const salvandoCategoria = ref(false)
  const excluindoCategoria = ref(false)

  const formData = ref({
    nome: '',
    tipo: '',
    cor: '#9C27B0',
    saldo_inicial: 0,
    meta: undefined as number | undefined,
  })

  const snackbar = ref(false)
  const snackbarText = ref('')
  const snackbarColor = ref('success')

  const coresSugeridas = [
    '#9C27B0', // Roxo
    '#E91E63', // Rosa
    '#3F51B5', // Azul
    '#009688', // Verde-azulado
    '#FF9800', // Laranja
    '#795548', // Marrom
    '#607D8B', // Cinza-azulado
    '#F44336', // Vermelho
  ]

  async function carregarCategorias () {
    try {
      loadingCategorias.value = true
      const response = await categoriasApi.getResumo()
      categorias.value = response.data
      console.log('Categorias carregadas:', response.data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      mostrarMensagem('Erro ao carregar categorias', 'error')
    } finally {
      loadingCategorias.value = false
    }
  }

  function abrirDialogCategoria (categoria?: Categoria) {
    if (categoria) {
      categoriaEdit.value = categoria
      formData.value = {
        nome: categoria.nome,
        tipo: categoria.tipo,
        cor: categoria.cor,
        saldo_inicial: 0,
        meta: categoria.meta,
      }
    } else {
      categoriaEdit.value = null
      formData.value = {
        nome: '',
        tipo: '',
        cor: '#9C27B0',
        saldo_inicial: 0,
        meta: undefined,
      }
    }
    dialogCategoria.value = true
  }

  async function salvarCategoria () {
    if (!formCategoria.value) return

    const valid = await formCategoria.value.validate()
    if (!valid.valid) return

    try {
      salvandoCategoria.value = true
      if (categoriaEdit.value) {
        await categoriasApi.update(categoriaEdit.value.id, {
          nome: formData.value.nome,
          tipo: formData.value.tipo,
          cor: formData.value.cor,
          meta: formData.value.meta,
        })
        mostrarMensagem('Categoria atualizada com sucesso!')
      } else {
        await categoriasApi.create(formData.value)
        mostrarMensagem('Categoria criada com sucesso!')
      }
      dialogCategoria.value = false
      carregarCategorias()
    } catch {
      mostrarMensagem('Erro ao salvar categoria', 'error')
    } finally {
      salvandoCategoria.value = false
    }
  }

  function confirmarExclusao (categoria: Categoria) {
    categoriaParaExcluir.value = categoria
    dialogExcluir.value = true
  }

  async function excluirCategoria () {
    if (!categoriaParaExcluir.value) return

    try {
      excluindoCategoria.value = true
      await categoriasApi.delete(categoriaParaExcluir.value.id)
      mostrarMensagem('Categoria excluída com sucesso!')
      dialogExcluir.value = false
      carregarCategorias()
    } catch {
      mostrarMensagem('Erro ao excluir categoria', 'error')
    } finally {
      excluindoCategoria.value = false
    }
  }

  function validarCor (v: string) {
    if (!v) return true
    return /^#[0-9A-F]{6}$/i.test(v) || 'Cor inválida (use formato #RRGGBB)'
  }

  function formatarValor (valor: number | string) {
    const num = typeof valor === 'string' ? Number.parseFloat(valor) : valor
    return Math.abs(num).toFixed(2).replace('.', ',')
  }

  function mostrarMensagem (texto: string, cor = 'success') {
    snackbarText.value = texto
    snackbarColor.value = cor
    snackbar.value = true
  }

  onMounted(() => {
    carregarCategorias()
  })
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

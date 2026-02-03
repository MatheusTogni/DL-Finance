import axios from 'axios'

const api = axios.create({
  baseURL: 'https://dl-finance-back.vercel.app',
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Categoria {
  id: number
  nome: string
  saldo_atual: number
  tipo: string
  cor: string
  meta?: number
  created_at: string
  updated_at: string
}

export interface CategoriaResumo extends Categoria {
  total_lancamentos: number
  total_entradas: number
  total_saidas: number
}

export interface CreateCategoriaDto {
  nome: string
  tipo: string
  cor?: string
  saldo_inicial?: number
  meta?: number
}

export interface Lancamento {
  id: number
  categoria_id: number
  descricao: string
  valor: number
  tipo_lancamento: 'entrada' | 'saida'
  data_lancamento: string
  created_at: string
  categoria_nome?: string
  categoria_cor?: string
}

export interface CreateLancamentoDto {
  categoria_id: number
  descricao?: string
  valor: number
  tipo_lancamento: 'entrada' | 'saida'
  data_lancamento?: string
}

// Categorias
export const categoriasApi = {
  getAll: () => api.get<Categoria[]>('/categorias'),
  getResumo: () => api.get<CategoriaResumo[]>('/categorias/resumo'),
  getById: (id: number) => api.get<Categoria>(`/categorias/${id}`),
  create: (data: CreateCategoriaDto) => api.post<Categoria>('/categorias', data),
  update: (id: number, data: Partial<CreateCategoriaDto>) =>
    api.put<Categoria>(`/categorias/${id}`, data),
  delete: (id: number) => api.delete(`/categorias/${id}`),
}

// Lançamentos
export const lancamentosApi = {
  getAll: (categoriaId?: number) => {
    const params = categoriaId ? { categoria_id: categoriaId } : {}
    return api.get<Lancamento[]>('/lancamentos', { params })
  },
  getEstatisticas: () => api.get('/lancamentos/estatisticas'),
  getById: (id: number) => api.get<Lancamento>(`/lancamentos/${id}`),
  create: (data: CreateLancamentoDto) => api.post<Lancamento>('/lancamentos', data),
  update: (id: number, data: Partial<CreateLancamentoDto>) =>
    api.put<Lancamento>(`/lancamentos/${id}`, data),
  delete: (id: number) => api.delete(`/lancamentos/${id}`),
}

export default api

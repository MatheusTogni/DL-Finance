export interface Lancamento {
  id: number;
  categoria_id: number;
  descricao: string;
  valor: number;
  tipo_lancamento: 'entrada' | 'saida';
  data_lancamento: Date;
  created_at: Date;
}

export interface LancamentoComCategoria extends Lancamento {
  categoria_nome: string;
  categoria_cor: string;
}

export interface CreateLancamentoDto {
  categoria_id: number;
  descricao?: string;
  valor: number;
  tipo_lancamento: 'entrada' | 'saida';
  data_lancamento?: Date;
}

export interface UpdateLancamentoDto {
  categoria_id?: number;
  descricao?: string;
  valor?: number;
  tipo_lancamento?: 'entrada' | 'saida';
  data_lancamento?: Date;
}

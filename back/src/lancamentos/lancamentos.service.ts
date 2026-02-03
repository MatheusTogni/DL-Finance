import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { 
  Lancamento, 
  LancamentoComCategoria, 
  CreateLancamentoDto, 
  UpdateLancamentoDto 
} from './lancamentos.interface';

@Injectable()
export class LancamentosService {
  constructor(private db: DatabaseService) {}

  async findAll(): Promise<LancamentoComCategoria[]> {
    const query = `
      SELECT 
        l.id,
        l.categoria_id,
        l.descricao,
        l.valor,
        l.tipo_lancamento,
        l.data_lancamento,
        l.created_at,
        c.nome as categoria_nome,
        c.cor as categoria_cor
      FROM lancamentos l
      JOIN categorias c ON l.categoria_id = c.id
      ORDER BY l.data_lancamento DESC, l.created_at DESC
    `;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findByCategoria(categoriaId: number): Promise<LancamentoComCategoria[]> {
    const query = `
      SELECT 
        l.id,
        l.categoria_id,
        l.descricao,
        l.valor,
        l.tipo_lancamento,
        l.data_lancamento,
        l.created_at,
        c.nome as categoria_nome,
        c.cor as categoria_cor
      FROM lancamentos l
      JOIN categorias c ON l.categoria_id = c.id
      WHERE l.categoria_id = $1
      ORDER BY l.data_lancamento DESC, l.created_at DESC
    `;
    const result = await this.db.query(query, [categoriaId]);
    return result.rows;
  }

  async findOne(id: number): Promise<LancamentoComCategoria> {
    const query = `
      SELECT 
        l.id,
        l.categoria_id,
        l.descricao,
        l.valor,
        l.tipo_lancamento,
        l.data_lancamento,
        l.created_at,
        c.nome as categoria_nome,
        c.cor as categoria_cor
      FROM lancamentos l
      JOIN categorias c ON l.categoria_id = c.id
      WHERE l.id = $1
    `;
    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }

  async create(createDto: CreateLancamentoDto): Promise<Lancamento> {
    // Buscar a categoria para determinar o tipo de lançamento automaticamente
    const categoriaQuery = `SELECT tipo FROM categorias WHERE id = $1`;
    const categoriaResult = await this.db.query(categoriaQuery, [createDto.categoria_id]);
    
    if (!categoriaResult.rows.length) {
      throw new Error('Categoria não encontrada');
    }
    
    const categoria = categoriaResult.rows[0];
    const tipoLancamento = categoria.tipo.toLowerCase() === 'positivo' ? 'entrada' : 'saida';
    
    const query = `
      INSERT INTO lancamentos (categoria_id, descricao, valor, tipo_lancamento, data_lancamento)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, categoria_id, descricao, valor, tipo_lancamento, data_lancamento, created_at
    `;
    const values = [
      createDto.categoria_id,
      createDto.descricao || null,
      createDto.valor,
      tipoLancamento,
      createDto.data_lancamento || new Date(),
    ];
    const result = await this.db.query(query, values);
    
    // Atualizar saldo da categoria
    const updateSaldoQuery = `
      UPDATE categorias 
      SET saldo_atual = saldo_atual ${tipoLancamento === 'entrada' ? '+' : '-'} $1
      WHERE id = $2
    `;
    await this.db.query(updateSaldoQuery, [createDto.valor, createDto.categoria_id]);
    
    return result.rows[0];
  }

  async update(id: number, updateDto: UpdateLancamentoDto): Promise<Lancamento> {
    // Buscar lançamento atual para reverter o saldo
    const lancamentoAtual = await this.findOne(id);
    if (!lancamentoAtual) {
      throw new Error('Lançamento não encontrado');
    }
    
    // Reverter o saldo antigo
    const revertQuery = `
      UPDATE categorias 
      SET saldo_atual = saldo_atual ${lancamentoAtual.tipo_lancamento === 'entrada' ? '-' : '+'} $1
      WHERE id = $2
    `;
    await this.db.query(revertQuery, [lancamentoAtual.valor, lancamentoAtual.categoria_id]);
    
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Se a categoria foi alterada, buscar o novo tipo
    let novoTipoLancamento = lancamentoAtual.tipo_lancamento;
    let novaCategoriaId = lancamentoAtual.categoria_id;
    
    if (updateDto.categoria_id !== undefined) {
      novaCategoriaId = updateDto.categoria_id;
      const categoriaQuery = `SELECT tipo FROM categorias WHERE id = $1`;
      const categoriaResult = await this.db.query(categoriaQuery, [updateDto.categoria_id]);
      
      if (categoriaResult.rows.length) {
        const categoria = categoriaResult.rows[0];
        novoTipoLancamento = categoria.tipo.toLowerCase() === 'positivo' ? 'entrada' : 'saida';
      }
      
      fields.push(`categoria_id = $${paramCount++}`);
      values.push(updateDto.categoria_id);
      fields.push(`tipo_lancamento = $${paramCount++}`);
      values.push(novoTipoLancamento);
    }
    
    if (updateDto.descricao !== undefined) {
      fields.push(`descricao = $${paramCount++}`);
      values.push(updateDto.descricao);
    }
    
    const novoValor = updateDto.valor !== undefined ? updateDto.valor : lancamentoAtual.valor;
    if (updateDto.valor !== undefined) {
      fields.push(`valor = $${paramCount++}`);
      values.push(updateDto.valor);
    }
    
    if (updateDto.data_lancamento !== undefined) {
      fields.push(`data_lancamento = $${paramCount++}`);
      values.push(updateDto.data_lancamento);
    }

    values.push(id);

    const query = `
      UPDATE lancamentos
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, categoria_id, descricao, valor, tipo_lancamento, data_lancamento, created_at
    `;

    const result = await this.db.query(query, values);
    
    // Aplicar o novo saldo
    const updateSaldoQuery = `
      UPDATE categorias 
      SET saldo_atual = saldo_atual ${novoTipoLancamento === 'entrada' ? '+' : '-'} $1
      WHERE id = $2
    `;
    await this.db.query(updateSaldoQuery, [novoValor, novaCategoriaId]);
    
    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    // Buscar lançamento antes de deletar para reverter o saldo
    const lancamento = await this.findOne(id);
    if (!lancamento) {
      throw new Error('Lançamento não encontrado');
    }
    
    // Reverter o saldo da categoria
    const updateSaldoQuery = `
      UPDATE categorias 
      SET saldo_atual = saldo_atual ${lancamento.tipo_lancamento === 'entrada' ? '-' : '+'} $1
      WHERE id = $2
    `;
    await this.db.query(updateSaldoQuery, [lancamento.valor, lancamento.categoria_id]);
    
    const query = `DELETE FROM lancamentos WHERE id = $1`;
    await this.db.query(query, [id]);
  }

  async getEstatisticas(): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_lancamentos,
        COALESCE(SUM(CASE WHEN tipo_lancamento = 'entrada' THEN valor ELSE 0 END), 0) as total_entradas,
        COALESCE(SUM(CASE WHEN tipo_lancamento = 'saida' THEN valor ELSE 0 END), 0) as total_saidas,
        COALESCE(SUM(CASE WHEN tipo_lancamento = 'entrada' THEN valor ELSE -valor END), 0) as saldo_total
      FROM lancamentos
    `;
    const result = await this.db.query(query);
    return result.rows[0];
  }
}

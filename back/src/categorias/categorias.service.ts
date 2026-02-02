import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from './categorias.interface';

@Injectable()
export class CategoriasService {
  constructor(private db: DatabaseService) {}

  async findAll(): Promise<Categoria[]> {
    const query = `
      SELECT id, nome, saldo_atual, tipo, cor, created_at, updated_at
      FROM categorias
      ORDER BY nome ASC
    `;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findOne(id: number): Promise<Categoria> {
    const query = `
      SELECT id, nome, saldo_atual, tipo, cor, created_at, updated_at
      FROM categorias
      WHERE id = $1
    `;
    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }

  async create(createDto: CreateCategoriaDto): Promise<Categoria> {
    const query = `
      INSERT INTO categorias (nome, tipo, cor, saldo_atual)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nome, saldo_atual, tipo, cor, created_at, updated_at
    `;
    const values = [
      createDto.nome,
      createDto.tipo,
      createDto.cor || '#9C27B0',
      createDto.saldo_inicial || 0,
    ];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async update(id: number, updateDto: UpdateCategoriaDto): Promise<Categoria> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updateDto.nome !== undefined) {
      fields.push(`nome = $${paramCount++}`);
      values.push(updateDto.nome);
    }
    if (updateDto.tipo !== undefined) {
      fields.push(`tipo = $${paramCount++}`);
      values.push(updateDto.tipo);
    }
    if (updateDto.cor !== undefined) {
      fields.push(`cor = $${paramCount++}`);
      values.push(updateDto.cor);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE categorias
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, nome, saldo_atual, tipo, cor, created_at, updated_at
    `;

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    const query = `DELETE FROM categorias WHERE id = $1`;
    await this.db.query(query, [id]);
  }

  async getResumo(): Promise<any[]> {
    const query = `
      SELECT 
        c.id,
        c.nome,
        c.tipo,
        c.cor,
        c.saldo_atual,
        COUNT(l.id) as total_lancamentos,
        COALESCE(SUM(CASE WHEN l.tipo_lancamento = 'entrada' THEN l.valor ELSE 0 END), 0) as total_entradas,
        COALESCE(SUM(CASE WHEN l.tipo_lancamento = 'saida' THEN l.valor ELSE 0 END), 0) as total_saidas
      FROM categorias c
      LEFT JOIN lancamentos l ON c.id = l.categoria_id
      GROUP BY c.id, c.nome, c.tipo, c.cor, c.saldo_atual
      ORDER BY c.nome
    `;
    const result = await this.db.query(query);
    return result.rows;
  }
}

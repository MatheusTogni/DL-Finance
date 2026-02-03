"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LancamentosService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let LancamentosService = class LancamentosService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findAll() {
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
    async findByCategoria(categoriaId) {
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
    async findOne(id) {
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
    async create(createDto) {
        const query = `
      INSERT INTO lancamentos (categoria_id, descricao, valor, tipo_lancamento, data_lancamento)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, categoria_id, descricao, valor, tipo_lancamento, data_lancamento, created_at
    `;
        const values = [
            createDto.categoria_id,
            createDto.descricao || null,
            createDto.valor,
            createDto.tipo_lancamento,
            createDto.data_lancamento || new Date(),
        ];
        const result = await this.db.query(query, values);
        return result.rows[0];
    }
    async update(id, updateDto) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (updateDto.categoria_id !== undefined) {
            fields.push(`categoria_id = $${paramCount++}`);
            values.push(updateDto.categoria_id);
        }
        if (updateDto.descricao !== undefined) {
            fields.push(`descricao = $${paramCount++}`);
            values.push(updateDto.descricao);
        }
        if (updateDto.valor !== undefined) {
            fields.push(`valor = $${paramCount++}`);
            values.push(updateDto.valor);
        }
        if (updateDto.tipo_lancamento !== undefined) {
            fields.push(`tipo_lancamento = $${paramCount++}`);
            values.push(updateDto.tipo_lancamento);
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
        return result.rows[0];
    }
    async delete(id) {
        const query = `DELETE FROM lancamentos WHERE id = $1`;
        await this.db.query(query, [id]);
    }
    async getEstatisticas() {
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
};
exports.LancamentosService = LancamentosService;
exports.LancamentosService = LancamentosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], LancamentosService);
//# sourceMappingURL=lancamentos.service.js.map
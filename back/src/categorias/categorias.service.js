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
exports.CategoriasService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let CategoriasService = class CategoriasService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const query = `
      SELECT id, nome, saldo_atual, tipo, cor, created_at, updated_at
      FROM categorias
      ORDER BY nome ASC
    `;
        const result = await this.db.query(query);
        return result.rows;
    }
    async findOne(id) {
        const query = `
      SELECT id, nome, saldo_atual, tipo, cor, created_at, updated_at
      FROM categorias
      WHERE id = $1
    `;
        const result = await this.db.query(query, [id]);
        return result.rows[0];
    }
    async create(createDto) {
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
    async update(id, updateDto) {
        const fields = [];
        const values = [];
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
    async delete(id) {
        const query = `DELETE FROM categorias WHERE id = $1`;
        await this.db.query(query, [id]);
    }
    async getResumo() {
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
};
exports.CategoriasService = CategoriasService;
exports.CategoriasService = CategoriasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], CategoriasService);
//# sourceMappingURL=categorias.service.js.map
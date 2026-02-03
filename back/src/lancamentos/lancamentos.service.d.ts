import { DatabaseService } from '../database/database.service';
import { Lancamento, LancamentoComCategoria, CreateLancamentoDto, UpdateLancamentoDto } from './lancamentos.interface';
export declare class LancamentosService {
    private db;
    constructor(db: DatabaseService);
    findAll(): Promise<LancamentoComCategoria[]>;
    findByCategoria(categoriaId: number): Promise<LancamentoComCategoria[]>;
    findOne(id: number): Promise<LancamentoComCategoria>;
    create(createDto: CreateLancamentoDto): Promise<Lancamento>;
    update(id: number, updateDto: UpdateLancamentoDto): Promise<Lancamento>;
    delete(id: number): Promise<void>;
    getEstatisticas(): Promise<any>;
}

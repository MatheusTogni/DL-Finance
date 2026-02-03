import { LancamentosService } from './lancamentos.service';
import type { CreateLancamentoDto, UpdateLancamentoDto } from './lancamentos.interface';
export declare class LancamentosController {
    private readonly lancamentosService;
    constructor(lancamentosService: LancamentosService);
    findAll(categoriaId?: string): Promise<import("./lancamentos.interface").LancamentoComCategoria[]>;
    getEstatisticas(): Promise<any>;
    findOne(id: number): Promise<import("./lancamentos.interface").LancamentoComCategoria>;
    create(createDto: CreateLancamentoDto): Promise<import("./lancamentos.interface").Lancamento>;
    update(id: number, updateDto: UpdateLancamentoDto): Promise<import("./lancamentos.interface").Lancamento>;
    delete(id: number): Promise<void>;
}

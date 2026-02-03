import { CategoriasService } from './categorias.service';
import type { CreateCategoriaDto, UpdateCategoriaDto } from './categorias.interface';
export declare class CategoriasController {
    private readonly categoriasService;
    constructor(categoriasService: CategoriasService);
    findAll(): Promise<import("./categorias.interface").Categoria[]>;
    getResumo(): Promise<any[]>;
    findOne(id: number): Promise<import("./categorias.interface").Categoria>;
    create(createDto: CreateCategoriaDto): Promise<import("./categorias.interface").Categoria>;
    update(id: number, updateDto: UpdateCategoriaDto): Promise<import("./categorias.interface").Categoria>;
    delete(id: number): Promise<void>;
}

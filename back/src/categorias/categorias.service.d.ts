import { DatabaseService } from '../database/database.service';
import { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from './categorias.interface';
export declare class CategoriasService {
    private db;
    constructor(db: DatabaseService);
    findAll(): Promise<Categoria[]>;
    findOne(id: number): Promise<Categoria>;
    create(createDto: CreateCategoriaDto): Promise<Categoria>;
    update(id: number, updateDto: UpdateCategoriaDto): Promise<Categoria>;
    delete(id: number): Promise<void>;
    getResumo(): Promise<any[]>;
}

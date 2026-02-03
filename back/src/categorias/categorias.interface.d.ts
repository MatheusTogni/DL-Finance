export interface Categoria {
    id: number;
    nome: string;
    saldo_atual: number;
    tipo: string;
    cor: string;
    created_at: Date;
    updated_at: Date;
}
export interface CreateCategoriaDto {
    nome: string;
    tipo: string;
    cor?: string;
    saldo_inicial?: number;
}
export interface UpdateCategoriaDto {
    nome?: string;
    tipo?: string;
    cor?: string;
}

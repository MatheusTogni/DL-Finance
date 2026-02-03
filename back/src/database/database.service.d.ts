import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { QueryResult } from 'pg';
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private pool;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    query(text: string, params?: any[]): Promise<QueryResult>;
}

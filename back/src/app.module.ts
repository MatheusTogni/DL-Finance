import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CategoriasModule } from './categorias/categorias.module';
import { LancamentosModule } from './lancamentos/lancamentos.module';

@Module({
  imports: [DatabaseModule, CategoriasModule, LancamentosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

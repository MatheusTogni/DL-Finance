import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { LancamentosService } from './lancamentos.service';
import type {
  CreateLancamentoDto,
  UpdateLancamentoDto,
} from './lancamentos.interface';

@Controller('lancamentos')
export class LancamentosController {
  constructor(private readonly lancamentosService: LancamentosService) {}

  @Get()
  findAll(@Query('categoria_id') categoriaId?: string) {
    if (categoriaId) {
      return this.lancamentosService.findByCategoria(parseInt(categoriaId));
    }
    return this.lancamentosService.findAll();
  }

  @Get('estatisticas')
  getEstatisticas() {
    return this.lancamentosService.getEstatisticas();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lancamentosService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateLancamentoDto) {
    return this.lancamentosService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLancamentoDto,
  ) {
    return this.lancamentosService.update(id, updateDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.lancamentosService.delete(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import type {
  CreateCategoriaDto,
  UpdateCategoriaDto,
} from './categorias.interface';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get('resumo')
  getResumo() {
    return this.categoriasService.getResumo();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateCategoriaDto) {
    return this.categoriasService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(id, updateDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.delete(id);
  }
}

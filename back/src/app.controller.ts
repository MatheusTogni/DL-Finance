import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    const startTime = Date.now();
    let dbStatus = 'disconnected';
    let dbResponseTime = 0;

    try {
      const dbStart = Date.now();
      await this.databaseService.query('SELECT 1');
      dbResponseTime = Date.now() - dbStart;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
      },
    };
  }
}

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const expressApp = express();
let cachedApp;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    // Configurar CORS
    app.enableCors({
      origin: ['https://dl-finance-pi.vercel.app', 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
      exposedHeaders: ['Content-Type'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    await app.init();
    cachedApp = app;
  }
  return expressApp;
}

module.exports = async (req, res) => {
  await bootstrap();
  return expressApp(req, res);
};

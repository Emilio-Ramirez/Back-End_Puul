import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initialize Prisma Client
  const prisma = new PrismaClient();

  try {
    // Attempt to connect to the database
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  } finally {
    // Disconnect Prisma Client
    await prisma.$disconnect();
  }

  await app.listen(3000);
}
bootstrap();

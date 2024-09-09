import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [UsersModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

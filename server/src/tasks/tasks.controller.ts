import { Controller, Get, Post, Put, Delete, Body, Param, Query, NotFoundException, InternalServerErrorException, UseFilters, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { Task } from './task.model';
import { PrismaExceptionFilter } from '../shared/prisma-exception.filter';

@ApiTags('tasks')
@Controller('tasks')
@UseFilters(PrismaExceptionFilter)
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) { }

  @Post()
  @ApiOperation({ summary: 'Create task' })
  @ApiResponse({ status: 201, description: 'The task has been successfully created.', type: Task })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async create(@Body() createTaskDto: CreateTaskDto) {
    try {
      return await this.tasksService.create(createTaskDto);
    } catch (error) {
      this.logger.error(`Failed to create task: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to create task: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with filters' })
  @ApiResponse({ status: 200, description: 'Return all tasks.', type: [Task] })
  async findAll(@Query() filterDto: TaskFilterDto) {
    return this.tasksService.findAll(filterDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'The task has been successfully updated.', type: Task })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    try {
      return await this.tasksService.update(+id, updateTaskDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200, description: 'The task has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async remove(@Param('id') id: string) {
    try {
      return await this.tasksService.remove(+id);
    } catch (error) {
      this.logger.error(`Failed to delete task: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to delete task: ${error.message}`);
    }
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get task analytics' })
  @ApiResponse({ status: 200, description: 'Return task analytics.' })
  async getAnalytics() {
    try {
      return await this.tasksService.getAnalytics();
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}

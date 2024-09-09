import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) { }

  async create(createTaskDto: CreateTaskDto) {
    try {
      const { assignedUserIds, ...taskData } = createTaskDto;
      this.logger.log(`Creating task: ${JSON.stringify(createTaskDto)}`);

      const result = await this.prisma.task.create({
        data: {
          ...taskData,
          users: {
            create: assignedUserIds.map(userId => ({ userId }))
          }
        },
        include: { users: true }
      });

      this.logger.log(`Task created successfully: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating task: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to create task: ${error.message}`);
    }
  }

  async findAll(filterDto: TaskFilterDto) {
    const { dueDate, title, assignedUserId, userNameOrEmail } = filterDto;
    return this.prisma.task.findMany({
      where: {
        dueDate: dueDate,
        title: title ? { contains: title } : undefined,
        users: assignedUserId ? { some: { userId: assignedUserId } } : undefined,
        OR: userNameOrEmail ? [
          { users: { some: { user: { name: { contains: userNameOrEmail } } } } },
          { users: { some: { user: { email: { contains: userNameOrEmail } } } } }
        ] : undefined
      },
      include: { users: { include: { user: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const { assignedUserIds, ...taskData } = updateTaskDto;
    try {
      return await this.prisma.task.update({
        where: { id },
        data: {
          ...taskData,
          users: assignedUserIds ? {
            deleteMany: {},
            create: assignedUserIds.map(userId => ({ userId }))
          } : undefined
        },
        include: { users: true }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.task.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      throw error;
    }
  }

  async getAnalytics() {
    const totalTasks = await this.prisma.task.count();
    const completedTasks = await this.prisma.task.count({ where: { status: 'COMPLETED' } });
    const averageEstimatedHours = await this.prisma.task.aggregate({
      _avg: { estimatedHours: true }
    });

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
      averageEstimatedHours: averageEstimatedHours._avg.estimatedHours || 0
    };
  }
}

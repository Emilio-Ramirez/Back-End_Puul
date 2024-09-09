import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { startOfDay, endOfDay } from 'date-fns';
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) { }

  async create(createTaskDto: CreateTaskDto) {
    const { assignedUserIds, ...taskData } = createTaskDto;
    this.logger.log(`Creating task: ${JSON.stringify(createTaskDto)}`);

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const task = await prisma.task.create({
          data: {
            ...taskData,
            users: {
              create: assignedUserIds.map(userId => ({ userId }))
            }
          },
          include: { users: true }
        });

        if (task.status === 'COMPLETED') {
          await Promise.all(assignedUserIds.map(userId =>
            prisma.user.update({
              where: { id: userId },
              data: {
                completedTasksCount: { increment: 1 },
                totalTasksCost: { increment: task.cost }
              }
            })
          ));
        }

        return task;
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

    let where: any = {};

    if (dueDate) {
      where.dueDate = {
        gte: startOfDay(new Date(dueDate)),
        lte: endOfDay(new Date(dueDate))
      };
    }

    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    if (assignedUserId) {
      where.users = { some: { userId: assignedUserId } };
    }

    if (userNameOrEmail) {
      where.users = {
        some: {
          user: {
            OR: [
              { name: { contains: userNameOrEmail, mode: 'insensitive' } },
              { email: { contains: userNameOrEmail, mode: 'insensitive' } }
            ]
          }
        }
      };
    }

    return this.prisma.task.findMany({
      where,
      include: {
        users: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const { assignedUserIds, ...taskData } = updateTaskDto;

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const oldTask = await prisma.task.findUnique({
          where: { id },
          include: { users: true }
        });

        if (!oldTask) {
          throw new NotFoundException(`Task with ID ${id} not found`);
        }

        const updatedTask = await prisma.task.update({
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

        // Handle status change
        if (oldTask.status !== updatedTask.status) {
          if (updatedTask.status === 'COMPLETED') {
            await Promise.all(updatedTask.users.map(ut =>
              prisma.user.update({
                where: { id: ut.userId },
                data: {
                  completedTasksCount: { increment: 1 },
                  totalTasksCost: { increment: updatedTask.cost }
                }
              })
            ));
          } else if (oldTask.status === 'COMPLETED') {
            await Promise.all(oldTask.users.map(ut =>
              prisma.user.update({
                where: { id: ut.userId },
                data: {
                  completedTasksCount: { decrement: 1 },
                  totalTasksCost: { decrement: oldTask.cost }
                }
              })
            ));
          }
        }

        return updatedTask;
      });

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating task: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to update task: ${error.message}`);
    }
  }
  async remove(id: number) {
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const task = await prisma.task.findUnique({
          where: { id },
          include: { users: true }
        });

        if (!task) {
          throw new NotFoundException(`Task with ID ${id} not found`);
        }

        // If the task was completed, update user statistics
        if (task.status === 'COMPLETED') {
          await Promise.all(task.users.map(ut =>
            prisma.user.update({
              where: { id: ut.userId },
              data: {
                completedTasksCount: { decrement: 1 },
                totalTasksCost: { decrement: task.cost }
              }
            })
          ));
        }

        // Delete related UserTask records
        await prisma.userTask.deleteMany({
          where: { taskId: id }
        });

        // Delete the task
        await prisma.task.delete({ where: { id } });

        return { message: `Task with ID ${id} has been successfully deleted` };
      });

      return result;
    } catch (error) {
      this.logger.error(`Error deleting task: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to delete task: ${error.message}`);
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

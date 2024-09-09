import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: createUserDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findAll(filterDto: UserFilterDto) {
    const { name, email, role } = filterDto;

    const users = await this.prisma.user.findMany({
      where: {
        name: name ? { contains: name, mode: 'insensitive' } : undefined,
        email: email ? { contains: email, mode: 'insensitive' } : undefined,
        role: role,
      },
      include: {
        tasks: {
          include: {
            task: true
          }
        }
      }
    });

    return users.map(user => {
      const completedTasks = user.tasks.filter(ut => ut.task.status === 'COMPLETED');
      const totalTasksCost = completedTasks.reduce((sum, ut) => sum + ut.task.cost, 0);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        completedTasksCount: completedTasks.length,
        totalTasksCost
      };
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Add update and delete methods with error handling
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsEnum, IsArray } from 'class-validator';
import { TaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({ example: 'Hacer comida', description: 'The title of the task' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Sopa con verduras', description: 'A detailed description of the task' })
  @IsString()
  description: string;

  @ApiProperty({ example: 2, description: 'Estimated hours to complete the task' })
  @IsNumber()
  estimatedHours: number;

  @ApiProperty({ example: '2024-09-15T00:00:00Z', description: 'The due date of the task' })
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.ACTIVE, description: 'The current status of the task' })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiProperty({ example: 200, description: 'The monetary cost associated with the task' })
  @IsNumber()
  cost: number;

  @ApiProperty({ type: [Number], example: [1, 4], description: 'Array of user IDs assigned to this task' })
  @IsArray()
  @IsNumber({}, { each: true })
  assignedUserIds: number[];
}

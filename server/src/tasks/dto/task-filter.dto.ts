import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class TaskFilterDto {
  @ApiPropertyOptional({ description: 'Filter by due date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @ApiPropertyOptional({ description: 'Filter by task name' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Filter by assigned user ID' })
  @IsOptional()
  @IsNumber()
  assignedUserId?: number;

  @ApiPropertyOptional({ description: 'Filter by user name or email' })
  @IsOptional()
  @IsString()
  userNameOrEmail?: string;
}

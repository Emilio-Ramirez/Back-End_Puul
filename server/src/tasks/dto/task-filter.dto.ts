import { IsOptional, IsString, IsDate, IsNumber } from 'class-validator';

export class TaskFilterDto {
  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  assignedUserId?: number;

  @IsOptional()
  @IsString()
  userNameOrEmail?: string;
}

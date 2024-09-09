import { IsOptional, IsString, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UserFilterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

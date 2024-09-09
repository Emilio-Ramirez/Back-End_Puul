import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  completedTasksCount: number;

  @ApiProperty()
  totalTasksCost: number;
}

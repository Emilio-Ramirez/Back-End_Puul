import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';

export class Task {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  estimatedHours: number;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty()
  cost: number;

  @ApiProperty({ type: [Number] })
  assignedUserIds: number[];
}

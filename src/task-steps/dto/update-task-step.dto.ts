import { IsEnum, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

import { CreateTaskStepDto } from './create-task-step.dto.js';
import { TaskStepStatus } from '../entities/task-step.entity.js';
import { IsInt, Min } from 'class-validator';

export class UpdateTaskStepDto extends PartialType(
  CreateTaskStepDto,
) {
    
  @IsOptional()
  @IsEnum(TaskStepStatus)
  status?: TaskStepStatus;

    @IsOptional()
  @IsInt()
  @Min(0)
  actualSeconds?: number;
}
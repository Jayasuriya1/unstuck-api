import { PartialType } from '@nestjs/mapped-types';

import { CreateTaskStepDto } from './create-task-step.dto.js';

export class UpdateTaskStepDto extends PartialType(
    CreateTaskStepDto,
) {}
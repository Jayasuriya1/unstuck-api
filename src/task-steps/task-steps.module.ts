import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskStep } from './entities/task-step.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([TaskStep])],
})
export class TaskStepsModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';

import { Task } from '../tasks/entities/task.entity.js';
import { TaskStep } from '../task-steps/entities/task-step.entity.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskStep]),
    AuthModule,
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
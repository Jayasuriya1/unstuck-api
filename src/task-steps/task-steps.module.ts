import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from '../tasks/entities/task.entity.js';
import { TaskStep } from './entities/task-step.entity.js';
import { TaskStepsService } from './task-steps.service.js';
import { TaskStepsController } from './task-steps.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Task,
            TaskStep,
        ]),
        AuthModule,
    ],

    controllers: [TaskStepsController],
    providers: [TaskStepsService],
})
export class TaskStepsModule {}
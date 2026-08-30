import {
    Body,
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { CreateTaskStepDto } from './dto/create-task-step.dto.js';
import { TaskStepsService } from './task-steps.service.js';
import { UpdateTaskStepDto } from './dto/update-task-step.dto.js';

interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
    };
}

@Controller('tasks/:taskId/steps')
@UseGuards(JwtAuthGuard)
export class TaskStepsController {
    constructor(
        private readonly taskStepsService: TaskStepsService,
    ) { }

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param('taskId') taskId: string,
        @Body() dto: CreateTaskStepDto,
    ) {
        return this.taskStepsService.create(
            request.user.userId,
            taskId,
            dto,
        );
    }

    @Get()
    findAll(
        @Req() request: AuthenticatedRequest,
        @Param('taskId') taskId: string,
    ) {
        return this.taskStepsService.findAll(
            request.user.userId,
            taskId,
        );
    }

    @Patch(':stepId')
    update(
        @Req() request: AuthenticatedRequest,
        @Param('taskId') taskId: string,
        @Param('stepId') stepId: string,
        @Body() dto: UpdateTaskStepDto,
    ) {
        return this.taskStepsService.update(
            request.user.userId,
            taskId,
            stepId,
            dto,
        );
    }

    @Delete(':stepId')
    remove(
        @Req() request: AuthenticatedRequest,
        @Param('taskId') taskId: string,
        @Param('stepId') stepId: string,
    ) {
        return this.taskStepsService.remove(
            request.user.userId,
            taskId,
            stepId,
        );
    }
}
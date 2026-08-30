import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TasksService } from './tasks.service.js';

interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
    };
}

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(
        private readonly tasksService: TasksService,
    ) {}

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Body() dto: CreateTaskDto,
    ) {
        return this.tasksService.create(
            request.user.userId,
            dto,
        );
    }

    @Get()
    findAll(
        @Req() request: AuthenticatedRequest,
    ) {
        return this.tasksService.findAll(
            request.user.userId,
        );
    }

    @Get(':id')
    findOne(
        @Req() request: AuthenticatedRequest,
        @Param('id') taskId: string,
    ) {
        return this.tasksService.findOne(
            request.user.userId,
            taskId,
        );
    }

    @Patch(':id')
    update(
        @Req() request: AuthenticatedRequest,
        @Param('id') taskId: string,
        @Body() dto: UpdateTaskDto,
    ) {
        return this.tasksService.update(
            request.user.userId,
            taskId,
            dto,
        );
    }

    @Delete(':id')
    remove(
        @Req() request: AuthenticatedRequest,
        @Param('id') taskId: string,
    ) {
        return this.tasksService.remove(
            request.user.userId,
            taskId,
        );
    }
}
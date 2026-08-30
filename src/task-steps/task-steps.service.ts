import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from '../tasks/entities/task.entity.js';
import { TaskStep } from './entities/task-step.entity.js';
import { CreateTaskStepDto } from './dto/create-task-step.dto.js';
import { UpdateTaskStepDto } from './dto/update-task-step.dto.js';

@Injectable()
export class TaskStepsService {
    constructor(
        @InjectRepository(TaskStep)
        private readonly stepRepository: Repository<TaskStep>,

        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
    ) { }

    async create(
        userId: string,
        taskId: string,
        dto: CreateTaskStepDto,
    ) {
        const task = await this.taskRepository.findOne({
            where: {
                id: taskId,
                userId,
            },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        const step = this.stepRepository.create({
            title: dto.title,
            description: dto.description ?? null,
            estimatedSeconds: dto.estimatedSeconds ?? null,
            position: dto.position,
            taskId,
            parentStepId: dto.parentStepId ?? null,
        });

        return this.stepRepository.save(step);
    }

    async findAll(
        userId: string,
        taskId: string,
    ) {
        const task = await this.taskRepository.findOne({
            where: {
                id: taskId,
                userId,
            },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return this.stepRepository.find({
            where: {
                taskId,
            },
            order: {
                position: 'ASC',
            },
        });
    }

    async update(
        userId: string,
        taskId: string,
        stepId: string,
        dto: UpdateTaskStepDto,
    ) {
        // 1. Verify that the task belongs to the logged-in user
        const task = await this.taskRepository.findOne({
            where: {
                id: taskId,
                userId,
            },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        // 2. Find the step inside that task
        const step = await this.stepRepository.findOne({
            where: {
                id: stepId,
                taskId,
            },
        });

        if (!step) {
            throw new NotFoundException('Task step not found');
        }

        // 3. Update only the fields provided
        Object.assign(step, dto);

        return this.stepRepository.save(step);
    }

    async remove(
        userId: string,
        taskId: string,
        stepId: string,
    ) {
        // 1. Verify task ownership
        const task = await this.taskRepository.findOne({
            where: {
                id: taskId,
                userId,
            },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        // 2. Find the step belonging to that task
        const step = await this.stepRepository.findOne({
            where: {
                id: stepId,
                taskId,
            },
        });

        if (!step) {
            throw new NotFoundException('Task step not found');
        }

        await this.stepRepository.remove(step);

        return {
            message: 'Task step deleted successfully',
        };
    }
}
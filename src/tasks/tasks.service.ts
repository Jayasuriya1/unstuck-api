import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from './entities/task.entity.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
    ) {}

    async create(
        userId: string,
        dto: CreateTaskDto,
    ) {
        const task = this.taskRepository.create({
            ...dto,
            userId,
        });

        return this.taskRepository.save(task);
    }

    async findAll(userId: string) {
        return this.taskRepository.find({
            where: {
                userId,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async findOne(
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

        return task;
    }

    async update(
        userId: string,
        taskId: string,
        dto: UpdateTaskDto,
    ) {
        const task = await this.findOne(
            userId,
            taskId,
        );

        Object.assign(task, dto);

        return this.taskRepository.save(task);
    }

    async remove(
        userId: string,
        taskId: string,
    ) {
        const task = await this.findOne(
            userId,
            taskId,
        );

        await this.taskRepository.remove(task);

        return {
            message: 'Task deleted successfully',
        };
    }
}
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import type { User } from '../../users/entities/user.entity.js';
import type { TaskStep } from '../../task-steps/entities/task-step.entity.js';

export enum TaskStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    ARCHIVED = 'archived',
}

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        length: 255,
    })
    title: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description: string | null;

    @Column({
        name: 'overwhelm_level',
        type: 'smallint',
    })
    overwhelmLevel: number;

    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.ACTIVE,
    })
    status: TaskStatus;

    @ManyToOne('User', 'tasks', {
        onDelete: 'CASCADE',
    })
    user: User;

    @Column({
        name: 'user_id',
        type: 'uuid',
    })
    userId: string;

    @OneToMany('TaskStep', 'task')
    steps: TaskStep[];

    @CreateDateColumn({
        name: 'created_at',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
    })
    updatedAt: Date;
}
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    JoinColumn
} from 'typeorm';

import type { Task } from '../../tasks/entities/task.entity.js';

export enum TaskStepStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    PARKED = 'parked',
}

@Entity('task_steps')
@Index(['taskId'])
@Index(['parentStepId'])
export class TaskStep {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        length: 500,
    })
    title: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description: string | null;

    @Column({
        type: 'enum',
        enum: TaskStepStatus,
        default: TaskStepStatus.PENDING,
    })
    status: TaskStepStatus;

    @Column({
        name: 'estimated_seconds',
        type: 'integer',
        nullable: true,
    })
    estimatedSeconds: number | null;

    @Column({
        name: 'actual_seconds',
        type: 'integer',
        nullable: true,
    })
    actualSeconds: number | null;

    @Column({
        type: 'integer',
        default: 1,
    })
    depth: number;

    @Column({
        type: 'integer',
    })
    position: number;

    @ManyToOne('Task', 'steps', {
        onDelete: 'CASCADE',
    })
    task: Task;

    @Column({
        name: 'task_id',
        type: 'uuid',
    })
    taskId: string;

    @ManyToOne(
        () => TaskStep,
        (step) => step.children,
        {
            nullable: true,
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({
        name: 'parent_step_id',
    })
    parentStep: TaskStep | null;

    @Column({
        name: 'parent_step_id',
        type: 'uuid',
        nullable: true,
    })
    parentStepId: string | null;

    @OneToMany(() => TaskStep, (step) => step.parentStep)
    children: TaskStep[];

    @Column({
        name: 'ai_deconstructed',
        type: 'boolean',
        default: false,
    })
    aiDeconstructed: boolean;

    @CreateDateColumn({
        name: 'created_at',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
    })
    updatedAt: Date;
}
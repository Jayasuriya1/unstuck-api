import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import type { Task } from '../../tasks/entities/task.entity.js';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        unique: true,
        length: 255,
    })
    email: string;

    @Column({
        name: 'password_hash',
    })
    passwordHash: string;

    @Column({
        name: 'password_reset_token_hash',
        type: 'varchar',
        nullable: true,
    })
    passwordResetTokenHash: string | null;

    @Column({
        name: 'password_reset_expires_at',
        type: 'timestamp',
        nullable: true,
    })
    passwordResetExpiresAt: Date | null;

    @OneToMany('Task', 'user')
    tasks: Task[];

    @CreateDateColumn({
        name: 'created_at',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
    })
    updatedAt: Date;
}
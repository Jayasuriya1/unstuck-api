import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

import {
    createHash,
    randomBytes,
} from 'node:crypto';

import {
    ConfigService,
} from '@nestjs/config';

import {
    MailService,
} from './mail.service.js';

import {
    ForgotPasswordDto,
} from './dto/forgot-password.dto.js';

import {
    ResetPasswordDto,
} from './dto/reset-password.dto.js';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
    ) { }

    async register(dto: RegisterDto) {
        const existingUser = await this.userRepository.findOne({
            where: {
                email: dto.email,
            },
        });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        const passwordHash = await argon2.hash(dto.password);

        const user = this.userRepository.create({
            email: dto.email,
            passwordHash,
        });

        const savedUser = await this.userRepository.save(user);

        return {
            id: savedUser.id,
            email: savedUser.email,
        };
    }

    async login(dto: LoginDto) {
        const user = await this.userRepository.findOne({
            where: {
                email: dto.email,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordValid = await argon2.verify(
            user.passwordHash,
            dto.password,
        );

        if (!passwordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
            email: user.email,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
        };
    }

    async forgotPassword(
        dto: ForgotPasswordDto,
    ) {
        const user =
            await this.userRepository.findOne({
                where: {
                    email: dto.email,
                },
            });

        // Always return the same response.
        // Do not reveal whether the email exists.
        if (!user) {
            return {
                message:
                    'If an account exists for this email, a reset link has been sent.',
            };
        }

        const resetToken =
            randomBytes(32).toString('hex');

        const resetTokenHash =
            createHash('sha256')
                .update(resetToken)
                .digest('hex');

        const resetExpiresAt =
            new Date(
                Date.now() +
                15 * 60 * 1000,
            );

        user.passwordResetTokenHash =
            resetTokenHash;

        user.passwordResetExpiresAt =
            resetExpiresAt;

        await this.userRepository.save(user);

        const frontendUrl =
            this.configService.getOrThrow<string>(
                'FRONTEND_URL',
            );

        const resetUrl =
            `${frontendUrl}/reset-password?token=${resetToken}`;

        await this.mailService.sendPasswordResetEmail(
            user.email,
            resetUrl,
        );

        return {
            message:
                'If an account exists for this email, a reset link has been sent.',
        };
    }

    async resetPassword(
        dto: ResetPasswordDto,
    ) {
        const tokenHash =
            createHash('sha256')
                .update(dto.token)
                .digest('hex');

        const user =
            await this.userRepository.findOne({
                where: {
                    passwordResetTokenHash:
                        tokenHash,
                },
            });

        if (!user) {
            throw new UnauthorizedException(
                'Invalid or expired reset link',
            );
        }

        if (
            !user.passwordResetExpiresAt ||
            user.passwordResetExpiresAt.getTime() <
            Date.now()
        ) {
            throw new UnauthorizedException(
                'Invalid or expired reset link',
            );
        }

        const passwordHash =
            await argon2.hash(
                dto.newPassword,
            );

        user.passwordHash =
            passwordHash;

        // Make the token single-use.
        user.passwordResetTokenHash =
            null;

        user.passwordResetExpiresAt =
            null;

        await this.userRepository.save(user);

        return {
            message:
                'Password reset successfully.',
        };
    }
}
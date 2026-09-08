import {
    Injectable,
} from '@nestjs/common';

import {
    ConfigService,
} from '@nestjs/config';

import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly transporter;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.transporter =
            nodemailer.createTransport({
                host: this.configService.getOrThrow<string>(
                    'SMTP_HOST',
                ),

                port: Number(
                    this.configService.getOrThrow<string>(
                        'SMTP_PORT',
                    ),
                ),

                secure: false,

                auth: {
                    user: this.configService.getOrThrow<string>(
                        'SMTP_USER',
                    ),

                    pass: this.configService.getOrThrow<string>(
                        'SMTP_PASSWORD',
                    ),
                },
            });
    }

    async sendPasswordResetEmail(
        email: string,
        resetUrl: string,
    ) {
        await this.transporter.sendMail({
            from: this.configService.getOrThrow<string>(
                'SMTP_USER',
            ),

            to: email,

            subject:
                'Reset your Unstuck password',

            text: [
                'You requested a password reset for your Unstuck account.',
                '',
                `Reset your password here: ${resetUrl}`,
                '',
                'This link expires in 15 minutes.',
                '',
                'If you did not request this, you can ignore this email.',
            ].join('\n'),
        });
    }
}
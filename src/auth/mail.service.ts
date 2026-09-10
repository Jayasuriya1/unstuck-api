import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );
  }

  async sendPasswordResetEmail(
    email: string,
    resetUrl: string,
  ) {
    const fromEmail =
      this.configService.get<string>('MAIL_FROM') ??
      'onboarding@resend.dev';

    await this.resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset your Unstuck password',
      html: `
        <h2>Reset your password</h2>

        <p>You requested a password reset for your Unstuck account.</p>

        <p>
          <a href="${resetUrl}">
            Reset your password
          </a>
        </p>

        <p>This link will expire in 15 minutes.</p>

        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    });
  }
}
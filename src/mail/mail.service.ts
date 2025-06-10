import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT'),
      secure: config.get<boolean>('SMTP_SECURE'), // true for 465, false for other ports
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendOtpEmail(to: string, otpCode: string): Promise<void> {
    const fromAddress = this.config.get<string>('SMTP_FROM');

    const mailOtions = {
      from: fromAddress,
      to,
      subject: 'Your One-Time Authentication Code',
      text: `Your verification code is ${otpCode}. It will expire in ${this.config.get<number>('OTP_EXPIRY_MINUTES')} minutes.`,
      html: `<p>Your verification code is <b>${otpCode}</b>.</p>
             <p>This code will expire in ${this.config.get<number>('OTP_EXPIRY_MINUTES')} minutes.</p>`,
    };

    try {
      await this.transporter.sendMail(mailOtions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({
    example: 'dev@example.com',
    description: 'Developer email to send OTP to',
  })
  @IsEmail()
  email!: string;
}

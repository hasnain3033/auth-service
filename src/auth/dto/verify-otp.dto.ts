import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: 'dev@example.com', description: 'Developer email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code' })
  @IsString()
  @Length(6, 6)
  otp!: string;
}

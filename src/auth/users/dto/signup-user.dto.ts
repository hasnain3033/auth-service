import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class SignupUserDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  appId!: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+1-202-555-0147' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'superSecret123' })
  @IsString()
  @MinLength(8)
  password!: string;
}
